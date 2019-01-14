const router = require('express').Router();

router.use('/notes', require('./notes'))

router.get('/', (req, res) => {
  res.json({
    name: 'WebNotes',
    entry: '/notes'
  });
});

module.exports = router;