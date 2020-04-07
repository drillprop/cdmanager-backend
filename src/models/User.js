import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  albums: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Album',
    },
  ],
});

const User = model('Users', userSchema);

export default User;
