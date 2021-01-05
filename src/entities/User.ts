import { Document, model, Schema } from 'mongoose';
import { ITracker } from './Tracker';

// export enum UserRoles {
//     Standard,
//     Admin,
// }

export interface IUser extends Document {
    username: string;
    pwdHash: string;
    email: string;
    trackers?: ITracker | ITracker[];
}

const userSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: 6,
        },
        pwdHash: {
            type: String,
            required: [true, 'Password is required'],
            trim: true,
            minlength: 8,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
        },
        trackers: {
            type: Schema.Types.ObjectId,
            ref: 'Tracker',
        },
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

export default model<IUser>('User', userSchema);

// export class User implements IUser {

//     public id: number;
//     public name: string;
//     public email: string;
//     public role: UserRoles;
//     public pwdHash: string;


//     constructor(
//         nameOrUser?: string | IUser,
//         email?: string,
//         role?: UserRoles,
//         pwdHash?: string,
//         id?: number,
//     ) {
//         if (typeof nameOrUser === 'string' || typeof nameOrUser === 'undefined') {
//             this.name = nameOrUser || '';
//             this.email = email || '';
//             this.role = role || UserRoles.Standard;
//             this.pwdHash = pwdHash || '';
//             this.id = id || -1;
//         } else {
//             this.name = nameOrUser.name;
//             this.email = nameOrUser.email;
//             this.role = nameOrUser.role;
//             this.pwdHash = nameOrUser.pwdHash;
//             this.id = nameOrUser.id;
//         }
//     }
// }
