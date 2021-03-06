import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import Tracker, { ITracker } from '@entities/Tracker';
import stringify from 'csv-stringify';
import Holding, { IHolding } from '@entities/Holding';
import mongodb from 'mongodb';


const { BAD_REQUEST, CREATED, OK } = StatusCodes;

const router = Router();


/******************************************************************************
 *                       Add A Tracker - "POST /api/trackers/"
 ******************************************************************************/

router.post('/', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const tracker: ITracker = new Tracker({
            name: body.trackerName
        });
        if (body.user) {
            tracker.user = body.user;
        }
        const newTracker: ITracker = await tracker.save();
        return res.status(CREATED).json({
            message: 'Tracker added',
            tracker: newTracker
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                Get A Tracker + Holdings - "GET /api/trackers/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    try {
        Tracker
            .findById(req.params.id)
            .populate([{path: 'holdings', model: 'Holding'}])
            .exec(function (err, tracker) {
                if (tracker == null) {
                    return res.status(404).json({ message: 'Cannot find tracker' });
                }
                return res.status(OK).json({ tracker });
            });    
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

/******************************************************************************
 *              Download A Tracker - "GET /api/trackers/download/:id"
 ******************************************************************************/

router.get('/download/:id', async (req: Request, res: Response) => {
    try {
        const trackerData = await Tracker
                                    .findById(req.params.id)
                                    .populate([{path: 'holdings', model: 'Holding'}])
                                    .exec();
        if (trackerData) {
            const trackerJson = trackerData.toJSON();
            const edittedHoldings = trackerJson.holdings.map((holding: any) => {
                delete holding._id;
                delete holding.createdAt;
                delete holding.updatedAt;
                delete holding.__v;
                holding.tracker = holding.tracker.toString()
                return holding;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition',
                'attachment; filename=\"' + 'tracker-' + trackerData._id + '.csv\"'
            );
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Pragma', 'no-cache');

            stringify(edittedHoldings, { header: true })
                .pipe(res);
        } else {
            return res.status(500).json({ message: 'No tracker found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/******************************************************************************
 *              Upload A Tracker - "GET /api/trackers/upload/:id"
 ******************************************************************************/

router.post('/upload/:id', async (req: Request, res: Response) => {
    try {
        // Remove existing holdings
        await Holding.find({ 'tracker._id': req.params.id }).deleteMany();
        // const tracker = await Tracker.findById(req.params.id)
        // tracker?.holdings.remove();
        // create a new Holding document for each holding
        await Promise.all(req.body.map(async (holding: any) => {
            const document: IHolding = new Holding({
                coinId: holding[0],
                quantity: mongodb.Decimal128.fromString(holding[1]),
                initialInvestment: mongodb.Decimal128.fromString(holding[2].toString()),
                tracker: req.params.id
            });
            const newHolding: IHolding = await document.save();
            await Tracker.updateOne({ _id: req.params.id }, {
                $push: {
                    holdings: newHolding._id
                }
            });
        }));
        res.status(CREATED).json({
            message: 'Holdings added, Tracker holdings updated',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/******************************************************************************
 *      Get A Tracker's Transactions - "GET /api/trackers/:id/transactions"
 ******************************************************************************/

router.get('/:id/transactions', async (req: Request, res: Response) => {
    try {
        Tracker
            .findById(req.params.id)
            .populate([{path: 'holdings', model: 'Holding'}])
            .exec(function (err, tracker) {
                if (tracker == null) {
                    return res.status(404).json({ message: 'Cannot find tracker' });
                }
                return res.status(OK).json({ tracker });
            });    
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

/******************************************************************************
 *                       Update A Tracker - "PUT /api/trackers/update"
 ******************************************************************************/

router.patch('/update', async (req: Request, res: Response) => {
    try {
        const updatedTracker = await Tracker.findByIdAndUpdate(req.body.tracker.id, req.body.tracker)
        res.status(OK).json(updatedTracker);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                    Delete A Tracker - "DELETE /api/trackers/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: Request, res: Response) => {
    try {
        await Tracker.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted tracker' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
