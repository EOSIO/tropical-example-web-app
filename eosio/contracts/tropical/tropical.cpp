#include <eosio/eosio.hpp>
#include <eosio/crypto.hpp>
#include <eosio/singleton.hpp>
#include <eosio/transaction.hpp>

using namespace eosio;

CONTRACT tropical : public contract {
   public:
      tropical(name self, name first_receiver, datastream<const char*> ds)
      :contract(self, first_receiver, ds)
      ,configuration_singleton(get_self(), get_self().value)
      {}

      ACTION like( name user ) {
         print_f("You've liked a property on chain, %!\n", user);
      }

      /**
       * Global singleton that holds the current "root of trust"
       */
      TABLE config {
         public_key srvkey;

         EOSLIB_SERIALIZE( config, (srvkey) )
      };

      eosio::singleton< "config"_n, config > configuration_singleton;

      /**
       *
       * @param user
       * @param property
       * @return
       */
      ACTION rent( name user, name property ) {
         // enforce that the check2fa action is the first CFA
         //
         auto check2fa_action = get_action(0, 0);

         // unpack the first two parameters
         //
         auto second_factor_params = unpack<std::tuple<name, name, public_key>>(check2fa_action.data);

         // validate that the 2FA was properly sent to this contract
         //
         check(check2fa_action.account == _self, "Malformed 2FA action, wrong account");

         // validate that the 2FA was propertly sent to the `check2fa` context-free action handler
         //
         check(check2fa_action.name == "check2fa"_n, "Malfomed 2FA action, wrong name");

         // validate that the 2FA was for this user and property
         //
         check(std::get<0>(second_factor_params) == user, "Malformed 2FA action, wrong user");
         check(std::get<1>(second_factor_params) == property, "Malfomed 2FA action, wrong property");

         // finally validate that the root of trust, the server_key, matches the chain state
         // this was not possible in a context free action
         //
         auto server_key = configuration_singleton.get().srvkey;
         check(std::get<2>(second_factor_params) == server_key, "Malfomed 2FA action, wrong root of trust");

         print_f("You've rented a % on chain, %!\n", property, user);
      }

      /**
       * Validate that a provided pair of signatures represents the provided user and property names as well as
       * a chain of trust for a user_key that terminates in a server_key
       *
       * This is a context-free action.  This means it cannot access any chain state.  It can only enforce the
       * consistency of the parameters passed to it.  This implies that this action will succeed as long as
       * the user, property, and user_key are attested to by the server_key via various signatures.
       *
       * it *does not* validate the server_key
       *
       * @param user - the name of the user present in this 2fa assertion
       * @param property - the name of the property present in this 2fa assertion
       * @param server_key - the public key that is the root of trust for this assertion
       * @param user_key - a public key, trusted by `server_key`, to be in possessed by `user`
       * @param server_auth - a signature from the `server_key`
       * @param bearer_auth - a signature from the `user_key`
       */
      ACTION check2fa( name user, name property, public_key server_key, public_key user_key, signature server_auth, signature bearer_auth ) {
         // concatenate the serialized user name, property name, and user public key
         // as the "challenge" that the server would have signed
         //
         auto challenge = pack(std::forward_as_tuple(user, property, user_key));

         // hash the "challenge" into a signature digest that both the server and the user's WebAuthn authenticator
         // will sign in order to prove to the chain that there was a valid second factor ceremony
         //
         auto signature_digest = sha256(challenge.data(), challenge.size());

         // verify the provided signature from the server, this is something only an entity in possession of the
         // private `server_key` can have properly generated
         //
         assert_recover_key(signature_digest, server_auth, server_key);

         // verify the provided signature from the bearer, this is something only an entity in possession of the
         // private `user_key` can have properly generated and the `user_key` is attested to by the `server_key`
         // via the challenge digest
         //
         assert_recover_key(signature_digest, bearer_auth, user_key);
      }

      /**
       * Administrative action to set the root of trust, aka server key
       *
       * @param server_key - the public key that is the root of trust for this contract
       */
      ACTION setsrvkey(public_key server_key) {
         require_auth(_self);
         configuration_singleton.set({server_key}, _self);
      }
};
