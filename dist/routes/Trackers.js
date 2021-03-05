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
const Tracker_1 = __importDefault(require("@entities/Tracker"));
const csv_stringify_1 = __importDefault(require("csv-stringify"));
const Holding_1 = __importDefault(require("@entities/Holding"));
const mongodb_1 = __importDefault(require("mongodb"));
const { BAD_REQUEST, CREATED, OK } = http_status_codes_1.default;
const router = express_1.Router();
/******************************************************************************
 *                       Add A Tracker - "POST /api/trackers/"
 ******************************************************************************/
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const tracker = new Tracker_1.default({
            name: body.trackerName
        });
        if (body.user) {
            tracker.user = body.user;
        }
        const newTracker = yield tracker.save();
        return res.status(CREATED).json({
            message: 'Tracker added',
            tracker: newTracker
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                Get A Tracker + Holdings - "GET /api/trackers/:id"
 ******************************************************************************/
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Tracker_1.default
            .findById(req.params.id)
            .populate([{ path: 'holdings', model: 'Holding' }])
            .exec(function (err, tracker) {
            if (tracker == null) {
                return res.status(404).json({ message: 'Cannot find tracker' });
            }
            return res.status(OK).json({ tracker });
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}));
/******************************************************************************
 *              Download A Tracker - "GET /api/trackers/download/:id"
 ******************************************************************************/
router.get('/download/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trackerData = yield Tracker_1.default
            .findById(req.params.id)
            .populate([{ path: 'holdings', model: 'Holding' }])
            .exec();
        if (trackerData) {
            const trackerJson = trackerData.toJSON();
            const edittedHoldings = trackerJson.holdings.map((holding) => {
                delete holding._id;
                delete holding.createdAt;
                delete holding.updatedAt;
                delete holding.__v;
                holding.tracker = holding.tracker.toString();
                return holding;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'tracker-' + trackerData._id + '.csv\"');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Pragma', 'no-cache');
            csv_stringify_1.default(edittedHoldings, { header: true })
                .pipe(res);
        }
        else {
            return res.status(500).json({ message: 'No tracker found' });
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *              Upload A Tracker - "GET /api/trackers/upload/:id"
 ******************************************************************************/
router.post('/upload/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove existing holdings
        yield Tracker_1.default.deleteMany({ _id: req.body[0][3] });
        // create a new Holding document for each holding
        yield Promise.all(req.body.map((holding) => __awaiter(void 0, void 0, void 0, function* () {
            const document = new Holding_1.default({
                coinId: holding[0],
                quantity: mongodb_1.default.Decimal128.fromString(holding[1]),
                initialInvestment: mongodb_1.default.Decimal128.fromString(holding[2].toString()),
                tracker: holding[3]
            });
            const newHolding = yield document.save();
            yield Tracker_1.default.updateOne({ _id: req.params.id }, {
                $push: {
                    holdings: newHolding._id
                }
            });
        })));
        res.status(CREATED).json({
            message: 'Holdings added, Tracker holdings updated',
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *      Get A Tracker's Transactions - "GET /api/trackers/:id/transactions"
 ******************************************************************************/
router.get('/:id/transactions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Tracker_1.default
            .findById(req.params.id)
            .populate([{ path: 'holdings', model: 'Holding' }])
            .exec(function (err, tracker) {
            if (tracker == null) {
                return res.status(404).json({ message: 'Cannot find tracker' });
            }
            return res.status(OK).json({ tracker });
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}));
/******************************************************************************
 *                       Update A Tracker - "PUT /api/trackers/update"
 ******************************************************************************/
router.patch('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedTracker = yield Tracker_1.default.findByIdAndUpdate(req.body.tracker.id, req.body.tracker);
        res.status(OK).json(updatedTracker);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                    Delete A Tracker - "DELETE /api/trackers/delete/:id"
 ******************************************************************************/
router.delete('/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Tracker_1.default.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted tracker' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *                                     Export
 ******************************************************************************/
exports.default = router;
