const Neode = require('neode');
const models = require('./models');

const persistence = new Neode.fromEnv();

persistence.model('Note', models.Note);

module.exports = persistence;