const mongoose = require('mongoose');
const { mongoPassword } = require('../config');
mongoose.connect(
  `mongodb+srv://test:${mongoPassword}@cdmanager-92rag.mongodb.net/test?retryWrites=true`,
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const { Schema, model } = mongoose;

const albumSchema = new Schema({
  artist: String,
  title: String,
  image: String
});

albumSchema.index({ artist: 'text', title: 'text' });
const Album = model('Album', albumSchema);

const userSchema = new Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  avatar: String,
  albums: [{ type: Schema.Types.ObjectId, ref: 'Album' }]
});

const User = model('Users', userSchema);

module.exports = { Album, User, db };
