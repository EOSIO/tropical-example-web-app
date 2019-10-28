# Gitpod creates a dynamic URL for browsers.  We need to update the tropical app manifest to reflect this dynamic URL as the host of the app
GP_URL=$(gp url)
echo "Replacing URLs with: ${GP_URL}"

# Pull in the manifest the chain serves and update the URLs
#cp /opt/eosio/bin/contracts/tropical/chain-manifests.json $PWD/
#sed -i "s%http://localhost:3000%${GP_URL}%g" chain-manifests.json
sed -i "s%http://localhost:3000%${GP_URL}%g" $PWD/public/chain-manifests.json

# Delete the manifest the default/localhost manifest the scipts put on the change
# and replace with a manifest with the proper URL for GitPod
#CONTRACT_NAME="tropical"
#APP_DOMAIN="${GP_URL}"
#APPMETA="${GP_URL}/app-metadata.json#bc677523fca562e307343296e49596e25cb14aac6b112a9428a42119da9f65fa"
#MANIFEST="[{ "\""contract"\"": "\""tropical"\"",  "\""action"\"": "\""like"\"" }]"
#cleos push action eosio.assert del.manifest "[ "bc677523fca562e307343296e49596e25cb14aac6b112a9428a42119da9f65fa" ]" -p $CONTRACT_NAME@active
#cleos push action eosio.assert add.manifest "[ "\""$CONTRACT_NAME"\"", "\""$APP_DOMAIN"\"", "\""$APPMETA"\"", $MANIFEST ]" -p $CONTRACT_NAME@active