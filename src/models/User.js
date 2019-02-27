import { model, Schema } from 'mongoose';
import { albumSchema } from './Album';

const userSchema = new Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  avatar: String,
  albums: [albumSchema]
});

const User = model('Users', userSchema);

export default User;
