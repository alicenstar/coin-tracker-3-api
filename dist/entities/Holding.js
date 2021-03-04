"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const holdingSchema = new mongoose_1.Schema({
    coinId: {
        type: Number,
        required: [true, 'Coin name is required'],
    },
    quantity: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: [true, 'Quantity is required'],
    },
    initialInvestment: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: [true, 'Initial investment is required']
    },
    tracker: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tracker',
        required: [true, 'Tracker reference is required'],
    },
}, {
    timestamps: true,
    collection: 'holdings',
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
exports.default = mongoose_1.model('Holding', holdingSchema);
