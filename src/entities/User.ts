import { Document, model, Schema } from 'mongoose';
import { ITracker } from './Tracker';


export interface IUser extends Document {
    username: string;
    pwdHash: string;
    email: string;
    trackers: ITracker[];
    role: 'User' | 'Admin';
}

const userSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: 4,
        },
        pwdHash: {
            type: String,
            required: [true, 'Password is required'],
            trim: true,
            minlength: 8,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
        },
        trackers: [{
            type: Schema.Types.ObjectId,
            ref: 'Tracker',
        }],
        role: {
            type: String,
            required: [true, 'Role is required']
        }
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

export default model<IUser>('User', userSchema);