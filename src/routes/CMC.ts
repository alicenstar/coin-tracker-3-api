import { Request, Response, Router } from "express";
import StatusCodes from 'http-status-codes';

const { OK } = StatusCodes;
import fetch from "node-fetch";


const router = Router();


/******************************************************************************
 *                      Get Latest Listings - "GET /api/cmc/latest"
 ******************************************************************************/

router.get('/latest', async (req: Request, res: Response) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY as string
        }
    };
    try {
        const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?sort=market_cap',
            requestOptions
        );
        const json = await response.json();
        return res.status(OK).json({ json });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

/******************************************************************************
 *                      Get Latest Quotes - "GET /api/cmc/quotes"
 ******************************************************************************/

router.get('/quotes', async (req: Request, res: Response) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY as string
        }
    };
    const { queryParams } = req.body;
    try {
        const response = await fetch(
            `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?${queryParams}`,
            requestOptions
        );
        const json = await response.json();
        return res.status(OK).json({ json });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

export default router;