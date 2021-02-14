const rc = require('rc');

const defaultConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'NanamiNeko12',
    database: 'postgres',
  },
  server: {
    port: 7767,
  },
};

const config = rc('todo', defaultConfig);

module.exports = {
  config,
};
