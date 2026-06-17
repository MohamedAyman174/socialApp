import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/global-err-handler";


export const Validation = (schema: ZodType<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {   
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new AppError(result.error, 400);
        }
        next();
    }
}