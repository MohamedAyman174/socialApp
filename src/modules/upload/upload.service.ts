import { Request, Response, NextFunction } from "express";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { Types } from "mongoose";
import UserModel from "../../DB/models/user.model";
import userRepository from "../../DB/repositories/user.repository";
import { AppError } from "../../common/utils/global-err-handler";
import { responseSuccess } from "../../common/utils/response.success";
import {
    uploadFile,
    uploadFiles,
    uploadLargeFile,
    getFile,
    listFiles,
    deleteFile,
    deleteFolderContent,
    createUploadPresignedUrl,
    createGetPresignedUrl,
} from "../../common/utils/file-upload/s3.service";
import { StorageEnum } from "../../common/enum/storage.enum";

const writePipeLine = promisify(pipeline);
const userModel = new userRepository(UserModel);


class UploadService {

    uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            throw new AppError("No file provided", 400);
        }
        const userId = req.user._id;

        const Key = await uploadFile({
            file: req.file,
            path: `users/${userId}/profile`,
        });

        await userModel.findByIdAndUpdate(new Types.ObjectId(userId.toString()), { profilePic: Key });

        responseSuccess({ res, message: "Profile picture uploaded successfully", data: { Key } });
    }

    uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new AppError("No files provided", 400);
        }

        const userId = req.user._id;
        const keys = await uploadFiles({ files, path: `users/${userId}/gallery` });

        responseSuccess({ res, message: "Files uploaded successfully", data: { keys } });
    }

    uploadLargeFileHandler = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            throw new AppError("No file provided", 400);
        }
        const userId = req.user._id;

        const Key = await uploadLargeFile({
            file: req.file,
            store: StorageEnum.disk,
            path: `users/${userId}/large-files`,
        });

        responseSuccess({ res, message: "Large file uploaded successfully", data: { Key } });
    }

    getUploadPresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
        const { originalname, mimetype } = req.body;
        if (!originalname || !mimetype) {
            throw new AppError("originalname and mimetype are required", 400);
        }

        const userId = req.user._id;
        const result = await createUploadPresignedUrl({
            originalname,
            mimetype,
            path: `users/${userId}/direct-upload`,
        });

        responseSuccess({ res, message: "Presigned URL generated successfully", data: result });
    }

    getDownloadPresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
        const key = req.query.key as string;
        if (!key) {
            throw new AppError("Missing resource key", 400);
        }

        const url = await createGetPresignedUrl({ Key: key });
        responseSuccess({ res, message: "Download URL generated successfully", data: { url } });
    }

    streamFile = async (req: Request, res: Response, next: NextFunction) => {
        const key = req.query.key as string;
        if (!key) {
            throw new AppError("Missing resource key", 400);
        }

        const s3Response = await getFile({ Key: key });
        if (!s3Response?.Body) {
            throw new AppError("Failed to fetch this resource", 404);
        }

        res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

        await writePipeLine(s3Response.Body as NodeJS.ReadableStream, res);
    }

    listFolderFiles = async (req: Request, res: Response, next: NextFunction) => {
        const folderKey = req.query.folderKey as string;
        if (!folderKey) {
            throw new AppError("Missing folderKey", 400);
        }

        const result = await listFiles({ folderKey });
        responseSuccess({ res, message: "Files listed successfully", data: { files: result.Contents || [] } });
    }

    deleteSingleFile = async (req: Request, res: Response, next: NextFunction) => {
        const { key } = req.body;
        if (!key) {
            throw new AppError("Missing resource key", 400);
        }

        await deleteFile({ Key: key });
        responseSuccess({ res, message: "File deleted successfully" });
    }

    deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
        const { folderKey } = req.body;
        if (!folderKey) {
            throw new AppError("Missing folderKey", 400);
        }

        await deleteFolderContent({ folderKey });
        responseSuccess({ res, message: "Folder deleted successfully" });
    }

}

export default new UploadService();