import { model, Schema } from 'mongoose';
import IUser from '../types/user';


const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: 6,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      trim: true,
      minlength: 8,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export default model<IUser>('User', userSchema);