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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const constants_1 = require("@shared/constants");
const User_1 = __importDefault(require("@entities/User"));
const middleware_1 = require("./middleware");
const router = express_1.Router();
const { CREATED, OK } = http_status_codes_1.default;
/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/
router.get('/all', middleware_1.adminMW, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find();
        res.status(OK).json({ users });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
}));
/******************************************************************************
 *                      Get A User - "GET /api/users/:id"
 ******************************************************************************/
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // let user: IUser | null;
    try {
        User_1.default
            .findById(req.params.id)
            .populate([{ path: 'trackers', model: 'Tracker' }])
            .exec(function (err, user) {
            if (user == null) {
                return res.status(404).json({ message: 'Cannot find user' });
            }
            return res.status(OK).json({ user });
        });
        // user = await User.findById(req.params.id);
        // if (user == null) {
        //     return res.status(404).json({ message: 'Cannot find user' });
        // }
        // return res.status(OK).json({ user });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *                       Add A User - "POST /api/users/"
 ******************************************************************************/
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    let user;
    try {
        user = yield User_1.default.findOne({ username: body.username });
        if (user != null) {
            return res.status(404).json({ message: 'Username already exists' });
        }
        const pwdHash = yield bcrypt_1.default.hash(body.password, constants_1.pwdSaltRounds);
        user = new User_1.default({
            username: body.username,
            pwdHash: pwdHash,
            email: body.email,
            role: 'User'
        });
        const newUser = yield user.save();
        res.status(CREATED).json({
            message: 'User added',
            user: {
                id: newUser._id,
                username: newUser.username,
            },
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                       Update A User - "PUT /api/users/:id"
 ******************************************************************************/
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const updatedUser = yield User_1.default.findByIdAndUpdate(body.user.id, body.user);
        res.status(OK).json(updatedUser);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}));
/******************************************************************************
 *                    Delete A User - "DELETE /api/users/:id"
 ******************************************************************************/
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_1.default.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted user' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}));
/******************************************************************************
 *                                     Export
 ******************************************************************************/
exports.default = router;
