import { model, Schema } from 'mongoose';

export const albumSchema = new Schema({
  artist: String,
  title: String,
  image: String,
  rates: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Rate',
    },
  ],
  rateSum: { type: Number, default: 0 },
  rateCount: { type: Number, default: 0 },
  rateAvg: { type: Number, default: 0 },
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
