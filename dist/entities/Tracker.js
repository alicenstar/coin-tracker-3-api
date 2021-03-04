"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const trackerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Tracker name is required'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    holdings: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Holding',
        }],
}, {
    timestamps: true,
    collection: 'trackers',
    toJSON: {
        virtuals: true,
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
trackerSchema.virtual('initialInvestment').get(function () {
    if (this.holdings.length > 0) {
        // const json = this.holdings.toJSON();
        return this.holdings
            .map(holding => {
            const json = holding.toJSON();
            return Number(json.initialInvestment);
        })
            .reduce((a, b) => a + b);
    }
    else {
        return 0;
    }
});
exports.default = mongoose_1.model('Tracker', trackerSchema);
