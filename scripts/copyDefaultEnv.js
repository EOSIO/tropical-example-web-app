var fs = require('fs');
var path = require('path');
var root = __dirname.replace('scripts', '');

if (!fs.existsSync(path.join(root + '.env'))) {
  fs.copyFileSync(path.join(root + 'default.env'), path.join(root + '.env'));
  console.info('.env NOT found; copying ./default.env to ./.env');
} else {
  console.info('.env already exists; NOT overwriting...');
}