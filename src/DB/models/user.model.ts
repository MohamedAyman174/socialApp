import { GenderEnum, RoleEnum, ProviderEnum  } from "../../common/enum/user.enum";
import mongoose, { Types } from "mongoose";
import { hash } from "../../common/utils/security/hash";


export interface IUser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password?: string;
    age: number;
    phone?: string;
    address?: string;
    gender?: GenderEnum;
    role?: RoleEnum;
    provider?: ProviderEnum;
    profilePic?: string;
    confirmed?: boolean;
    createdAt: Date;
    updatedAt: Date;
    fcmTokens?: string[];
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
            
            validate: {
                validator: function (value: string) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: (props: any) => `${props.value} is not a valid email address`,
            },
        },
        password: {
            type: String,
            required: function (this: IUser) {
                return this.provider === ProviderEnum.system || !this.provider;
            },
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
        provider: {
            type: String,
            enum: Object.values(ProviderEnum),
            default: ProviderEnum.system,
        },
        profilePic: {
            type: String,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
        fcmTokens: [{ type: String }],
    },
    
    {
        timestamps: true,
        strict: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
    
    
);

userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
}).set(function (value: string) {
    this.set({ firstName: value.split(' ')[0], lastName: value.split(' ')[1] });
});

userSchema.pre('save', function (next) {
    if (this.isModified('password') && this.password) {
        this.password = hash({ plain_text: this.password });
    }
    
});



userSchema.post('save', function (doc) {
    console.log(`User document saved successfully: ${doc.email}`);
});

userSchema.pre(/^find/, function (this: mongoose.Query<any, IUser>, next) {
    const projection = this.projection();
    if (!projection || !('password' in projection)) {
        this.select('-password');
    }
    
});

userSchema.pre('insertMany', async function (next, docs) {
    if (Array.isArray(docs)) {
        for (const doc of docs) {
            if (doc.password && (doc.provider === ProviderEnum.system || !doc.provider)) {
                doc.password = hash({ plain_text: doc.password });
            }
        }
    }
    next();
});

const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default UserModel;