import { model, Schema } from 'mongoose';

export const albumSchema = new Schema({
  artist: String,
  title: String,
  image: String,
  owners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

albumSchema.index({ artist: 'text', title: 'text' });
const Album = model('Album', albumSchema);

export default Album;
