import express from "express";
import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { PORT } from "./config/config.service";
import { rateLimit } from "express-rate-limit";
import { globalErrorHandler } from "./common/utils/global-err-handler";
import { AppError } from "./common/utils/global-err-handler";
import authRouter from "./modules/auth/auth.controller";
import { checkDBConnection } from "./DB/connectionDB";
import RedisService from "./common/service/redis.service";
import uploadRouter from "./modules/upload/upload.controller";

const app: express.Application = express();
const port = PORT;


const bootstrap = () => {

    app.use(express.json());

    app.use(helmet());

    app.use(cors());

    checkDBConnection();
    // RedisService.connect();

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 9,
        message: "Too many requests , try again after 15 minutes",
        handler: (req: Request, res: Response, next: NextFunction) => {
           throw new AppError(`Too many requests , try again after 15 minutes`, 429);
        },
        legacyHeaders: false,
    }));

    app.get("/", (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ message: "Welcome on Social App" });
    });

    
    app.use("/auth", authRouter);  
    app.use("/upload", uploadRouter);

    app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
       throw new AppError(`URL ${req.originalUrl} with method ${req.method} not found`, 404);

    });

    app.use(globalErrorHandler);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });


}

export default bootstrap;