const mongoose = require('mongoose');
const { mongoPassword } = require('../config');
mongoose.connect(
  `mongodb+srv://test:${mongoPassword}@cdmanager-92rag.mongodb.net/test?retryWrites=true`,
  { useNewUrlParser: true }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // smth
});

const albumSchema = new mongoose.Schema({
  artist: String,
  title: String,
  image: String,
  id: String
});
albumSchema.index({ artist: 'text', title: 'text' });

const Album = mongoose.model('Album', albumSchema);
module.exports = { Album };
