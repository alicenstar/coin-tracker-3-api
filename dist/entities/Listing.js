"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const quoteSchema = new mongoose_1.Schema({
    price: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: [true, 'Price is required'],
    },
    volume_24h: {
        type: Number,
        required: [true, 'Volume 24 hours is required'],
    },
    percent_change_1h: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: [true, 'Percent change 1 hour is required'],
    },
    percent_change_24h: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: [true, 'Percent change 24 hours is required'],
    },
    percent_change_7d: {
        type: mongoose_1.Schema.Types.Decimal128,
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
const platformSchema = new mongoose_1.Schema({
    id: Number,
    name: String,
    symbol: String,
    slug: String,
    token_address: String,
});
const listingSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    collection: 'listings',
    toJSON: {
        transform: (doc, ret) => {
            decimal2JSON(ret);
            return ret;
        }
    }
});
const decimal2JSON = (v, i, prev) => {
    if (v !== null && typeof v === 'object') {
        if (v.constructor.name === 'Decimal128') {
            prev[i] = v.toString();
        }
        else {
            Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
        }
    }
};
exports.default = mongoose_1.model('Listing', listingSchema);
