"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("mongoose");
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const routes_1 = __importDefault(require("./routes"));
const Logger_1 = __importDefault(require("@shared/Logger"));
const constants_1 = require("@shared/constants");
const Listings_1 = require("./routes/Listings");
const app = express_1.default();
const { BAD_REQUEST } = http_status_codes_1.default;
// set('debug', true);
mongoose_1.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose_1.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));
/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cookie_parser_1.default(constants_1.cookieProps.secret));
// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan_1.default('dev'));
}
// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet_1.default());
}
// Add APIs
app.use('/api', routes_1.default);
// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    Logger_1.default.err(err, true);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});
/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/
Listings_1.updateListings();
// Update listings data every minute and a half
const requestLoop = setInterval(Listings_1.updateListings, 90000);
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
exports.default = app;
