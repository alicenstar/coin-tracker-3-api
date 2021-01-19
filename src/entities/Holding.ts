import { Document, model, Schema } from 'mongoose';
import { ITracker } from './Tracker';

export interface IHolding extends Document {
    coinId: number;
    quantity: number;
    tracker: ITracker;
}

const holdingSchema: Schema = new Schema(
    {
        coinId: {
            type: Number,
            required: [true, 'Coin name is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
        },
        tracker: {
            type: Schema.Types.ObjectId,
            ref: 'Tracker',
            required: [true, 'Tracker reference is required'],
        },
    },
    {
        timestamps: true,
        collection: 'holdings',
    }
);

export default model<IHolding>('Holding', holdingSchema);