import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import StatusCodes from 'http-status-codes';

// import UserDao from '@daos/User/UserDao.mock';
import { JwtService } from '@shared/JwtService';
import { paramMissingError, loginFailedErr, cookieProps, IRequest } from '@shared/constants';
import User, { IUser } from '@entities/User';

const router = Router();
// const userDao = new UserDao();
const jwtService = new JwtService();
const { BAD_REQUEST, OK, UNAUTHORIZED, NOT_FOUND } = StatusCodes;



/******************************************************************************
 *                      Login User - "POST /api/auth/login"
 ******************************************************************************/

router.post('/login', async (req: IRequest, res: Response) => {
    // Check email and password present
    const { email, pwdHash } = req.body;
    if (!(email && pwdHash)) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    
    // Fetch user
    let user: IUser | null;
    try {
        user = await User.findOne({ 'email': email });
        if (user == null) {
            return res.status(UNAUTHORIZED).json({ error: loginFailedErr });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    
    // Check password
    const pwdPassed = await bcrypt.compare(pwdHash, user.pwdHash);
    if (!pwdPassed) {
        return res.status(UNAUTHORIZED).json({
            error: loginFailedErr,
        });
    }
    // Setup Admin Cookie
    const jwt = await jwtService.getJwt({
        id: user.id,
        username: user.username,
    });
    const { key, options } = cookieProps;
    res.cookie(key, jwt, options);
    // Return
    return res.status(OK).end();
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
