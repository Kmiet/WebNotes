const router = require('express').Router();
const db = require('../db');

router.get('/:id', (req, res) => {
  let note_id = parseInt(req.params.id);
  db.all('Note', { note_id }).then(collection => {
    collection.toJson().then(data => {
      res.send(data[0]);
    });
  }).catch(err => {
    console.log(err);
  });
});


router.get('/', (req, res) => {
  db.all('Note').then(collection => {
    collection.toJson().then(data => {
      res.send(data);
    });
  }).catch(err => {
    console.log(err);
  });
});

module.exports = router;