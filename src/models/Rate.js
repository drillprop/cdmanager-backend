import { model, Schema } from 'mongoose';

export const rateSchema = new Schema({
  value: { type: Number, min: 0, max: 10 },
  review: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  albumId: { type: Schema.Types.ObjectId, ref: 'Album' },
});

const Rate = model('Rate', rateSchema);

export default Rate;
