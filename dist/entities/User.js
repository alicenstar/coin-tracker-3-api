"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: 4,
    },
    pwdHash: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        minlength: 8,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    trackers: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Tracker',
        }],
    role: {
        type: String,
        required: [true, 'Role is required']
    }
}, {
    timestamps: true,
    collection: 'users',
});
exports.default = mongoose_1.model('User', userSchema);
