import StatusCodes from 'http-status-codes';
import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router } from 'express';
import Holding, { IHolding } from '@entities/Holding';
import Tracker from '@entities/Tracker';
import mongodb from 'mongodb';

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
    let holding: IHolding | null;
    try {
        holding = await Holding.findById(req.params.id);
        if (holding === null) {
            return res.status(404).json({ message: 'Cannot find holding' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.holding = holding;
    next();
};

/******************************************************************************
 *                       Create A Holding - "POST /api/holdings/"
 ******************************************************************************/

router.post('/', async (req: Request, res: Response) => {
    const body = req.body;
    const initialInvestment = parseFloat(body.priceAtTransaction) * parseFloat(body.quantity);
    try {
        const holding: IHolding = new Holding({
            coinId: body.coinId,
            quantity: mongodb.Decimal128.fromString(body.quantity),
            initialInvestment: mongodb.Decimal128.fromString(initialInvestment.toString()),
            tracker: body.trackerId
        });
        const newHolding: IHolding = await holding.save();
        await Tracker.updateOne({ _id: body.trackerId }, {
            $push: {
                holdings: newHolding._id
            }
        });
        res.status(CREATED).json({
            message: 'Holding added, Tracker holdings updated',
            holding: newHolding
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/******************************************************************************
 *                       Update A Holding - "PUT /api/holdings/:id"
 ******************************************************************************/

router.put('/:id', async (req: Request, res: Response) => {
    const body = req.body;
    const initialInvestment = parseFloat(body.priceAtTransaction) * parseFloat(body.quantity);

    try {
        if (body.quantity === 0) {
            const result = await Holding.deleteOne({ coinId: body.coinId });
            res.status(OK).json({
                message: 'Successfully updated and deleted holding',
                result: result
            });
        } else {
            const updatedHolding = await Holding.findOneAndUpdate({ _id: req.params.id }, {
                $inc: {
                    quantity: mongodb.Decimal128.fromString(body.quantity.toString()),
                    initialInvestment: mongodb.Decimal128.fromString(initialInvestment.toString())
                }
            }, { new: true });
            res.status(OK).json({
                message: 'Successfully updated holding',
                holding: updatedHolding
            });
        }
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
        res.status(OK).json({ message: 'Holding deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
