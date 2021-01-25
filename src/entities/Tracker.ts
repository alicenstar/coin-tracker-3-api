import { Document, model, Schema } from 'mongoose';
import { IHolding } from './Holding';
import { IUser } from './User';

export interface ITracker extends Document {
    name: string;
    owner?: IUser;
    holdings?: IHolding[];
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
        toJSON: { virtuals: true }
    }
);

trackerSchema.virtual('initialInvestment').get(function(this: ITracker) {
    if (this.holdings) {
        return this.holdings
            .map(holding => holding.initialInvestment)
            .reduce((a, b) => a + b);
    } else {
        return 0;
    }
});

export default model<ITracker>('Tracker', trackerSchema);