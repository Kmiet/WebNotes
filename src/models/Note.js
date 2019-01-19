const db = require('../db');

const create = (title, content) => {
  let session = db.session();
  return session.run(
    `CREATE (n: Note {
      title: $title, 
      content: $content, 
      created_at: $created_at, 
      modified_at: $created_at
     }) 
     SET n.note_id = toString(id(n))
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
    `MATCH (n: Note {note_id: $note_id})
     WHERE NOT (n)-[:CHANGED_TO]->(:Note)
     RETURN n`,
    {
      note_id: id
    }
  ).then(res => {
    session.close();
    if(res.records.length == 0) throw { code: 404, msg: 'Resource not found' };
    return [false, res.records[0].get('n').properties];
  }).catch(err => {
    return [true, err];
  });
};

const getHistory = (id, options) => {
  let session = db.session();
  let [order, limit, page] = [
    options.order ? (options.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') : 'ASC',
    !isNaN(options.limit) ? (options.limit > 0 ? options.limit : false) : false,
    !isNaN(options.page) ? options.page : 0
  ];

  return session.run(
    `MATCH (other_n: Note {note_id: $note_id})
     RETURN COUNT(other_n) as n
     UNION
     MATCH (n: Note {note_id: $note_id})
     RETURN n
     ORDER BY n.modified_at ` + order + (limit === false ? '' : `
     SKIP $skip
     LIMIT $limit`),
    {
      note_id: id,
      skip: (page - 1) * (limit = limit ? limit : 0),
      limit
    }
  ).then(res => {
    session.close();

    let count_all = res.records.shift().get('n');
    if(count_all == 0) throw { code: 404, msg: 'Resource not found' };
    if(limit && (count_all <= (page - 1) * limit)) throw { code: 500, msg: 'Skipped all of the entities. There is only ' + count_all + ' of them.' };

    let current = (limit ? limit : 0) * (page > 0 ? page - 1 : 0);
    let getVersion;

    if(order == 'ASC') getVersion = () => ++current;
    else getVersion = () => count_all - (current++);

    return [false, {
      order: order,
      length: res.records.length,
      versions: res.records.map(record => {
        let data = record.get('n').properties;
        data.version = getVersion();
        return data;
      })
    }];
  }).catch(err => {
    return [true, err];
  });
}


const remove = (id) => {
  let session = db.session();
  return session.run(
    `MATCH (n: Note {note_id: $note_id})
     DETACH DELETE n
     RETURN COUNT(n)`,
    {
      note_id: id
    }
  ).then(res => {
    session.close();
    if(res.records[0].get('COUNT(n)') == 0) throw { code: 404, msg: 'Resource not found' };
    return [false, null];
  }).catch(err => {
    return [true, err];
  });
};

const update = (id, title, content, ...params) => {
  let session = db.session();
  return session.run(
    `MATCH (p: Note {note_id: $note_id})
     WHERE NOT (p)-[:CHANGED_TO]->(:Note)
     CREATE (n: Note {
        title: $title, 
        content: $content,
        modified_at: $modified_at
      }),
      (p)-[:CHANGED_TO]->(n)
     SET 
      n.created_at = p.created_at,
      n.note_id = p.note_id
     RETURN n`,
    {
      note_id: id,
      title,
      content,
      modified_at: new Date().toISOString()
    }
  ).then(res => {
    session.close();
    if(res.records.length == 0) throw { code: 404, msg: 'Resource not found' };
    return [false, res.records[0].get('n').properties];
  }).catch(err => {
    return [true, err];
  });
};

module.exports = {
  create,
  findAll,
  findById,
  getHistory,
  remove,
  update
};