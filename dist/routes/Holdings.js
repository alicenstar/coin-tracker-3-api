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
const Holding_1 = __importDefault(require("@entities/Holding"));
const Tracker_1 = __importDefault(require("@entities/Tracker"));
const mongodb_1 = __importDefault(require("mongodb"));
const router = express_1.Router();
const { CREATED, OK } = http_status_codes_1.default;
// Middleware
const findHolding = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let holding;
    try {
        holding = yield Holding_1.default.findById(req.params.id);
        if (holding === null) {
            return res.status(404).json({ message: 'Cannot find holding' });
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.holding = holding;
    next();
});
/******************************************************************************
 *                       Create A Holding - "POST /api/holdings/"
 ******************************************************************************/
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const initialInvestment = parseFloat(body.priceAtTransaction) * parseFloat(body.quantity);
    try {
        const holding = new Holding_1.default({
            coinId: body.coinId,
            quantity: mongodb_1.default.Decimal128.fromString(body.quantity),
            initialInvestment: mongodb_1.default.Decimal128.fromString(initialInvestment.toString()),
            tracker: body.trackerId
        });
        const newHolding = yield holding.save();
        yield Tracker_1.default.updateOne({ _id: body.trackerId }, {
            $push: {
                holdings: newHolding._id
            }
        });
        res.status(CREATED).json({
            message: 'Holding added, Tracker holdings updated',
            holding: newHolding
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                       Update A Holding - "PUT /api/holdings/:id"
 ******************************************************************************/
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const initialInvestment = parseFloat(body.priceAtTransaction) * parseFloat(body.quantity);
    try {
        if (body.quantity === 0) {
            const result = yield Holding_1.default.deleteOne({ coinId: body.coinId });
            res.status(OK).json({
                message: 'Successfully updated and deleted holding',
                result: result
            });
        }
        else {
            const updatedHolding = yield Holding_1.default.findOneAndUpdate({ _id: req.params.id }, {
                $inc: {
                    quantity: mongodb_1.default.Decimal128.fromString(body.quantity.toString()),
                    initialInvestment: mongodb_1.default.Decimal128.fromString(initialInvestment.toString())
                }
            }, { new: true });
            res.status(OK).json({
                message: 'Successfully updated holding',
                holding: updatedHolding
            });
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                    Delete A Holding - "DELETE /api/holdings/:id"
 ******************************************************************************/
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Holding_1.default.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Holding deleted' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *                                     Export
 ******************************************************************************/
exports.default = router;
