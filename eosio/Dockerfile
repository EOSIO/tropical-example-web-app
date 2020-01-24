FROM ubuntu:18.04

RUN echo "INSTALLING EOSIO AND CDT"
RUN apt-get update && apt-get install -y wget sudo curl
RUN wget https://github.com/EOSIO/eosio.cdt/releases/download/v1.7.0/eosio.cdt_1.7.0-1-ubuntu-18.04_amd64.deb
RUN apt-get update && sudo apt install -y ./eosio.cdt_1.7.0-1-ubuntu-18.04_amd64.deb
RUN wget https://github.com/EOSIO/eos/releases/download/v2.0.0/eosio_2.0.0-1-ubuntu-18.04_amd64.deb
RUN apt-get update && sudo apt install -y ./eosio_2.0.0-1-ubuntu-18.04_amd64.deb

RUN echo "INSTALLING CONTRACTS"
RUN mkdir -p "/opt/eosio/bin/contracts"

RUN echo "INSTALLING EOSIO.CONTRACTS"
RUN wget https://github.com/EOSIO/eosio.contracts/archive/v1.9.0.tar.gz
RUN mkdir -p /eosio.contracts
RUN tar xvzf ./v1.9.0.tar.gz -C /eosio.contracts
RUN mv /eosio.contracts/eosio.contracts-1.9.0 /opt/eosio/bin/contracts
RUN mv /opt/eosio/bin/contracts/eosio.contracts-1.9.0 /opt/eosio/bin/contracts/eosio.contracts

RUN echo "INSTALLING EOSIO.ASSERT CONTRACT"
RUN wget https://github.com/EOSIO/eosio.assert/archive/v0.1.0.tar.gz
RUN mkdir -p /eosio.assert
RUN tar xvzf ./v0.1.0.tar.gz -C /eosio.assert
RUN mv /eosio.assert/eosio.assert-0.1.0 /opt/eosio/bin/contracts
RUN mv /opt/eosio/bin/contracts/eosio.assert-0.1.0 /opt/eosio/bin/contracts/eosio.assert

RUN echo "COPYING APP CONTRACTS"
COPY ./ /opt/eosio/bin

RUN echo "COPYING EOSIO.TOKEN RICARDIAN CONTRACT"
RUN cp /opt/eosio/bin/contracts/eosio.token/eosio.token.contracts.md /opt/eosio/bin/contracts/eosio.contracts/contracts/eosio.token/src

RUN echo "DEPLOYING CONTRACTS"
RUN mkdir -p "/opt/eosio/bin/config-dir"
RUN /bin/bash /opt/eosio/bin/scripts/deploy_contracts.sh
