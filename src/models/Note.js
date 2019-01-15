const db = require('../db');

const create = async (title, content, ...params) => {
  let session = db.session();
  let data = await session.run(
    `CREATE (n:Note {title: {title}, content: {content}, created_at: {created_at}}) 
     SET n.note_id = id(n) 
     RETURN n`,
    {
      title,
      content,
      created_at: new Date().toISOString()
    }
  ).then(res => {
    session.close();
    return [false, res.records[0].get()];
  }).catch(err => {
    return [true, err];
  });
  return data;
};

const findAll = async () => {
  let session = db.session();
  let data = await session.run(
    `MATCH (n:Note)
     RETURN n`
  ).then(res => {
    session.close();
    if(res.records.length == 0) throw { code: 404, msg: 'Resource not found' };
    return [false, res.records.map(record => record.get('n').properties)];
  }).catch(error => {
    session.close();
    return [true, error];
  });
  return data;
}

const findById = async (id) => {
  let session = db.session();
  let data = await session.run(
    `MATCH (n:Note {note_id: {note_id}})
     RETURN n`,
    {
      note_id: parseInt(id)
    }
  ).then(res => {
    session.close();
    if(res.records.length == 0) throw { code: 404, msg: 'Resource not found' };
    return [false, res.records[0].get('n').properties];
  }).catch(err => {
    return [true, err];
  });
  return data;
};

const remove = async (id) => {
  let session = db.session();
  let data = await session.run(
    `MATCH (n:Note {note_id: {note_id}})
     DELETE n`,
    {
      note_id: parseInt(id)
    }
  ).then(res => {
    session.close();
    return [false, res.records[0].get('n').properties];
  }).catch(err => {
    return [true, err];
  });
  return data;
};

const update = async (id, title, content, ...params) => {
  let session = db.session();
  let data = await session.run(
    `CREATE (n:Note {
      title: {title}, 
      content: {content}, 
      note_id: {note_id}, 
      modified_at: {modified_at}
     })
     RETURN n`,
    {
      note_id: parseInt(id),
      title,
      content,
      modified_at: new Date().toISOString()
    }
  ).then(res => {
    session.close();
    if(res.records.length == 0) throw { code: 404, msg: 'Update failed' };
    return [false, res.records[0].get('n').properties];
  }).catch(err => {
    return [true, err];
  });
  return data;
};

module.exports = {
  create,
  findAll,
  findById,
  remove,
  update
};