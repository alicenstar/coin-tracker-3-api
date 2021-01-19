import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import Holding, { IHolding } from '@entities/Holding';
import Transaction, { ITransaction } from '@entities/Transaction';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                       Buy/Sell A Holding - "POST /api/holdings/new"
 ******************************************************************************/

router.post('/new', async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // Check if user already holds that coin
        const coin = await Holding.findOne({ coinId: body.transaction.coinId });
        if (coin) {
            if (body.transaction.type === 'Buy') {
                coin.quantity += body.transaction.quantity;
                const updatedHolding = await coin.save();
                const transaction: ITransaction = new Transaction({
                    coinId: body.transaction.coinId,
                    quantity: body.transaction.quantity,
                    tracker: coin.tracker
                });
                const newTransaction: ITransaction = await transaction.save();
                res.status(OK).json({
                    message: 'Holding updated, Transaction added',
                    holding: updatedHolding,
                    transaction: newTransaction
                });
            }
            if (body.transaction.type === 'Sell'){
                if (body.transaction.quantity > coin.quantity) {
                    throw "Cannot sell more than you own";
                } else if (body.transaction.quantity === coin.quantity) {
                    const transaction: ITransaction = new Transaction({
                        coinId: body.transaction.coinId,
                        quantity: body.transaction.quantity * -1,
                        tracker: coin.tracker
                    });
                    const newTransaction: ITransaction = await transaction.save();
                    await coin.deleteOne();
                    res.status(OK).json({
                        message: 'Deleted holding, Transaction added',
                        transaction: newTransaction
                    });        
                } else {
                    coin.quantity -= body.transaction.quantity;
                    const updatedHolding = await coin.save();
                    const transaction: ITransaction = new Transaction({
                        coinId: body.transaction.coinId,
                        quantity: body.transaction.quantity * -1,
                        tracker: coin.tracker
                    });
                    const newTransaction: ITransaction = await transaction.save();
                    res.status(OK).json({
                        message: 'Holding updated, Transaction added',
                        holding: updatedHolding,
                        transaction: newTransaction
                    });
                }
            }
        } else {
            if (body.transaction.type === 'Buy') {
                const holding: IHolding = new Holding({
                    coinId: body.transaction.coinId,
                    quantity: body.transaction.quantity,
                    tracker: body.transaction.tracker
                });
                const newHolding: IHolding = await holding.save();
                const transaction: ITransaction = new Transaction({
                    coinId: body.transaction.coinId,
                    quantity: body.transaction.quantity,
                    tracker: holding.tracker
                });
                const newTransaction: ITransaction = await transaction.save();
                res.status(CREATED).json({
                    message: 'Holding added, Transaction added',
                    holding: newHolding,
                    transaction: newTransaction
                });
            }
            if (body.transaction.type === 'Sell') {
                throw "Cannot sell more than you own";
            }
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                       Buy/Sell A Holding - "POST /api/holdings/sell"
 ******************************************************************************/

router.post('/sell', async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // Check if user already holds that coin
        const coin = await Holding.findOne({ coinId: body.transaction.coinId });
        if (coin) {
            if (body.transaction.quantity > coin.quantity) {
                throw "Cannot sell more than you own";
            } else if (body.transaction.quantity === coin.quantity) {
                const transaction: ITransaction = new Transaction({
                    coinId: body.transaction.coinId,
                    quantity: body.transaction.quantity * -1,
                    tracker: coin.tracker
                });
                const newTransaction: ITransaction = await transaction.save();
                await coin.deleteOne();
                res.status(OK).json({
                    message: 'Deleted holding, Transaction added',
                    transaction: newTransaction
                });        
            } else {
                coin.quantity -= body.transaction.quantity;
                const updatedHolding = await coin.save();
                const transaction: ITransaction = new Transaction({
                    coinId: body.transaction.coinId,
                    quantity: body.transaction.quantity * -1,
                    tracker: coin.tracker
                });
                const newTransaction: ITransaction = await transaction.save();
                res.status(OK).json({
                    message: 'Holding updated, Transaction added',
                    holding: updatedHolding,
                    transaction: newTransaction
                });
            }
        } else {
            throw "Cannot sell more than you own";
        }
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
