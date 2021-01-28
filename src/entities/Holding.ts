import { Document, model, Schema } from 'mongoose';
import { ITracker } from './Tracker';

export interface IHolding extends Document {
    coinId: number;
    quantity: number;
    initialInvestment: number;
    tracker: ITracker;
}

const holdingSchema: Schema = new Schema(
    {
        coinId: {
            type: Number,
            required: [true, 'Coin name is required'],
        },
        quantity: {
            type: Schema.Types.Decimal128,
            required: [true, 'Quantity is required'],
        },
        initialInvestment: {
            type: Schema.Types.Decimal128,
            required: [true, 'Initial investment is required']
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
        toJSON: {
            transform: (doc: any, ret: any) => {
                decimal2JSON(ret);
                return ret;
            }
        }
    }
);

const decimal2JSON = (v: any, i?: any, prev?: any) => {
    if (v !== null && typeof v === 'object') {
        if (v.constructor.name === 'Decimal128') {
            prev[i] = v.toString();
        } else {
            Object.entries(v).forEach(([key, value]) => 
                decimal2JSON(value, key, prev ? prev[i] : v)
            );
        }
    }
};
  

export default model<IHolding>('Holding', holdingSchema);