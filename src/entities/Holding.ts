import { Document, model, Schema } from 'mongoose';
import { ITracker } from './Tracker';

export interface IHolding extends Document {
    ticker: string;
    name: string;
    quantity: number;
    tracker: ITracker;
}

const holdingSchema: Schema = new Schema(
    {
        ticker: {
            type: String,
            required: [true, 'Ticker symbol is required'],
        },
        name: {
            type: String,
            required: [true, 'Coin name is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
        },
        tracker: {
            type: Schema.Types.ObjectId,
            ref: 'Tracker',
            required: [true, 'Tracker is required'],
        }
    },
    {
        timestamps: true,
        collection: 'holdings',
    }
);

export default model<IHolding>('Holding', holdingSchema);