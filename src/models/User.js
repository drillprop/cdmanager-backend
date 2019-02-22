import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  avatar: String,
  albums: [{ type: Schema.Types.ObjectId, ref: 'Album' }]
});

const User = model('Users', userSchema);

export default User;
