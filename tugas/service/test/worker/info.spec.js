/* eslint-disable no-undef */
const { connect } = require('../../lib/orm');
const { workerSchema } = require('../../worker/worker.model');
const { config } = require('../../config');
const server = require('../../worker/server');
const fetch = require('node-fetch');
const { truncate } = require('../../worker/worker');
const nock = require('nock');

describe('workers info', () => {
  let connection;
  beforeAll(async () => {
    connection = await connect([workerSchema], config.database);
    server.run();
  });
  // beforeEach(async () => {
  //   await truncate();
  //   await fetch('http://localhost:7767/info', {
  //     method: 'get',
  //     body: JSON.stringify([
  //       {
  //         id: 1,
  //         name: 'makan',
  //         age: 17,
  //         bio: 'hai',
  //         adress: 'dekat',
  //         photo: '123.jpg',
  //       },
  //     ]),
  //     headers: { 'Content-type': 'application/json' },
  //   });
  // });
  it('get worker info', async () => {
    const res = await fetch('http://localhost:7001/info', {
      method: 'get',
      headers: { 'Content-type': 'application/json' },
    });
    const response = await res.json();
    expect(response).toHaveLength(1);
  });
  afterAll(async () => {
    await truncate();
    await connection.close();
    server.stop();
  });

  describe('info', () => {
    it('get workers info with nock', async () => {
      nock('http://localhost:7001')
        .get('/info')
        .reply(200, [
          {
            id: 1,
            name: 'makan',
            age: 17,
            bio: 'hai',
            adress: 'dekat',
            photo: '123.jpg',
          },
        ]);

      const res = await fetch('http://localhost:7001/info', {
        method: 'get',
        headers: { 'Content-type': 'application/json' },
      });
      const response = await res.json();
      expect(response).toHaveLength(1);
      expect(response.id).toBe('1')
    });
  });
});