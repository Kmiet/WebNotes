const db = require('../db');

const create = (title, content, ...params) => {
  let session = db.session();
  return session.run(
    `CREATE (n: Note {title: {title}, content: {content}, created_at: {created_at}}) 
     SET n.note_id = id(n) 
     RETURN n`,
    {
      title,
      content,
      created_at: new Date().toISOString()
    }
  ).then(res => {
    session.close();
    return [false, res.records[0].get('n').properties];
  }).catch(err => {
    return [true, err];
  });
};

const findAll = () => {
  let session = db.session();
  return session.run(
    `MATCH (n: Note)
     WHERE NOT (n)-[:CHANGED_TO]->(:Note)
     RETURN n`
  ).then(res => {
    session.close();
    if(res.records.length == 0) throw { code: 404, msg: 'Resource not found' };
    return [false, res.records.map(record => record.get('n').properties)];
  }).catch(error => {
    session.close();
    return [true, error];
  });
}

const findById = (id) => {
  let session = db.session();
  return session.run(
    `MATCH (n: Note {note_id: {note_id}})
     WHERE NOT (n)-[:CHANGED_TO]->(:Note)
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
};

const remove = (id) => {
  let session = db.session();
  return session.run(
    `MATCH (n: Note {note_id: {note_id}})
     DETACH DELETE n`,
    {
      note_id: parseInt(id)
    }
  ).then(res => {
    session.close();
    return [false, null];
  }).catch(err => {
    return [true, err];
  });
};

const update = (id, title, content, ...params) => {
  let session = db.session();
  return session.run(
    `MATCH (p: Note {note_id: {note_id} })
     WHERE NOT (p)-[:CHANGED_TO]->(:Note)
     CREATE (n: Note {
        title: {title}, 
        content: {content},
        modified_at: {modified_at}
      }),
      (p)-[:CHANGED_TO]->(n)
     SET 
      n.created_at = p.created_at,
      n.note_id = p.note_id
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
};

module.exports = {
  create,
  findAll,
  findById,
  remove,
  update
};