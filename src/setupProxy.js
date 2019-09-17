// The API is in ES6 and this is run in the node environment
require("@babel/register")({
  presets: ["@babel/preset-env"]
});

const Api = require('./api').default;

// This is a mis-use of the react proxySetup to allow for a simple API layer that the application can
// interact with.  In a production setup, this would either proxy to an api service endpoint OR proper
// CORS/access control would be in place for the api service to be directly accessible from the app
//
module.exports = function(app) {
  app.use('/api', Api());
};