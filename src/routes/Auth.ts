import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import StatusCodes from 'http-status-codes';
import { JwtService } from '@shared/JwtService';
import {
    paramMissingError,
    loginFailedErr,
    cookieProps,
    pwdSaltRounds
} from '@shared/constants';
import User, { IUser } from '@entities/User';

const router = Router();
const jwtService = new JwtService();
const { BAD_REQUEST, OK, UNAUTHORIZED, NOT_FOUND } = StatusCodes;


/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

router.post('/login', async (req: Request, res: Response) => {
    // Check email and password present
    const { username, password } = req.body;
    if (!(username && password)) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    
    // Fetch user
    let user: IUser | null;
    try {
        user = await User
                        .findOne({ username: username })
                        .populate([{path: 'trackers', model: 'Tracker'}])
                        .exec();
        if (user == null) {
            return res.status(UNAUTHORIZED).json({ error: loginFailedErr });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    // user = await user.execPopulate([{path: 'trackers', model: 'Tracker'}]);
    console.log('user', user);
    // Check password
    const pwdPassed = await bcrypt.compare(password, user.pwdHash);
    if (!pwdPassed) {
        return res.status(UNAUTHORIZED).json({
            error: loginFailedErr,
        });
    }
    // Setup Admin Cookie
    const jwt = await jwtService.getJwt({
        id: user._id,
        username: user.username,
        role: user.role
    });
    const { key, options } = cookieProps;
    res.cookie(key, jwt, options);
    // Return
    return res.status(OK).json({
        user: {
            id: user._id,
            username: user.username,
        },
        trackers: user.trackers
    });
});



/******************************************************************************
 *                      Logout - "GET /api/auth/logout"
 ******************************************************************************/

router.get('/logout', (req: Request, res: Response) => {
    const { key, options } = cookieProps;
    res.clearCookie(key, options);
    return res.status(OK).end();
});



/******************************************************************************
 *                                 Export Router
 ******************************************************************************/

export default router;
