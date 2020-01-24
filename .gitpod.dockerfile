FROM eosio/eosio-web-ide:v0.1.0

USER root

ENV ROOT_DIR="/home/gitpod"
RUN echo "INSTALLING EOSIO AND CDT" \
 && apt-get update -y \
 && apt-get install -y wget sudo curl \
 && wget https://github.com/EOSIO/eosio.cdt/releases/download/v1.6.3/eosio.cdt_1.6.3-1-ubuntu-18.04_amd64.deb \
 && apt-get update && sudo apt install -y ./eosio.cdt_1.6.3-1-ubuntu-18.04_amd64.deb \
 && wget https://github.com/EOSIO/eos/releases/download/v2.0.0/eosio_2.0.0-1-ubuntu-18.04_amd64.deb \
 && apt-get update && sudo apt install -y ./eosio_2.0.0-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio_2.0.0-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio.cdt_1.6.3-1-ubuntu-18.04_amd64.deb
