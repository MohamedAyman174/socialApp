import { Request, Response, NextFunction } from "express";


export class AppError extends Error {
        constructor(public message: any,public statusCode: number=500) {
            super(message);
            this.message = message;
            this.statusCode = statusCode;
        }
    }


export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        status: statusCode
    });
};