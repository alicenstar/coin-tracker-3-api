import { Router } from 'express';
import UserRouter from './Users';
import AuthRouter from './Auth';
import CMCRouter from './Listings';
import HoldingRouter from './Holdings';
import TrackerRouter from './Trackers';
import TransactionRouter from './Transactions';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/auth', AuthRouter);
router.use('/listings', CMCRouter);
router.use('/trackers', TrackerRouter);
router.use('/holdings', HoldingRouter);
router.use('/transactions', TransactionRouter);

// Export the base-router
export default router;
