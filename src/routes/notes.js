const router = require('express').Router();
const { Note } = require('../models');

router.get('/:id', async (req, res) => {
  let [err, results] = await Note.findById(req.params.id);
  if(err) res.status(404).json(results);
  else res.json(results);
});

router.put('/:id', async (req, res) => {
  let [err, results] = await Note.update(
    req.params.id,
    req.body.title,
    req.body.content
  );
  if(err) res.status(404).json(results);
  else res.status(201).json(results);
});

router.delete('/:id', async (req, res) => {
  let [err, results] = await Note.remove(req.params.id);
  if(err) res.status(404).json(results);
  else res.sendStatus(204);
});

router.get('/', async (req, res) => {
  let [err, results] = await Note.findAll();
  if(err) res.status(404).json(results);
  else res.json(results);
});

router.post('/', async (req, res) => {
  if(!req.body.title || !req.body.content) {
    res.status(400).json({
      code: 400,
      msg: 'Title or content field is missing'
    });
  } else {
    let [err, results] = await Note.create(
      req.body.title,
      req.body.content
    );
    if(err) res.status(400).json(results);
    else res.status(201).json(results);
  }
});

module.exports = router;