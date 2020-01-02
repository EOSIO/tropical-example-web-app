#!/usr/bin/env bash
NODEOS_RUNNING=$1
RUNNING_IN_GITPOD=$2

set -m

# CAUTION: Never use these development keys for a production account!
# Doing so will most certainly result in the loss of access to your account, these private keys are publicly known.
SYSTEM_ACCOUNT_PRIVATE_KEY="5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
SYSTEM_ACCOUNT_PUBLIC_KEY="EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"

TROPICAL_EXAMPLE_ACCOUNT_PRIVATE_KEY="5Jh6jf9g1UzcWrMMsgqd5GrTCgzeKkh5yT7EUZbiU7wB7k4Ayx1"
TROPICAL_EXAMPLE_ACCOUNT_PUBLIC_KEY="EOS6bRs6knaaHyvpVXd5EgAPoxrZkkeDv89M1jidHCt86W5rkwr1q"

EXAMPLE_ACCOUNT_PRIVATE_KEY="5KkXYBUb7oXrq9cvEYT3HXsoHvaC2957VKVftVRuCy7Z7LyUcQB"
EXAMPLE_ACCOUNT_PUBLIC_KEY="EOS6TWM95TUqpgcjYnvXSK5kBsi6LryWRxmcBaULVTvf5zxkaMYWf"

if [ -z "$RUNNING_IN_GITPOD" ]; then
  echo "Running locally..."
  ROOT_DIR="/opt"
  CONTRACTS_DIR="$ROOT_DIR/eosio/bin/contracts"
  BLOCKCHAIN_DATA_DIR=/root/.local/share
  BLOCKCHAIN_CONFIG_DIR=/opt/eosio/bin/config-dir
else
  echo "Running in Gitpod..."
  ROOT_DIR="/home/gitpod"
  CONTRACTS_DIR="$ROOT_DIR/contracts"
  BLOCKCHAIN_DATA_DIR=$ROOT_DIR/eosio/chain/data
  BLOCKCHAIN_CONFIG_DIR=$ROOT_DIR/eosio/chain/config
fi

mkdir -p $ROOT_DIR/bin

# Set PATH
PATH="$PATH:$ROOT_DIR/bin:$ROOT_DIR/bin/scripts"
GITPOD_WORKSPACE_ROOT="/workspace/tropical-example-web-app"
WALLET_DIR="$ROOT_DIR/wallet/"
CONFIG_DIR="$ROOT_DIR/bin/config-dir"

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

function post_preactivate {
  curl -X POST http://127.0.0.1:8888/v1/producer/schedule_protocol_feature_activations -d '{"protocol_features_to_activate": ["0ec7e080177b2c02b278d5088611686b49d739925a92d9bfcacd7fc6b74053bd"]}'
}

# $1 feature disgest to activate
function activate_feature {
  cleos push action eosio activate '["'"$1"'"]' -p eosio
  if [ $? -ne 0 ]; then
    exit 1
  fi
}

# $1 account name
# $2 contract directory
# $3 wasm file name
# $4 abi file name
function setcode {
  retry_count="4"

  while [ $retry_count -gt 0 ]; do
    cleos set contract $1 $2 $3 $4 -p $1@active
    if [ $? -eq 0 ]; then
      break
    fi

    echo "setcode failed retrying..."
    sleep 1s
    retry_count=$[$retry_count-1]
  done

  if [ $retry_count -eq 0 ]; then
    echo "setcode failed too many times, bailing."
    exit 1
  fi
}

# $1 - parent folder where smart contract directory is located
# $2 - smart contract name
# $3 - account name
function deploy_system_contract {
  # Unlock the wallet, ignore error if already unlocked
  cleos wallet unlock --password $(cat "$CONFIG_DIR"/keys/default_wallet_password.txt) || true

  echo "Deploying the $2 contract in path: $CONTRACTS_DIR/$1/$2/src"

  # Move into contracts /src directory
  cd "$CONTRACTS_DIR/$1/$2/src"

  # Compile the smart contract to wasm and abi files using the EOSIO.CDT (Contract Development Toolkit)
  # https://github.com/EOSIO/eosio.cdt
  eosio-cpp -abigen "$2.cpp" -o "$2.wasm" -I ../include

  # Move back into the executable directory
  cd $CONTRACTS_DIR

  # Set (deploy) the compiled contract to the blockchain
  setcode $3 "$CONTRACTS_DIR/$1/$2/src" "$2.wasm" "$2.abi"
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
    if [ ! -f "$1.wasm" ]; then
      eosio-cpp -abigen "$1.cpp" -o "$1.wasm" -I ./
    else
      echo "Using pre-built contract..."
    fi
  ) &&
  # Move back into the executable directory
  cd $CONTRACTS_DIR

  # Set (deploy) the compiled contract to the blockchain
  setcode $2 "$CONTRACTS_DIR/$1/" "$1.wasm" "$1.abi"

  # Set the root of trust for the contract
  cleos push action $2 setsrvkey '["'"$TROPICAL_EXAMPLE_ACCOUNT_PUBLIC_KEY"'"]' -p $2

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
cd $ROOT_DIR/bin/
mkdir -p $CONFIG_DIR
mkdir -p $BLOCKCHAIN_DATA_DIR
mkdir -p $BLOCKCHAIN_CONFIG_DIR

