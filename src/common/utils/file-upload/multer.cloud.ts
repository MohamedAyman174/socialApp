import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import os from "node:os";
import { AppError } from "../global-err-handler";
import { StorageEnum } from "../../enum/storage.enum";

export const fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
};

export const cloudFileUpload = ({
    store = StorageEnum.memory,
    validation = [],
    maxFileSizeMB = 2,
}: {
    store?: StorageEnum;
    validation: string[];
    maxFileSizeMB?: number;
}) => {
    const storage =
        store === StorageEnum.memory
            ? multer.memoryStorage()
            : multer.diskStorage({
                destination: os.tmpdir(),
                filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
            });

    const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (!validation.includes(file.mimetype)) {
            return callback(new AppError("Invalid file format", 400));
        }
        return callback(null, true);
    };

    return multer({
        fileFilter,
        limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
        storage,
    });
};