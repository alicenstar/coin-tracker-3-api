import { Router } from 'express';
import UserRouter from './Users';
import AuthRouter from './Auth';
import CMCRouter from './CMC';
import HoldingsRouter from './Holdings';
import TrackerRouter from './Trackers';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/auth', AuthRouter);
router.use('/cmc', CMCRouter);
router.use('/trackers', TrackerRouter);
router.use('/holdings', HoldingsRouter);

// Export the base-router
export default router;
