const request = require('supertest');
const assert = require('assert');
const server = require('../src/server');

describe('WebNotes API tests', () => {
  let note_ids = [];
  let title = "Note's title";
  let content = "Note's content";
  let nonExistentId = 'n0nEx1st3nt';

  test('Server is listening', async () => {
    await request(server).get('/').expect(200, {
      name: 'WebNotes',
      entry: '/notes'
    });
  });

  test('POST /notes with {title, content}', async () => {
    await request(server).post('/notes').send({
      title,
      content
    }).expect(201).then(res => {
      note_ids.push(res.body.note_id);
      assert(res.body.title, title);
      assert(res.body.content, content);
    });
  });

  test('POST /notes with {title}', async () => {
    await request(server).post('/notes').send({
      title
    }).expect(400, {
      code: 400,
      msg: 'Title or content field is missing'
    });
  });

  test('POST /notes with {content}', async () => {
    await request(server).post('/notes').send({
      content
    }).expect(400, {
      code: 400,
      msg: 'Title or content field is missing'
    });
  });

  test('GET /notes', async () => {
    await request(server).get('/notes').expect(200);
  });

  test('GET /notes/id', async () => {
    await request(server).get('/notes/' + note_ids[0]).expect(200).then(res => {
      assert(note_ids[0], res.body.note_id);
      assert(title, res.body.title);
      assert(content, res.body.content);
    });
  });

  test('GET /notes/id with wrong ID', async () => {
    await request(server).get('/notes/' + nonExistentId).expect(404, {
      code: 404,
      msg: 'Resource not found'
    });
  });

});