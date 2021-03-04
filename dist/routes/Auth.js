"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = require("express");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const JwtService_1 = require("@shared/JwtService");
const constants_1 = require("@shared/constants");
const User_1 = __importDefault(require("@entities/User"));
const router = express_1.Router();
const jwtService = new JwtService_1.JwtService();
const { BAD_REQUEST, OK, UNAUTHORIZED, NOT_FOUND } = http_status_codes_1.default;
/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check email and password present
    const { username, password } = req.body;
    if (!(username && password)) {
        return res.status(BAD_REQUEST).json({
            error: constants_1.paramMissingError,
        });
    }
    // Fetch user
    let user;
    try {
        user = yield User_1.default
            .findOne({ username: username })
            .populate([{ path: 'trackers', model: 'Tracker' }])
            .exec();
        if (user == null) {
            return res.status(UNAUTHORIZED).json({ error: constants_1.loginFailedErr });
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
    // user = await user.execPopulate([{path: 'trackers', model: 'Tracker'}]);
    console.log('user', user);
    // Check password
    const pwdPassed = yield bcrypt_1.default.compare(password, user.pwdHash);
    if (!pwdPassed) {
        return res.status(UNAUTHORIZED).json({
            error: constants_1.loginFailedErr,
        });
    }
    // Setup Admin Cookie
    const jwt = yield jwtService.getJwt({
        id: user._id,
        username: user.username,
        role: user.role
    });
    const { key, options } = constants_1.cookieProps;
    res.cookie(key, jwt, options);
    // Return
    return res.status(OK).json({
        user: {
            id: user._id,
            username: user.username,
        },
        trackers: user.trackers
    });
}));
/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/
router.get('/logout', (req, res) => {
    const { key, options } = constants_1.cookieProps;
    res.clearCookie(key, options);
    return res.status(OK).end();
});
/******************************************************************************
 *                                 Export Router
 ******************************************************************************/
exports.default = router;
