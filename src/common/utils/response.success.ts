import { Response } from "express";


export const responseSuccess = (
    {
        res,
        status = 200,
        message = "Success",
        data = undefined
    } : {
        res: Response,
        status?: number,
        message?: string,
        data?: any 
    }
     
    ) => {
    res.status(status).json({ message, data });
}       