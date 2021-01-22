import StatusCodes from 'http-status-codes';
import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router } from 'express';
import Holding, { IHolding } from '@entities/Holding';
import Transaction, { ITransaction } from '@entities/Transaction';
import Tracker from '@entities/Tracker';

const router = Router();
const { CREATED, OK } = StatusCodes;

declare global {
    namespace Express {
        export interface Response {
            holding: IHolding | null;
        }
    }
}

// Middleware
const findHolding: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body
    let holding: IHolding | null;
    try {
        if (req.params.id) {
            holding = await Holding.findById(req.params.id);
        } else {
            holding = await Holding.findOne({
                tracker: body.trackerId,
                coinId: body.coinId
            });
        }
        if (holding === null) {
            return res.status(404).json({ message: 'Cannot find holding' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.holding = holding;
    next();
}

/******************************************************************************
 *                       Create A Holding - "POST /api/holdings/"
 ******************************************************************************/

router.post('/', findHolding, async (req: Request, res: Response) => {
    const body = req.body
    try {
        const holding: IHolding = new Holding({
            coinId: body.coinId,
            quantity: body.quantity,
            tracker: body.trackerId
        });
        const newHolding: IHolding = await holding.save();
        await Tracker.updateOne({ _id: body.trackerId }, { $push: { holdings: newHolding._id }});
        res.status(CREATED).json({
            message: 'Holding added, Tracker holdings updated',
            holding: newHolding
        });

        // if (res.holding) {
        //     if (body.type === 'Buy') {
                // await res.holding.updateOne({
                //     $inc: {
                //         quantity: body.quantity,
                //         initialInvestment: body.quantity * body.priceAtPurchase
                //     }
                // });
                // const updatedHolding = await res.holding.save();

            //     const transaction: ITransaction = new Transaction({
            //         coinId: body.coinId,
            //         quantity: body.quantity,
            //         priceAtPurchase: body.priceAtPurchase,
            //         type: body.type,
            //         tracker: res.holding.tracker
            //     });
            //     const newTransaction: ITransaction = await transaction.save();
            //     res.status(OK).json({
            //         message: 'Holding updated, Transaction added',
            //         holding: updatedHolding,
            //         transaction: newTransaction
            //     });
            // }
        //     if (body.type === 'Sell'){
        //         if (Number(body.quantity) > Number(res.holding.quantity)) {
        //             throw new Error("Cannot sell more than you own");
        //         } else if (Number(body.quantity) === Number(res.holding.quantity)) {
        //             const transaction: ITransaction = new Transaction({
        //                 coinId: body.coinId,
        //                 quantity: body.quantity * -1,
        //                 priceAtPurchase: body.priceAtPurchase,
        //                 type: body.type,
        //                 tracker: res.holding.tracker
        //             });
        //             const newTransaction: ITransaction = await transaction.save();
        //             await Holding.findByIdAndDelete(res.holding._id);
        //             res.status(OK).json({
        //                 message: 'Deleted holding, Transaction added',
        //                 transaction: newTransaction
        //             });        
        //         } else {
        //             await res.holding.updateOne({
        //                 $inc: {
        //                     quantity: body.quantity * -1,
        //                     initialInvestment: (body.quantity * body.priceAtPurchase) * -1
        //                 }
        //             });
        //             const updatedHolding = await res.holding.save();
        //             const transaction: ITransaction = new Transaction({
        //                 coinId: body.coinId,
        //                 quantity: body.quantity * -1,
        //                 priceAtPurchase: body.priceAtPurchase,
        //                 type: body.type,
        //                 tracker: res.holding.tracker
        //             });
        //             const newTransaction: ITransaction = await transaction.save();
        //             res.status(OK).json({
        //                 message: 'Holding updated, Transaction added',
        //                 holding: updatedHolding,
        //                 transaction: newTransaction
        //             });
        //         }
        //     }
        // } else {
        //     if (body.type === 'Buy') {
        //         const holding: IHolding = new Holding({
        //             coinId: body.coinId,
        //             quantity: body.quantity,
        //             tracker: body.trackerId
        //         });
        //         const newHolding: IHolding = await holding.save();
        //         const transaction: ITransaction = new Transaction({
        //             coinId: body.coinId,
        //             quantity: body.quantity,
        //             priceAtPurchase: body.priceAtPurchase,
        //             type: body.type,
        //             tracker: body.trackerId
        //         });
        //         const newTransaction: ITransaction = await transaction.save();
        //         await Tracker.updateOne({ _id: body.trackerId }, { $push: { holdings: newHolding._id }});
        //         res.status(CREATED).json({
        //             message: 'Holding added, Transaction added, Tracker holdings updated',
        //             holding: newHolding,
        //             transaction: newTransaction
        //         });
        //     }
        //     if (body.type === 'Sell') {
        //         throw new Error("Cannot sell more than you own");
        //     }
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



/******************************************************************************
 *                      Get A Holding and its Transactions - "GET /api/holdings/transactions"
 ******************************************************************************/

router.get('/transactions', findHolding, async (req: Request, res: Response) => {
    try {
        if (res.holding == null) {
            return res.status(404).json({ message: 'Cannot find holding or transactions' });
        }
        const transactions = await Transaction.find({
            coinid: res.holding?.coinId,
            tracker: res.holding?.tracker
        });
        
        return res.status(OK).json({
            message: 'Holding and its transactions found',
            holding: res.holding,
            transactions: transactions
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

/******************************************************************************
 *                       Update A Holding - "PUT /api/holdings/:id"
 ******************************************************************************/

router.put('/:id', findHolding, async (req: Request, res: Response) => {
    const body = req.body;
    try {
        await res.holding!.updateOne({
            $inc: {
                quantity: body.quantity,
                initialInvestment: body.quantity * body.priceAtPurchase
            }
        });
        const updatedHolding = await res.holding!.save();
        res.status(OK).json({
            message: 'Successfully updated holding',
            holding: updatedHolding
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                    Delete A Holding - "DELETE /api/holdings/:id"
 ******************************************************************************/

router.delete('/:id', async (req: Request, res: Response) => {
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
