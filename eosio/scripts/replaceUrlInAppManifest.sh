# Gitpod creates a dynamic URL for browsers.  We need to update the tropical app manifest to reflect this dynamic URL as the hostname for the app
GP_URL=$(gp url 8000)
echo "Replacing URLs with: ${GP_URL}"

# Pull in the manifest the chain will serve and update the URLs
sed -i "s%https://localhost:3000%${GP_URL}%g" $PWD/public/chain-manifests.json
