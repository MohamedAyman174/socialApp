import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";
import mongoose, { Types } from "mongoose";


export interface IUser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    age: number;
    phone?: string;
address?: string;
gender?: GenderEnum;
    role?: RoleEnum;
    confirmed?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 50,
        },
        age: {
            type: Number,
            required: true,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        gender: {
            type: String,
            enum: Object.values(GenderEnum),
        },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.user,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        strict: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
}).set(function (value: string) {
    this.set({ firstName: value.split(' ')[0], lastName: value.split(' ')[1] });
});

const UserModel = mongoose.model<IUser>('User', userSchema) || mongoose.models.User;
export default UserModel;
