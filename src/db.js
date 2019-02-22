import mongoose from 'mongoose';
import { mongoPassword } from '../config';

mongoose.connect(
  `mongodb+srv://test:${mongoPassword}@cdmanager-92rag.mongodb.net/test?retryWrites=true`,
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);
export const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const { Schema, model } = mongoose;

const albumSchema = new Schema({
  artist: String,
  title: String,
  image: String
});

albumSchema.index({ artist: 'text', title: 'text' });
export const Album = model('Album', albumSchema);

const userSchema = new Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  avatar: String,
  albums: [{ type: Schema.Types.ObjectId, ref: 'Album' }]
});

export const User = model('Users', userSchema);
