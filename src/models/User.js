import { model, Schema } from 'mongoose';
import { albumSchema } from './Album';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  albums: [albumSchema],
});

const User = model('Users', userSchema);

export default User;
