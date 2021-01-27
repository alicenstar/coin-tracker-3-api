import { Document, model, Schema } from 'mongoose';


type Quote = {
    price: number;
    volume_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    market_cap: number;
    last_updated: Date;
}

type Quotes = {
    [key: string]: Quote;
}

interface IListing extends Document {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    cmc_rank: number;
    num_market_pairs: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    last_updated: Date;
    date_added: Date;
    tags: string[];
    platform: any;
    quote: Quotes;
}

const quoteSchema: Schema = new Schema({
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    volume_24h: {
        type: Number,
        required: [true, 'Volume 24 hours is required'],
    },
    percent_change_1h: {
        type: Number,
        required: [true, 'Percent change 1 hour is required'],
    },
    percent_change_24h: {
        type: Number,
        required: [true, 'Percent change 24 hours is required'],
    },
    percent_change_7d: {
        type: Number,
        required: [true, 'Percent change 7 days is required'],
    },
    market_cap: {
        type: Number,
        required: [true, 'Market cap is required'],
    },
    last_updated: {
        type: Date,
        required: [true, 'Last updated is required'],
    },
});

const platformSchema: Schema = new Schema({
    id: Number,
    name: String,
    symbol: String,
    slug: String,
    token_address: String,
});

const listingSchema: Schema = new Schema(
    {
        id: {
            type: Number,
            required: [true, 'ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        symbol: {
            type: String,
            required: [true, 'Symbol is required'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
        },
        cmc_rank: {
            type: Number,
            required: [true, 'CMC rank is required'],
        },
        num_market_pairs: {
            type: Number,
            required: [true, 'Number of market pairs is required'],
        },
        circulating_supply: {
            type: Number,
            required: [true, 'Circulating supply is required'],
        },
        total_supply: {
            type: Number,
            required: [true, 'Total supply is required'],
        },
        max_supply: Number,
        last_updated: {
            type: Date,
            required: [true, 'Last updated is required'],
        },
        date_added: {
            type: Date,
            required: [true, 'Date added is required'],
        },
        tags: {
            type: [String],
            required: [true, 'Tags are required'],
        },
        platform: platformSchema,
        quote: {
            USD: {
                type: quoteSchema,
                required: [true, 'Tracker is required']
            },
            BTC: quoteSchema,
        }
    },
    {
        timestamps: true,
        collection: 'listings',
    }
);

export default model<IListing>('Listing', listingSchema);