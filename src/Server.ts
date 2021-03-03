import cookieParser from 'cookie-parser';
import cors from 'cors';
import { set, connect, connection } from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { NextFunction, Request, Response } from 'express';

import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import { cookieProps } from '@shared/constants';
import { updateListings } from './routes/Listings';
import http from "http";
import url from "url";

const app = express();
const { BAD_REQUEST } = StatusCodes;

// set('debug', true);
connect(process.env.DATABASE_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));


/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(cookieProps.secret));

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.err(err, true);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});


/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

updateListings();
// Update listings data every minute and a half
const requestLoop = setInterval(updateListings, 90000);


/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

// const viewsDir = path.join(__dirname, 'views');
// app.set('views', viewsDir);
// const staticDir = path.join(__dirname, 'public');
// app.use(express.static(staticDir));

// app.get('/', (req: Request, res: Response) => {
//     res.sendFile('login.html', {root: viewsDir});
// });

// app.get('/users', (req: Request, res: Response) => {
//     const jwt = req.signedCookies[cookieProps.key];
//     if (!jwt) {
//         res.redirect('/');
//     } else {
//         res.sendFile('users.html', {root: viewsDir});
//     }
// });



/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
