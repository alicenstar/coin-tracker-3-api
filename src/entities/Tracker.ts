import { Document, model, Schema } from 'mongoose';
import { IHolding } from './Holding';
import { IUser } from './User';

export interface ITracker extends Document {
    url: string;
    name?: string;
    owner?: IUser;
    holdings?: IHolding[];
}

const trackerSchema: Schema = new Schema(
    {
        url: {
            type: String,
            required: [true, 'URL is required'],
        },
        name: String,
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        holdings: {
            type: Schema.Types.ObjectId,
            ref: 'Holding',
        },
    },
    {
        timestamps: true,
        collection: 'trackers',
    }
);

export default model<ITracker>('Tracker', trackerSchema);