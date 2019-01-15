const router = require('express').Router();
const { Note } = require('../models');

router.get('/:id', async (req, res) => {
  let [err, results] = await Note.findById(req.params.id);
  if(err) {
    res.status(404).json(results);
  } else {
    res.json(results);
  }
});

router.put('/:id', async (req, res) => {
  let [err, results] = await Note.update(
    req.params.id,
    req.params.title,
    req.params.content
  );
  if(err) {
    res.status(404).json(results);
  } else {
    res.status(200).json(results);
  }
});

router.delete('/:id', async (req, res) => {
  let [err, results] = await Note.remove(
    req.params.id,
    req.params.title,
    req.params.content
  );
  if(err) {
    res.status(404).json(results);
  } else {
    res.status(200).json(results);
  }
});

router.get('/', async (req, res) => {
  let [err, results] = await Note.findAll();
  if(err) {
    res.status(404).json(results);
  } else {
    res.json(results);
  }
});

router.post('/', async (req, res) => {
  let [err, results] = await Note.create({
    title: '',
    content: ''
  });
  if(err) {
    res.status(404).json(results);
  } else {
    res.status(201).json(results);
  }
});

module.exports = router;