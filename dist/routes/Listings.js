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
exports.updateListings = void 0;
const Listing_1 = __importDefault(require("@entities/Listing"));
const express_1 = require("express");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const { OK } = http_status_codes_1.default;
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = express_1.Router();
exports.updateListings = () => __awaiter(void 0, void 0, void 0, function* () {
    // call cmc api and store in db
    const requestOptions = {
        method: 'GET',
        headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY
        }
    };
    try {
        const response = yield node_fetch_1.default('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=500', requestOptions);
        const json = yield response.json();
        let res;
        for (const listing of json.data) {
            // create or update (replace) coin listing
            res = yield Listing_1.default.replaceOne({ id: listing.id }, listing, { upsert: true });
        }
        return console.log(`Listings updated`);
    }
    catch (err) {
        return console.log('error updating listings database');
    }
});
/******************************************************************************
 *                      Get Latest Listings - "GET /api/listings/"
 ******************************************************************************/
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listings = yield Listing_1.default.find().sort({ cmc_rank: 'asc' });
        return res.status(OK).json({ listings });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}));
exports.default = router;
