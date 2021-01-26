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
            type: Number,
            required: [true, 'Coin ID is required'],
        },
        quantity: {
            type: Schema.Types.Decimal128,
            required: [true, 'Quantity is required'],
        },
        priceAtTransaction: {
            type: Schema.Types.Decimal128,
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