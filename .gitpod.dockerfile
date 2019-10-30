FROM eosio/eosio-web-ide:v0.1.0

USER root

ENV ROOT_DIR="/home/gitpod"
RUN echo "INSTALLING EOSIO AND CDT" \
 && apt-get update -y \
 && apt-get install -y wget sudo curl \
 && wget https://github.com/EOSIO/eosio.cdt/releases/download/v1.6.1/eosio.cdt_1.6.1-1_amd64.deb \
 && apt-get update && sudo apt install -y --allow-downgrades ./eosio.cdt_1.6.1-1_amd64.deb \
 && wget https://github.com/EOSIO/eos/releases/download/v1.7.3/eosio_1.7.3-1-ubuntu-18.04_amd64.deb \
 && apt-get update && sudo apt install -y ./eosio_1.7.3-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio_1.7.3-1-ubuntu-18.04_amd64.deb \
 && rm ./eosio.cdt_1.6.1-1_amd64.deb

# RUN echo "INSTALLING CONTRACTS" \
#  && mkdir -p $ROOT_DIR/bin/contracts

# RUN echo "INSTALLING EOSIO.CONTRACTS" \
#  && wget https://github.com/EOSIO/eosio.contracts/archive/v1.6.0.tar.gz \
#  && mkdir -p /eosio.contracts \
#  && tar xvzf ./v1.6.0.tar.gz -C /eosio.contracts \
#  && mv /eosio.contracts/eosio.contracts-1.6.0 $ROOT_DIR/bin/contracts \
#  && mv $ROOT_DIR/bin/contracts/eosio.contracts-1.6.0 $ROOT_DIR/bin/contracts/eosio.contracts \
#  && rm -rf /eosio.contracts \
#  && rm ./v1.6.0.tar.gz

# RUN echo "INSTALLING EOSIO.ASSERT CONTRACT" \
#  && wget https://github.com/EOSIO/eosio.assert/archive/v0.1.0.tar.gz \
#  && mkdir -p /eosio.assert \
#  && tar xvzf ./v0.1.0.tar.gz -C /eosio.assert \
#  && mv /eosio.assert/eosio.assert-0.1.0 $ROOT_DIR/bin/contracts \
#  && mv $ROOT_DIR/bin/contracts/eosio.assert-0.1.0 $ROOT_DIR/bin/contracts/eosio.assert \
#  && rm -rf /eosio.assert \
#  && rm ./v0.1.0.tar.gz

# RUN echo "COPYING APP CONTRACTS AND SCRIPTS" \
# This must be done here (and not during gitpod because user won't have sufficient privileges then)
#  && git clone --single-branch --branch workingInGitpod-simplified https://github.com/EOSIO/tropical-example-web-app.git \
#  && git clone https://github.com/EOSIO/tropical-example-web-app.git \
#  && mkdir -p $ROOT_DIR/eosio \
#  && cp -R ./tropical-example-web-app/eosio/* $ROOT_DIR/eosio/ \
#  && cp ./tropical-example-web-app/public/chain-manifests.json $ROOT_DIR/bin/contracts/tropical/ \
#  && cp ./tropical-example-web-app/public/app-metadata.json $ROOT_DIR/bin/contracts/tropical/ \
#  && chown -R gitpod:gitpod /home/gitpod/eosio
# RUN echo "COPYING APP CONTRACTS AND SCRIPTS"
# This must be done here (and not during gitpod because user won't have sufficient privileges then)
# COPY 
#  && echo "COPYING EOSIO.TOKEN RICARDIAN CONTRACT" \
#  && cp $ROOT_DIR/eosio/contracts/eosio.token/eosio.token.contracts.md $ROOT_DIR/bin/contracts/eosio.contracts/contracts/eosio.token/src
#  && rm -rf ./tropical-example-web-app

# RUN echo "DEPLOYING CONTRACTS" \
#  && mkdir -p "$ROOT_DIR/bin/config-dir"

# RUN ["/bin/bash", "-c", "/bin/bash $ROOT_DIR/bin/scripts/deploy_contracts.sh"]

### checks
# no root-owned files in the home directory
#RUN rm -f $HOME/.wget-hsts
#WORKDIR $HOME
#USER gitpod
#RUN notOwnedFile=$(find . -not "(" -user gitpod -and -group gitpod ")" -print -quit) \
    #&& { [ -z "$notOwnedFile" ] \
        #|| { echo "Error: not all files/dirs in $HOME are owned by 'gitpod' user & group"; exit 1; } }
