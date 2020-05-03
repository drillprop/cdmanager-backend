import { model, Schema } from 'mongoose';

export const rateSchema = new Schema({
  value: { type: Number, default: 0 },
  review: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  album: { type: Schema.Types.ObjectId, ref: 'Album' },
});

const Rate = model('Rate', rateSchema);

export default Rate;
