"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = require("express");
const Transaction_1 = __importDefault(require("@entities/Transaction"));
const mongodb_1 = __importDefault(require("mongodb"));
const router = express_1.Router();
const { CREATED, OK } = http_status_codes_1.default;
/******************************************************************************
 *                       Create A Transaction - "POST /api/transactions/"
 ******************************************************************************/
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const transaction = new Transaction_1.default({
            coinId: body.coinId,
            quantity: mongodb_1.default.Decimal128.fromString(body.quantity),
            priceAtTransaction: mongodb_1.default.Decimal128.fromString(body.priceAtTransaction),
            type: body.type,
            tracker: body.trackerId
        });
        const newTransaction = yield transaction.save();
        res.status(CREATED).json({
            message: 'Transaction added',
            transaction: newTransaction
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                      Get A Transaction - "GET /api/transactions/:id"
 ******************************************************************************/
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (res.holding == null) {
            return res.status(404).json({ message: 'Cannot find holding or transactions' });
        }
        const transactions = yield Transaction_1.default.find({
            coinid: (_a = res.holding) === null || _a === void 0 ? void 0 : _a.coinId,
            tracker: (_b = res.holding) === null || _b === void 0 ? void 0 : _b.tracker
        });
        return res.status(OK).json({
            message: 'Holding and its transactions found',
            holding: res.holding,
            transactions: transactions
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}));
/******************************************************************************
 *                       Update A Transaction - "PUT /api/transactions/:id"
 ******************************************************************************/
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        yield res.holding.updateOne({
            $inc: {
                quantity: mongodb_1.default.Decimal128.fromString(body.quantity),
                initialInvestment: mongodb_1.default.Decimal128.fromString((body.quantity * body.priceAtTransaction).toString())
            }
        });
        const updatedHolding = yield res.holding.save();
        res.status(OK).json({
            message: 'Successfully updated holding',
            holding: updatedHolding
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                    Delete A Transaction - "DELETE /api/transactions/:id"
 ******************************************************************************/
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Transaction_1.default.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted holding' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *                                     Export
 ******************************************************************************/
exports.default = router;
