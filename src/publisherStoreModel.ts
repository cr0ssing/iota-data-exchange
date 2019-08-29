import * as mongoose from 'mongoose';
import { DataPublisher } from './lib';
const publisherStoreSchema = new mongoose.Schema({
  items: Map,
});

export default mongoose.model('Publisher', publisherStoreSchema);
