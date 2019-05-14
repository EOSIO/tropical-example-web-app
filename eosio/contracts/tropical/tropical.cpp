#include <eosio/eosio.hpp>

using namespace eosio;

CONTRACT tropical : public contract {
  public:
      using contract::contract;

      ACTION like( name user ) {
         print_f("You've liked a property on chain, %!\n", user);
      }
};
