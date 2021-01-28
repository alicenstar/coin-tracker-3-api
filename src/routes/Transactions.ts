import StatusCodes from 'http-status-codes';
import {
    Request,
    Response,
    Router } from 'express';
import Transaction, { ITransaction } from '@entities/Transaction';
import mongodb from 'mongodb';


const router = Router();
const { CREATED, OK } = StatusCodes;


/******************************************************************************
 *                       Create A Transaction - "POST /api/transactions/"
 ******************************************************************************/

router.post('/', async (req: Request, res: Response) => {
    const body = req.body
    try {
        const transaction: ITransaction = new Transaction({
            coinId: body.coinId,
            quantity: mongodb.Decimal128.fromString(body.quantity),
            priceAtTransaction: mongodb.Decimal128.fromString(body.priceAtTransaction),
            type: body.type,
            tracker: body.trackerId
        });
        const newTransaction: ITransaction = await transaction.save();
        res.status(CREATED).json({
            message: 'Transaction added',
            transaction: newTransaction
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/******************************************************************************
 *                      Get A Transaction - "GET /api/transactions/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
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
 *                       Update A Transaction - "PUT /api/transactions/:id"
 ******************************************************************************/

router.put('/:id', async (req: Request, res: Response) => {
    const body = req.body;
    try {
        await res.holding!.updateOne({
            $inc: {
                quantity: mongodb.Decimal128.fromString(body.quantity),
                initialInvestment: mongodb.Decimal128.fromString((body.quantity * body.priceAtTransaction).toString())
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
 *                    Delete A Transaction - "DELETE /api/transactions/:id"
 ******************************************************************************/

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted holding' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;