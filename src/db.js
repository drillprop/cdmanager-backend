import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connect(process.env.MONGODB_PATH, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

export default db;
