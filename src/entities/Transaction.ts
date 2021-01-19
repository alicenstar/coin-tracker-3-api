import { Document, model, Schema } from 'mongoose';
import { IHolding } from './Holding';

export interface ITransaction extends Document {
    price: number;
    quantity: number;
    holding: IHolding;
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
        tracker: {
            type: Schema.Types.ObjectId,
            ref: 'Tracker',
            required: [true, 'Holding is required'],
        },
    },
    {
        timestamps: true,
        collection: 'holdings',
    }
);

export default model<ITransaction>('Transaction', transactionSchema);