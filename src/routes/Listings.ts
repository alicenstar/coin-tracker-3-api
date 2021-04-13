import Listing from "@entities/Listing";
import { Request, Response, Router } from "express";
import StatusCodes from 'http-status-codes';

const { OK } = StatusCodes;
import fetch from "node-fetch";

const router = Router();

export const updateListings = async () => {
    // call cmc api and store in db
    const requestOptions = {
        method: 'GET',
        headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY as string
        }
    };
    try {
        const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=400',
            requestOptions
        );
        const json = await response.json();
        let res;
        for (const listing of json.data) {
            // create or update (replace) coin listing
            res = await Listing.replaceOne(
                { id: listing.id },
                listing,
                { upsert: true }
            );
        }
        return console.log(`Listings updated`);
    } catch (err) {
        return console.log('error updating listings database')
    }
};


/******************************************************************************
 *                      Get Latest Listings - "GET /api/listings/"
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    try {
        const listings = await Listing.find().sort({ cmc_rank: 'asc' });
        return res.status(OK).json({ listings });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

export default router;