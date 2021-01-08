import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import Holding, { IHolding } from '@entities/Holding';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                       Add A Holding - "POST /api/holdings/add"
 ******************************************************************************/

router.post('/add', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const holding: IHolding = new Holding({
            ticker: body.holding.ticker,
            name: body.holding.name,
            quantity: body.holding.quantity,
            USDPriceAtPurchase: body.holding.priceAtPurchase,
            tracker: body.holding.tracker
        });
        const newHolding: IHolding = await holding.save();
        res.status(CREATED).json({
            message: 'Holding added',
            holding: newHolding
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                      Get One Holding - "GET /api/holdings/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    let holding: IHolding | null;
    try {
        holding = await Holding.findById(req.params.id);
        if (Holding == null) {
            return res.status(404).json({ message: 'Cannot find holding' });
        }
        return res.status(OK).json({ Holding });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

/******************************************************************************
 *                       Update A Holding - "PUT /api/holdings/update"
 ******************************************************************************/

router.patch('/update', async (req: Request, res: Response) => {
    try {
        const updatedHolding = await Holding.findByIdAndUpdate(req.body.holding.id, req.body.holding)
        res.status(OK).json(updatedHolding);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                    Delete A Holding - "DELETE /api/holdings/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: Request, res: Response) => {
    try {
        await Holding.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted holding' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
