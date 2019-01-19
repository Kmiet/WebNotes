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

  test('POST /notes with {title, content} - DB connection test', async () => {
    await request(server).post('/notes').send({
      title,
      content
    }).expect(201).then(res => {
      note_ids.push(res.body.note_id);
      assert.equal(res.body.title, title);
      assert.equal(res.body.content, content);
      assert.notDeepEqual(res.body.created_at, undefined);
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
      assert.equal(note_ids[0], res.body.note_id);
      assert.equal(title, res.body.title);
      assert.equal(content, res.body.content);
    });
  });

  test('GET /notes/id with wrong ID', async () => {
    await request(server).get('/notes/' + nonExistentId).expect(404, {
      code: 404,
      msg: 'Resource not found'
    });
  });

  test('PUT /notes/id with {title, content}', async () => {
    await request(server).put('/notes/' + note_ids[0]).send({
      title: content,
      content: title
    }).expect(201).then(res => {
      assert.equal(res.body.note_id, note_ids[0]);
      assert.equal(res.body.title, content);
      assert.equal(res.body.content, title);
      assert.notDeepEqual(res.body.created_at, undefined);
      assert.notDeepEqual(res.body.modified_at, undefined);
    });
  });

  test('PUT /notes/id with {title}', async () => {
    await request(server).put('/notes/' + note_ids[0]).send({
      title: content
    }).expect(400, {
      code: 400,
      msg: 'Title or content field is missing'
    });
  });

  test('PUT /notes/id with {content}', async () => {
    await request(server).put('/notes/' + note_ids[0]).send({
      content: title
    }).expect(400, {
      code: 400,
      msg: 'Title or content field is missing'
    });
  });

  test('PUT /notes/id with wrong ID', async () => {
    await request(server).put('/notes/' + nonExistentId).send({
      title: content,
      content: title
    }).expect(404, {
      code: 404,
      msg: 'Resource not found'
    });
  });

  test('GET /notes/id/history', async () => {
    await request(server).get('/notes/' + note_ids[0] + '/history').expect(200).then(res => {
      let data = res.body.versions;
      assert.equal(res.body.order, "ASC");
      assert.equal(data.length, res.body.length);
      assert.equal(data.length, 2);
      assert.equal(data[0].title, title);
      assert.equal(data[0].content, content);
      assert.equal(data[1].title, content);
      assert.equal(data[1].content, title);
      assert.equal(data[0].created_at, data[1].created_at);
      assert.equal(data[0].note_id, data[1].note_id);
      assert.equal(data[1].modified_at > data[0].modified_at, true);
      assert.equal(data[1].version > data[0].version > 0, true);
    });  
  });

  test('GET /notes/id/history?order=DESC', async () => {
    await request(server).get('/notes/' + note_ids[0] + '/history?order=DESC').expect(200).then(res => {
      let data = res.body.versions;
      assert.equal(res.body.order, "DESC");
      assert.equal(data.length, res.body.length);
      assert.equal(data.length, 2);
      assert.equal(data[1].title, title);
      assert.equal(data[1].content, content);
      assert.equal(data[0].title, content);
      assert.equal(data[0].content, title);
      assert.equal(data[0].created_at, data[1].created_at);
      assert.equal(data[0].note_id, data[1].note_id);
      assert.equal(data[1].modified_at < data[0].modified_at, true);
      assert.equal(0 < data[1].version < data[0].version, true);
    });  
  });

  test('GET /notes/id/history?order=ASC&limit=3', async () => {
    await request(server).put('/notes/' + note_ids[0]).send({
      title: title,
      content: content
    });

    await request(server).put('/notes/' + note_ids[0]).send({
      title: content,
      content: title
    });

    await request(server).get('/notes/' + note_ids[0] + '/history?limit=3').expect(200).then(res => {
      let data = res.body.versions;
      assert.equal(res.body.order, "ASC");
      assert.equal(data.length, res.body.length);
      assert.equal(data.length, 3);
      assert.equal(data[0].title, data[2].title);
      assert.equal(data[0].title, title);
      assert.equal(data[0].content, data[2].content);
      assert.equal(data[0].content, content);
      assert.equal(data[1].title, content);
      assert.equal(data[1].content, title);
      assert.equal(data[0].created_at, data[1].created_at);
      assert.equal(data[0].created_at, data[2].created_at);
      assert.equal(data[0].note_id, data[1].note_id);
      assert.equal(data[0].note_id, data[2].note_id);
      assert.equal(data[2].modified_at > data[1].modified_at, true);
      assert.equal(data[1].modified_at > data[0].modified_at, true);
      assert.equal(data[2].version > data[1].version, true);
      assert.equal(data[1].version > data[0].version, true);
    });  
  });

  test('GET /notes/id/history?order=DESC&limit=3', async () => {

    await request(server).get('/notes/' + note_ids[0] + '/history?order=DESC&limit=3').expect(200).then(res => {
      let data = res.body.versions;
      assert.equal(res.body.order, "DESC");
      assert.equal(data.length, res.body.length);
      assert.equal(data.length, 3);
      assert.equal(data[0].title, data[2].title);
      assert.equal(data[0].title, content);
      assert.equal(data[0].content, data[2].content);
      assert.equal(data[0].content, title);
      assert.equal(data[1].title, title);
      assert.equal(data[1].content, content);
      assert.equal(data[0].created_at, data[1].created_at);
      assert.equal(data[0].created_at, data[2].created_at);
      assert.equal(data[0].note_id, data[1].note_id);
      assert.equal(data[0].note_id, data[2].note_id);
      assert.equal(data[2].modified_at < data[1].modified_at, true);
      assert.equal(data[1].modified_at < data[0].modified_at, true);
      assert.equal(data[2].version < data[1].version, true);
      assert.equal(data[1].version < data[0].version, true);
    });  
  });

  test('GET /notes/id/history?limit=3&page=2', async () => {

    await request(server).get('/notes/' + note_ids[0] + '/history?limit=3&page=2').expect(200).then(res => {
      let data = res.body.versions;
      assert.equal(res.body.order, "ASC");
      assert.equal(data.length, res.body.length);
      assert.equal(data.length, 1);
      assert.equal(data[0].title, content);
      assert.equal(data[0].content, title);
      assert.equal(data[0].version, 4);
    });  
  });

  test('GET /notes/id/history?limit=3&page=3 - skipped all entities', async () => {

    await request(server).get('/notes/' + note_ids[0] + '/history?limit=3&page=3').expect(500, {
      code: 500,
      msg: 'Skipped all of the entities. There is only ' + 4 + ' of them.'
    });
  });

  test('GET /notes/id/history with wrong ID', async () => {
    await request(server).get('/notes/' + nonExistentId + '/history').expect(404, {
      code: 404,
      msg: 'Resource not found'
    });  
  });

  test('DELETE /notes/id', async () => {
    await request(server).delete('/notes/' + note_ids[0]).expect(204);  
  });

  test('DELETE /notes/id with wrong ID', async () => {
    await request(server).delete('/notes/' + nonExistentId).expect(404, {
      code: 404,
      msg: 'Resource not found'
    });
  });

});