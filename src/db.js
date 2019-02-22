import mongoose from 'mongoose';
import { mongoPassword } from '../config';

mongoose.connect(
  `mongodb+srv://test:${mongoPassword}@cdmanager-92rag.mongodb.net/test?retryWrites=true`,
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);
export const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
