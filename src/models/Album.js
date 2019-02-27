import { model, Schema } from 'mongoose';

export const albumSchema = new Schema({
  artist: String,
  title: String,
  image: String
});

albumSchema.index({ artist: 'text', title: 'text' });
const Album = model('Album', albumSchema);

export default Album;
