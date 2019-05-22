#!/usr/bin/env bash
set -m

# CAUTION: Never use these development keys for a production account!
# Doing so will most certainly result in the loss of access to your account, these private keys are publicly known.
SYSTEM_ACCOUNT_PRIVATE_KEY="5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
SYSTEM_ACCOUNT_PUBLIC_KEY="EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"

TROPICAL_EXAMPLE_ACCOUNT_PRIVATE_KEY="5Jh6jf9g1UzcWrMMsgqd5GrTCgzeKkh5yT7EUZbiU7wB7k4Ayx1"
TROPICAL_EXAMPLE_ACCOUNT_PUBLIC_KEY="EOS6bRs6knaaHyvpVXd5EgAPoxrZkkeDv89M1jidHCt86W5rkwr1q"

EXAMPLE_ACCOUNT_PRIVATE_KEY="5KkXYBUb7oXrq9cvEYT3HXsoHvaC2957VKVftVRuCy7Z7LyUcQB"
EXAMPLE_ACCOUNT_PUBLIC_KEY="EOS6TWM95TUqpgcjYnvXSK5kBsi6LryWRxmcBaULVTvf5zxkaMYWf"

NODEOS_RUNNING=$1

# Set PATH
PATH="$PATH:/opt/eosio/bin:/opt/eosio/bin/scripts"

ROOT_DIR="/opt/eosio"
WALLET_DIR="$ROOT_DIR/wallet/"
CONFIG_DIR="$ROOT_DIR/bin/config-dir"
CONTRACTS_DIR="$ROOT_DIR/bin/contracts"

function start_wallet {
  echo "Starting the wallet"
  rm -rf $WALLET_DIR
  mkdir -p $WALLET_DIR
  nohup keosd --unlock-timeout 999999999 --wallet-dir $WALLET_DIR --http-server-address 127.0.0.1:8900 2>&1 &
  sleep 1s
  wallet_password=$(cleos wallet create --to-console | awk 'FNR > 3 { print $1 }' | tr -d '"')
  echo $wallet_password > "$CONFIG_DIR"/keys/default_wallet_password.txt

  cleos wallet import --private-key $SYSTEM_ACCOUNT_PRIVATE_KEY
}

# $1 - parent folder where smart contract directory is located
# $2 - smart contract name
# $3 - account name
function deploy_system_contract {
  # Unlock the wallet, ignore error if already unlocked
  cleos wallet unlock --password $(cat "$CONFIG_DIR"/keys/default_wallet_password.txt) || true

  echo "Deploying the $2 contract"

  # Move into contracts /src directory
  cd "$CONTRACTS_DIR/$1/$2/src"

  # Compile the smart contract to wasm and abi files using the EOSIO.CDT (Contract Development Toolkit)
  # https://github.com/EOSIO/eosio.cdt
  eosio-cpp -abigen "$2.cpp" -o "$2.wasm" -I ../include

  # Move back into the executable directory
  cd /opt/eosio/bin/

  # Set (deploy) the compiled contract to the blockchain
  cleos set contract $3 "$CONTRACTS_DIR/$1/$2/src" "$2.wasm" "$2.abi" -p $3@active
}

# $1 - account name
# $2 - public key
# $3 - private key
function create_account {
  cleos wallet import --private-key $3
  cleos create account eosio $1 $2
}

# $1 - smart contract name
# $2 - account name
function deploy_app_contract {
  # Unlock the wallet, ignore error if already unlocked
  cleos wallet unlock --password $(cat "$CONFIG_DIR"/keys/default_wallet_password.txt) || true

  echo "Deploying the $1 contract"

  # Compile the smart contract to wasm and abi files using the EOSIO.CDT (Contract Development Toolkit)
  # https://github.com/EOSIO/eosio.cdt

  # Move into contracts directory
  cd "$CONTRACTS_DIR/$1/"
  (
    eosio-cpp -abigen "$1.cpp" -o "$1.wasm" -I ./
  ) &&
  # Move back into the executable directory
  cd /opt/eosio/bin/

  # Set (deploy) the compiled contract to the blockchain
  cleos set contract $2 "$CONTRACTS_DIR/$1/" -p $2
}

