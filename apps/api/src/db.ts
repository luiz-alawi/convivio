import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb() {
  await mongoose.connect(env.MONGODB_URI);
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
