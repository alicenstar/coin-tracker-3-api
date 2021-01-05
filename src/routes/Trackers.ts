import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import Tracker, { ITracker } from '@entities/Tracker';

const router = Router();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                       Add A Tracker - "POST /api/trackers/add"
 ******************************************************************************/

router.post('/add', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const tracker: ITracker = new Tracker({
            url: body.tracker.url,
            name: body.tracker.name,
            owner: body.tracker.owner
        });
        const newTracker: ITracker = await tracker.save();
        res.status(CREATED).json({
            message: 'Tracker added',
            tracker: newTracker
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/******************************************************************************
 *                      Get One Tracker - "GET /api/trackers/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    let tracker: ITracker | null;
    try {
        tracker = await Tracker.findById(req.params.id);
        if (tracker == null) {
            return res.status(404).json({ message: 'Cannot find tracker' });
        }
        return res.status(OK).json({ tracker });
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