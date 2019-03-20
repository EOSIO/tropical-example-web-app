#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>

using namespace eosio;

class tropical : public contract {
  public:
      using contract::contract;

      [[eosio::action]]
      void like( name user ) {
         print( "You've liked a property on chain! ", name{user});
      }
};
EOSIO_DISPATCH(tropical, (like))
