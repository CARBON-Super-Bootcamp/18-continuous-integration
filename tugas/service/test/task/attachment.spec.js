/* eslint-disable no-undef */
const { connect } = require('../../lib/orm');
const { TaskSchema } = require('../../tasks/task.model');
const { WorkerSchema } = require('../../worker/worker.model');
const workerModel = require('../../worker/worker');
const taskModel = require('../../tasks/task');

const bus = require('../../lib/bus');
const storage = require('../../lib/storage');
const { config } = require('../../config');
const taskServer = require('../../tasks/server');
const workerServer = require('../../worker/server');

const fs = require('fs');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

async function workerServerSetup() {
  try {
    await storage.connect('photo', config.minio);
  } catch (err) {
    console.error('object storage connection failed', err);
  }
  workerServer.run();
}

async function taskServerSetup() {
  try {
    await storage.connect('attachment', config.minio);
  } catch (err) {
    console.error('object storage connection failed', err);
  }
  taskServer.run();
}

async function initWorkerData() {
  try {
    const form = new FormData();
    const pathFile = path.resolve(__dirname, '../worker/profile.jpeg');
    const file = fs.createReadStream(pathFile);
    form.append('name', 'budiman');
    form.append('address', 'jakarta');
    form.append('age', 20);
    form.append('bio', 'suka olahraga');
    form.append('photo', file);

    const response = await new Promise((resolve, reject) => {
      form.submit('http://localhost:7001/register', function (err, res) {
        if (err) {
          reject(err);
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          const result = JSON.parse(data);
          resolve(result);
        });
      });
    });
    return response;
  } catch (error) {
    console.log(eror);
  }
}

async function initTaskData(workerId) {
  try {
    const form = new FormData();
    const pathFile = path.resolve(__dirname, './file_test.txt');
    const file = fs.createReadStream(pathFile);
    const test = {
      job: 'jual geprek',
      assignee_id: workerId,
      attachment: file,
    };
    form.append('job', test.job);
    form.append('assignee_id', test.assignee_id);
    form.append('attachment', test.attachment);

    const response = await new Promise((resolve, reject) => {
      form.submit('http://localhost:7002/add', function (err, res) {
        if (err) {
          reject(err);
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          const result = JSON.parse(data);
          resolve(result);
        });
      });
    });
    return response;
  } catch (error) {
    console.log(eror);
  }
}

function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        let result;
        try {
          result = JSON.parse(data);
        } catch (error) {
          result = data;
        }
        resolve({ code: res.statusCode, data: result });
      });
      res.on('error', (err) => {
        reject((err && err.message) || err.toString());
      });
    });
    req.on('error', (error) => {
      console.error(error);
    });
    req.end();
  });
}

describe('Get Attachment', () => {
  let connection;

  beforeAll(async () => {
    //orm
    try {
      connection = await connect([TaskSchema, WorkerSchema], config.pg);
    } catch (err) {
      console.log(config.pg);
      console.error('database connection failed', err);
    }

    //nats
    try {
      await bus.connect();
    } catch (err) {
      console.error('message bus connection failed', err);
    }

    await workerServerSetup();
    await taskServerSetup();
  });

  afterAll(async () => {
    await taskModel.truncate();
    await workerModel.truncate();
    await connection.close();
    bus.close();
    workerServer.stop();
    taskServer.stop();
  });

  describe('get attachment file', () => {
    let workerData;
    beforeEach(async () => {
      workerData = await initWorkerData();
      taskData = await initTaskData(workerData.id);
    });

    it('should success get attachment task', async () => {
      const options = {
        hostname: 'localhost',
        port: 7002,
        path: `/attachment/${taskData.attachment}`,
        method: 'GET',
      };
      const response = await request(options);

      expect(response.code).toBe(200);
    });

    it('should error task attachment not found', async () => {
      const options = {
        hostname: 'localhost',
        port: 7002,
        path: `/attachment/zzzzzzz.txt`,
        method: 'GET',
      };
      const response = await request(options);

      expect(response.code).toBe(404);
      expect(response.data).toBe(storage.ERROR_FILE_NOT_FOUND);
    });
  });
});