if [ -z "$NODEOS_RUNNING" ]; then
  echo "Starting the chain for setup"
  nodeos -e -p eosio \
  --data-dir $BLOCKCHAIN_DATA_DIR \
  --config-dir $BLOCKCHAIN_CONFIG_DIR \
  --http-validate-host=false \
  --plugin eosio::producer_api_plugin \
  --plugin eosio::chain_api_plugin \
  --plugin eosio::http_plugin \
  --http-server-address=0.0.0.0:8888 \
  --access-control-allow-origin=* \
  --contracts-console \
  --max-transaction-time=100000 \
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

if [ ! -z "$RUNNING_IN_GITPOD" ]; then
  echo "INSTALLING CONTRACTS"
  mkdir -p $CONTRACTS_DIR
  mkdir -p $ROOT_DIR/downloads

  echo "INSTALLING EOSIO.CONTRACTS"
  wget https://github.com/EOSIO/eosio.contracts/archive/v1.7.0.tar.gz
  mkdir -p $ROOT_DIR/downloads/eosio.contracts
  mkdir -p $CONTRACTS_DIR/eosio.contracts
  tar xvzf ./v1.7.0.tar.gz -C $ROOT_DIR/downloads/eosio.contracts
  mv $ROOT_DIR/downloads/eosio.contracts/eosio.contracts-1.7.0/* $CONTRACTS_DIR/eosio.contracts
  rm -rf $ROOT_DIR/downloads/eosio.contracts
  rm ./v1.7.0.tar.gz

  echo "INSTALLING EOSIO.ASSERT CONTRACT"
  wget https://github.com/EOSIO/eosio.assert/archive/v0.1.0.tar.gz
  mkdir -p $ROOT_DIR/downloads/eosio.assert
  mkdir -p $CONTRACTS_DIR/eosio.assert
  tar xvzf ./v0.1.0.tar.gz -C $ROOT_DIR/downloads/eosio.assert
  mv $ROOT_DIR/downloads/eosio.assert/eosio.assert-0.1.0/* $CONTRACTS_DIR/eosio.assert
  rm -rf $ROOT_DIR/downloads/eosio.assert
  rm ./v0.1.0.tar.gz

  echo "COPYING APP CONTRACT"
  echo "GITPOD_WORKSPACE_ROOT: $GITPOD_WORKSPACE_ROOT"
  cp $GITPOD_WORKSPACE_ROOT/eosio/contracts/eosio.token/eosio.token.contracts.md $CONTRACTS_DIR/eosio.contracts/contracts/eosio.token/src
  mkdir -p $CONTRACTS_DIR/tropical
  cp $GITPOD_WORKSPACE_ROOT/eosio/contracts/tropical/* $CONTRACTS_DIR/tropical/
fi

# preactivate concensus upgrades
post_preactivate

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

# activate Webauthn support
activate_feature "4fca8bd82bbd181e714e283f83e1b45d95ca5af40fb89ad3977b653c448f78c2"

# tropical
create_account tropical $TROPICAL_EXAMPLE_ACCOUNT_PUBLIC_KEY $TROPICAL_EXAMPLE_ACCOUNT_PRIVATE_KEY
deploy_app_contract tropical tropical
transfer_sys_tokens tropical

# example
create_account example $EXAMPLE_ACCOUNT_PUBLIC_KEY $EXAMPLE_ACCOUNT_PRIVATE_KEY
transfer_sys_tokens example

# eosio.assert actions
# Set chain
assert_set_chain "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f" "Local Chain" "8ae3ccb19f3a89a8ea21f6c5e18bd2bc8f00c379411a2d9319985dad2db6243e"

# Register tropical manifest
# If running in Gitpod, we need to alter the URLs
CONTRACT_NAME="tropical"
MANIFEST="[{ "\""contract"\"": "\""tropical"\"",  "\""action"\"": "\""like"\"" },{ "\""contract"\"": "\""tropical"\"",  "\""action"\"": "\""rent"\"" },{ "\""contract"\"": "\""tropical"\"",  "\""action"\"": "\""check2fa"\"" }]"
if [ -z "$RUNNING_IN_GITPOD" ]; then
  APP_DOMAIN="http://localhost:3000"
  APPMETA="http://localhost:3000/app-metadata.json#bc677523fca562e307343296e49596e25cb14aac6b112a9428a42119da9f65fa"
else
  GP_URL=$(gp url 8000)
  APP_DOMAIN="${GP_URL}"
  APPMETA="${GP_URL}/app-metadata.json#bc677523fca562e307343296e49596e25cb14aac6b112a9428a42119da9f65fa"
fi
assert_register_manifest $CONTRACT_NAME $APP_DOMAIN $APPMETA "$MANIFEST"

echo "All done initializing the blockchain"

# If running in Gitpod, we *don't* want to shutdown the blockchain; we'll leave it running in the terminal window.
if [ -z "$RUNNING_IN_GITPOD" ]; then
  if [[ -z $NODEOS_RUNNING ]]; then
    echo "Shut down Nodeos, sleeping for 2 seconds to allow time for at least 4 blocks to be created after deploying contracts"
    sleep 2s
    kill %1
    fg %1
  fi
fi
