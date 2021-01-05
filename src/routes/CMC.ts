import { Request, Response, Router } from "express";
import StatusCodes from 'http-status-codes';

const { OK } = StatusCodes;
import fetch from "node-fetch";


const router = Router();

// function asyncWrapper(fn) {
//     return async (req, res, next) => {
//         try {
//             const result = await Promise.resolve(fn(req));
//             return res.send(result);
//         } catch (err) {
//             return console.log(err);
//         }
//     }
// };

// async function cmcFetch() {
//     const requestOptions = {
//         method: 'GET',
//         headers: {
//             'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY
//         }
//     };

//     const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', requestOptions);
//     const json = await response.json();
//     return json;
// }

// Returns all latest listings from Coin Market Cap API
// router.route('/').get(asyncWrapper(cmcFetch));


/******************************************************************************
 *                      Get All Latest Listings - "GET /api/cmc/latest"
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
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
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