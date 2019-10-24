FROM eosio/eosio-web-ide:v0.1.0

USER root

RUN echo "INSTALLING EOSIO AND CDT" \
 && apt-get update -y \
 && apt-get install -y wget sudo curl \
 && wget https://github.com/EOSIO/eosio.cdt/releases/download/v1.6.1/eosio.cdt_1.6.1-1_amd64.deb \
 && apt-get update && sudo apt install -y --allow-downgrades ./eosio.cdt_1.6.1-1_amd64.deb \
 && wget https://github.com/EOSIO/eos/releases/download/v1.7.3/eosio_1.7.3-1-ubuntu-18.04_amd64.deb \
 && apt-get update && sudo apt install -y ./eosio_1.7.3-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio_1.7.3-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio.cdt_1.6.1-1_amd64.deb

RUN echo "INSTALLING CONTRACTS" \
 && mkdir -p /opt/eosio/bin/contracts

RUN echo "INSTALLING EOSIO.CONTRACTS" \
 && wget https://github.com/EOSIO/eosio.contracts/archive/v1.6.0.tar.gz \
 && mkdir -p /eosio.contracts \
 && tar xvzf ./v1.6.0.tar.gz -C /eosio.contracts \
 && mv /eosio.contracts/eosio.contracts-1.6.0 /opt/eosio/bin/contracts \
 && mv /opt/eosio/bin/contracts/eosio.contracts-1.6.0 /opt/eosio/bin/contracts/eosio.contracts \
 && rm -rf /eosio.contracts \
 && rm ./v1.6.0.tar.gz

RUN echo "INSTALLING EOSIO.ASSERT CONTRACT" \
 && wget https://github.com/EOSIO/eosio.assert/archive/v0.1.0.tar.gz \
 && mkdir -p /eosio.assert \
 && tar xvzf ./v0.1.0.tar.gz -C /eosio.assert \
 && mv /eosio.assert/eosio.assert-0.1.0 /opt/eosio/bin/contracts \
 && mv /opt/eosio/bin/contracts/eosio.assert-0.1.0 /opt/eosio/bin/contracts/eosio.assert \
 && rm -rf /eosio.assert \
 && rm ./v0.1.0.tar.gz

RUN echo "COPYING APP CONTRACTS" \
# This must be done here (and not during gitpod because user won't have sufficient privileges then)
 && git clone https://github.com/EOSIO/tropical-example-web-app.git \
 && cp -R ./tropical-example-web-app/eosio/* /opt/eosio/bin/ \
 && rm -rf ./tropical-example-web-app

RUN echo "COPYING EOSIO.TOKEN RICARDIAN CONTRACT" \
 && cp /opt/eosio/bin/contracts/eosio.token/eosio.token.contracts.md /opt/eosio/bin/contracts/eosio.contracts/contracts/eosio.token/src

RUN echo "DEPLOYING CONTRACTS" \
 && mkdir -p "/opt/eosio/bin/config-dir"
RUN ["/bin/bash", "-c", "/bin/bash /opt/eosio/bin/scripts/deploy_contracts.sh"]