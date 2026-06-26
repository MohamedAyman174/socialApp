import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../../DB/models/user.model';
import { signupDTO, confirmEmailDTO, resendOtpDTO, googleLoginDTO } from './auth.dto';
import BaseRepository from '../../DB/repositories/base.repository';
import UserModel from '../../DB/models/user.model';
import { HydratedDocument } from 'mongoose';
import userRepository from '../../DB/repositories/user.repository';
import { compare } from '../../common/utils/security/hash';
import { encrypt, decrypt } from '../../common/utils/security/encrypt';
import { sendEmail, generateOTP } from '../../common/utils/email/send.email';
import { emailTemplate } from '../../common/utils/email/email.temp';
import { AppError } from '../../common/utils/global-err-handler';
import { EventEnum } from '../../common/enum/event.enum';
import { ProviderEnum } from '../../common/enum/user.enum';
import { eventEmitter } from '../../common/utils/email/email.events';
import { responseSuccess } from '../../common/utils/response.success';
import redisService from '../../common/service/redis.service';
import { randomUUID } from 'node:crypto';
import TokenService from '../../common/service/token.service';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import {
    ACCESS_SECRET_KEY,
    ACCESS_TOKEN_EXPIRE_TIME,
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_EXPIRE_TIME,
    GOOGLE_CLIENT_ID
} from '../../config/config.service';


const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);


class AuthService {
    private readonly _userModel = new userRepository(UserModel);
    private readonly _redisService = redisService;
    private readonly _tokenService = TokenService;
    constructor() { }

    signUp = async (req: Request, res: Response, next: NextFunction) => {
        const { userName, email, password, age, phone, address, gender }: signupDTO = req.body;

        const emailExists = await this._userModel.findOne({ filter: { email } });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        
        const user: HydratedDocument<IUser> = await this._userModel.create({
            userName,
            email,
            password,
            age,
            phone: phone ? encrypt(phone) : undefined,
            address,
            gender,
        } as Partial<IUser>)

        const otp = await generateOTP();

        eventEmitter.emit(EventEnum.confirmEmail, sendEmail({
            to: email,
            subject: "Welcome to our social media app",
            html: emailTemplate(Number(otp))
        }))



        await sendEmail({
            to: email,
            subject: "Welcome to our social media app",
            html: emailTemplate(Number(otp))
        })
        await this._redisService.setValue({ key: `otp:${email}:${EventEnum.confirmEmail}`, value: otp, ttl: 5 * 60 });
        await this._redisService.setValue({ key: `otp:${email}:max_otp`, value: 0, ttl: 60 * 60 });


        res.status(201).json({ message: 'signed up successfully', user });
    }
    confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email, code }: confirmEmailDTO = req.body
        const otpValue = await this._redisService.getValue({ key: this._redisService.otp_key({ email }) })
        if (!otpValue) {
            throw new AppError("OTP expired")
        }
        if (!compare({ plain_text: code, cipher_text :String(otpValue) })) {
            throw new AppError("Invalid OTP")
        }
        const user = await this._userModel.findOneAndUpdate(
            { email, confirmed: { $exists: false }, provider: ProviderEnum.system },
            { confirmed: true },
            { new: true }
        )

        if (!user) {
            throw new AppError("User not found")
        }
        await this._redisService.del({ key: this._redisService.otp_key({ email }) })
        responseSuccess({ res, message: "Email confirmed successfully" })

    }

    signIn = async (req: Request, res: Response, next: NextFunction) => {

        const { email, password } = req.body;

        const user = await this._userModel.findOne({
            filter: {
                email,
                provider: ProviderEnum.system,
                confirmed: { $exists: true }
            }


        });

        if (!user) {
            throw new AppError("User not found");
        }

        const match = compare({
            plain_text: password,
            cipher_text: user.password || ""
        });

        if (!match) {
            throw new AppError("Invalid password");
        }
        const jwtid = randomUUID()

        const access_token = this._tokenService.GenerteToken({
            payload: { id: user._id, email: user.email },
            secret_key: ACCESS_SECRET_KEY,
            options: {
                expiresIn: Number(ACCESS_TOKEN_EXPIRE_TIME),
                jwtid
            }
        });
        const refresh_token = this._tokenService.GenerteToken({
            payload: { id: user._id, email: user.email },
            secret_key: REFRESH_SECRET_KEY,
            options: {
                expiresIn: Number(REFRESH_TOKEN_EXPIRE_TIME),
                jwtid
            }
        });



    };

    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const user = await this._userModel.findById(new Types.ObjectId(id as string));

        if (!user) {
            throw new AppError("User not found");
        }

        responseSuccess({ res, message: "Profile fetched successfully", data: { user } });
    }

    resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        const { email }: resendOtpDTO = req.body;

        const isBlocked = await this._redisService.exists({
            key: this._redisService.blocked_otp_key(email)
        });
        if (isBlocked) {
            throw new AppError("Too many OTP requests, please try again after an hour", 429);
        }

        const user = await this._userModel.findOne({
            filter: { email, confirmed: false }
        });
        if (!user) {
            throw new AppError("User not found or already confirmed");
        }

        const maxOtpKey = this._redisService.max_otp_key(email);
        const attempts = await this._redisService.incr({ key: maxOtpKey });
        if (attempts === 1) {
            await this._redisService.expire({ key: maxOtpKey, ttl: 60 * 60 });
        }
        if (attempts && attempts > 5) {
            await this._redisService.setValue({
                key: this._redisService.blocked_otp_key(email),
                value: true,
                ttl: 60 * 60
            });
            throw new AppError("Too many OTP requests, please try again after an hour", 429);
        }

        const otp = await generateOTP();

        await this._redisService.del({ key: this._redisService.otp_key({ email }) });
        await this._redisService.setValue({
            key: this._redisService.otp_key({ email }),
            value: otp,
            ttl: 5 * 60
        });

        await sendEmail({
            to: email,
            subject: "Resend OTP - Confirm your email",
            html: emailTemplate(Number(otp))
        });

        responseSuccess({ res, message: "OTP resent successfully" });
    }

    googleLogin = async (req: Request, res: Response, next: NextFunction) => {
        const { idToken }: googleLoginDTO = req.body;

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new AppError("Invalid Google token", 400);
        }

        const { email, given_name, family_name } = payload;

        let user = await this._userModel.findOne({ filter: { email } });

        if (user && user.provider !== ProviderEnum.google) {
            throw new AppError("This email is already registered with a different sign-in method", 409);
        }

        if (!user) {
            user = await this._userModel.create({
                userName: email.split("@")[0] + "_" + randomUUID().slice(0, 4),
                email,
                firstName: given_name || "Google",
                lastName: family_name || "User",
                age: 18, 
                provider: ProviderEnum.google,
                confirmed: true,
            } as Partial<IUser>);
        }

        const jwtid = randomUUID();

        const access_token = this._tokenService.GenerteToken({
            payload: { id: user._id, email: user.email },
            secret_key: ACCESS_SECRET_KEY,
            options: {
                expiresIn: Number(ACCESS_TOKEN_EXPIRE_TIME),
                jwtid
            }
        });
        const refresh_token = this._tokenService.GenerteToken({
            payload: { id: user._id, email: user.email },
            secret_key: REFRESH_SECRET_KEY,
            options: {
                expiresIn: Number(REFRESH_TOKEN_EXPIRE_TIME),
                jwtid
            }
        });

        responseSuccess({
            res,
            message: "Logged in with Google successfully",
            data: { access_token, refresh_token, user }
        });
    }

}
export default new AuthService();