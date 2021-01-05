import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

// import UserDao from '@daos/User/UserDao.mock';
import { paramMissingError, IRequest } from '@shared/constants';
import User, { IUser } from '@entities/User';
// import { userInfo } from 'os';

const router = Router();
// const userDao = new UserDao();
const { BAD_REQUEST, CREATED, OK } = StatusCodes;



/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response) => {
    // const users = await userDao.getAll();
    // return res.status(OK).json({users});

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
 *                       Add A User - "POST /api/users/add"
 ******************************************************************************/

router.post('/add', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const user: IUser = new User({
            username: body.user.username,
            password: body.user.pwdHash,
            email: body.email,
        });
        const newUser: IUser = await user.save();
        res.status(CREATED).json({
            message: 'User added',
            user: newUser
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    // const { user } = req.body;
    // if (!user) {
    //     return res.status(BAD_REQUEST).json({
    //         error: paramMissingError,
    //     });
    // }
    // await userDao.add(user);
    // return res.status(CREATED).end();
});



/******************************************************************************
 *                       Update A User - "PUT /api/users/update"
 ******************************************************************************/

router.patch('/update', async (req: Request, res: Response) => {
    // const { user } = req.body;
    // if (!user) {
    //     return res.status(BAD_REQUEST).json({
    //         error: paramMissingError,
    //     });
    // }
    // user.id = Number(user.id);
    // await userDao.update(user);
    // return res.status(OK).end();

    try {
        const updatedUser = await User.findByIdAndUpdate(req.body.user.id, req.body.user)
        res.status(OK).json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



/******************************************************************************
 *                    Delete A User - "DELETE /api/users/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: Request, res: Response) => {
    // const { id } = req.params;
    // await userDao.delete(Number(id));
    // return res.status(OK).end();

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
