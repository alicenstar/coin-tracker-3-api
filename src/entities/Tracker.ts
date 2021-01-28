import { Document, model, Schema } from 'mongoose';
import { IHolding } from './Holding';
import { IUser } from './User';

export interface ITracker extends Document {
    name: string;
    owner?: IUser;
    holdings: IHolding[];
}


const trackerSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tracker name is required'],
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        holdings: [{
            type: Schema.Types.ObjectId,
            ref: 'Holding',
        }],
    },
    {
        timestamps: true,
        collection: 'trackers',
        toJSON: {
            virtuals: true,
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


trackerSchema.virtual('initialInvestment').get(function(this: ITracker) {
    if (this.holdings.length > 0) {
        // const json = this.holdings.toJSON();
        return this.holdings
            .map(holding => {
                const json = holding.toJSON()
                return Number(json.initialInvestment);
            })
            .reduce((a, b) => a + b);
    } else {
        return 0;
    }
});

export default model<ITracker>('Tracker', trackerSchema);