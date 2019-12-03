FROM eosio/eosio-web-ide:v0.1.0

USER root

ENV ROOT_DIR="/home/gitpod"
RUN echo "INSTALLING EOSIO AND CDT" \
 && apt-get update -y \
 && apt-get install -y wget sudo curl \
 && wget https://github.com/EOSIO/eosio.cdt/releases/download/v1.6.1/eosio.cdt_1.6.1-1_amd64.deb \
 && apt-get update && sudo apt install -y --allow-downgrades ./eosio.cdt_1.6.1-1_amd64.deb \
 && wget https://github.com/EOSIO/eos/releases/download/v1.8.6/eosio_1.8.6-1-ubuntu-18.04_amd64.deb \
 && apt-get update && sudo apt install -y ./eosio_1.8.6-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio_1.8.6-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio.cdt_1.6.1-1_amd64.deb
