
import { Request, response, NextFunction } from "express";
import { AppError } from "../utils/global-err-handler";
import tokenService from "../service/token.service";
import { ACCESS_SECRET_KEY } from "../../config/config.service.js";
import userRepository from "../../DB/repositories/user.repository.js";
import redisService from "../service/redis.service";
import { Interface } from "node:readline";
import { IUser } from "../../DB/models/user.model";
import { HydratedDocument } from "mongoose";
import { JwtPayload } from "jsonwebtoken";

const userModel = new userRepository()



export const authentication = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers

    if (!authorization) {
        throw new AppError("User not exist")
    }
    const [prefix, token] = authorization.split(" ")
    if (prefix !== prefix) {
        throw new AppError("Invalid token")
    }
    if (!token) {
        throw new AppError("token not found")
    }

    const decoded = tokenService.VerifyToken({
        token: token,
        secret_key: ACCESS_SECRET_KEY,
    })
    if (!decoded || !decoded) {
        throw new AppError("invalid token")
    }
    const user = await userModel.findOne({ filter: { _id: decoded } })
    if (!user) {
        throw new AppError("User not found")
    }
    if (!user?.confirmed) {     
        throw new AppError("user not confirmed", 400)

    }
    const revokeToken = await redisService.getValue(redisService.revoked_key({ userId: decoded, jti: decoded }))


    // if (user.changeCredentials && decoded.iat * 1000 < user.changeCredentials.getTime()) {
    //     throw new AppError("invalid token")    
    // }

    req.user = user
    req.decoded = decoded
    next()
} 