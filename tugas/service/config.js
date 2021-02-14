const rc = require('rc');

const defaultConfig = {
  pg: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'NanamiNeko12',
    database: 'sanbercode',
  },
  minio: {
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  },
  server: {
    taskPort: 7002,
    workerPort: 7001,
  },
};

const config = rc('tm', defaultConfig);

module.exports = {
  config,
};
