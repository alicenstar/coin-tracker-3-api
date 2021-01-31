import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import { pwdSaltRounds } from '@shared/constants';
import User, { IUser } from '@entities/User';
import { adminMW } from './middleware';

const router = Router();
const { CREATED, OK } = StatusCodes;



/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', adminMW, async (req: Request, res: Response) => {
    try {
        const users: IUser[] = await User.find();
        res.status(OK).json({ users });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

/******************************************************************************
 *                      Get One User - "GET /api/users/:id"
 ******************************************************************************/

router.get('/:id', async (req: Request, res: Response) => {
    let user: IUser | null;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        return res.status(OK).json({ user });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
})

/******************************************************************************
 *                       Add A User - "POST /api/users/"
 ******************************************************************************/

router.post('/', async (req: Request, res: Response) => {
    const body = req.body;
    let user: IUser | null;
    try {
        user = await User.findOne({ username: body.username });
        if (user != null) {
            return res.status(404).json({ message: 'Username already exists' });
        }
        const pwdHash = await bcrypt.hash(body.password, pwdSaltRounds);
        user = new User({
            username: body.username,
            pwdHash: pwdHash,
            email: body.email,
            role: 'User'
        });
        const newUser: IUser = await user.save();
        res.status(CREATED).json({
            message: 'User added',
            user: {
                id: newUser._id,
                username: newUser.username,
            },
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



/******************************************************************************
 *                       Update A User - "PUT /api/users/:id"
 ******************************************************************************/

router.put('/:id', async (req: Request, res: Response) => {
    const body = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            body.user.id,
            body.user
        );
        res.status(OK).json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



/******************************************************************************
 *                    Delete A User - "DELETE /api/users/:id"
 ******************************************************************************/

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(OK).json({ message: 'Deleted user' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