function issue_sys_tokens {
  echo "Issuing SYS tokens"
  cleos push action eosio.token create '["eosio", "10000000000.0000 SYS"]' -p eosio.token
  cleos push action eosio.token issue '["eosio", "5000000000.0000 SYS", "Half of available supply"]' -p eosio
}

# $1 - account name
function transfer_sys_tokens {
  cleos transfer eosio $1 "1000000.0000 SYS"
}

# $1 - chain id
# $2 - chain name
# $3 - icon hash
function assert_set_chain {
  echo "Setting $2 chain"
  cleos push action eosio.assert setchain "[ "\""$1"\"", "\""$2"\"", "\""$3"\"" ]" -p eosio@active
}

# $1 - account name
# $2 - domain
# $3 - appmeta
# $4 - whitelist
function assert_register_manifest {
  echo "Registering $1 manifest"
  cleos push action eosio.assert add.manifest "[ "\""$1"\"", "\""$2"\"", "\""$3"\"", $4 ]" -p $1@active
}

# Move into the executable directory
cd /opt/eosio/bin/

if [[ -z $NODEOS_RUNNING ]]; then
  echo "Starting the chain for setup"
  nodeos -e -p eosio \
  --data-dir /root/.local/share \
  --http-validate-host=false \
  --plugin eosio::producer_plugin \
  --plugin eosio::chain_api_plugin \
  --plugin eosio::http_plugin \
  --http-server-address=0.0.0.0:8888 \
  --access-control-allow-origin=* \
  --contracts-console \
  --verbose-http-errors &
fi

mkdir -p "$CONFIG_DIR"/keys

sleep 1s

echo "Waiting for the chain to finish startup"
until curl localhost:8888/v1/chain/get_info
do
  echo "Still waiting"
  sleep 1s
done

# Sleep for 2s to allow time for 4 blocks to be created so we have blocks to reference when sending transactions
sleep 2s
echo "Creating accounts and deploying contracts"

start_wallet

# Create accounts and deploy contracts
# eosio.assert
create_account eosio.assert $SYSTEM_ACCOUNT_PUBLIC_KEY $SYSTEM_ACCOUNT_PRIVATE_KEY
deploy_system_contract eosio.assert eosio.assert eosio.assert

# eosio.bios
deploy_system_contract eosio.contracts/contracts eosio.bios eosio

# eosio.token
create_account eosio.token $SYSTEM_ACCOUNT_PUBLIC_KEY $SYSTEM_ACCOUNT_PRIVATE_KEY
deploy_system_contract eosio.contracts/contracts eosio.token eosio.token
issue_sys_tokens

# tropical
create_account tropical $TROPICAL_EXAMPLE_ACCOUNT_PUBLIC_KEY $TROPICAL_EXAMPLE_ACCOUNT_PRIVATE_KEY
deploy_app_contract tropical tropical
transfer_sys_tokens tropical

# example
create_account example $EXAMPLE_ACCOUNT_PUBLIC_KEY $EXAMPLE_ACCOUNT_PRIVATE_KEY
transfer_sys_tokens example

# eosio.assert actions
# Set chain
assert_set_chain "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f" "Local Chain" "128321d1e1023f41c35b9d168f0af0090ffb4e1a5d84c275feb1aa8c7a2551da"
# Register tropical manifest
assert_register_manifest "tropical" "http://localhost:3000" "http://localhost:3000/app-metadata.json#2181e099fbfb2908a899136367b68d66810175c703ccfeb3c56540ddd96d9f1f" "[{ "\""contract"\"": "\""tropical"\"",  "\""action"\"": "\""like"\"" }]"


echo "All done initializing the blockchain"

if [[ -z $NODEOS_RUNNING ]]; then
  # Shut down Nodeos, sleep for 2 seconds to allow time for at least 4 blocks to be created after deploying contracts
  sleep 2s
  kill %1
  fg %1
fi
