import { Document, model, Schema } from 'mongoose';
import { ITracker } from './Tracker';

export interface ITransaction extends Document {
    price: number;
    quantity: number;
    priceAtTransaction: number;
    type: 'Buy' | 'Sell' | 'Adjustment'
    tracker: ITracker;
}

const transactionSchema: Schema = new Schema(
    {
        coinId: {
            type: String,
            required: [true, 'Coin name is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
        },
        priceAtTransaction: {
            type: Number,
            required: [true, 'Price at time of transaction is required']
        },
        type: {
            type: String,
            required: [true, 'Transaction type is required']
        },
        tracker: {
            type: Schema.Types.ObjectId,
            ref: 'Tracker',
            required: [true, 'Tracker is required'],
        },
    },
    {
        timestamps: true,
        collection: 'transactions',
    }
);

export default model<ITransaction>('Transaction', transactionSchema);