import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
    ObjectCannedACL,
    GetObjectCommandOutput,
    DeleteObjectCommandOutput,
    DeleteObjectsCommandOutput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream } from "node:fs";
import { s3Config } from "./s3.config";
import { StorageEnum } from "../../enum/storage.enum";
import { AppError } from "../global-err-handler";
import { S3_BUCKET_NAME, APPLICATION_NAME } from "../../../config/config.service";


export const uploadFile = async ({
    store = StorageEnum.memory,
    Bucket = S3_BUCKET_NAME,
    path = "general",
    ACL = "private" as ObjectCannedACL,
    file,
}: {
    store?: StorageEnum;
    Bucket?: string;
    path?: string;
    ACL?: ObjectCannedACL;
    file: Express.Multer.File;
}): Promise<string> => {
    const Key = `${APPLICATION_NAME}/${path}/${Date.now()}__${Math.random()}/${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket,
        Key,
        ACL,
        Body: store === StorageEnum.memory ? file.buffer : createReadStream(file.path),
        ContentType: file.mimetype,
    });

    const result = await s3Config().send(command);
    if (result.$metadata.httpStatusCode !== 200) {
        throw new AppError("Failed to upload file", 500);
    }
    return Key;
};


export const uploadFiles = async ({
    files,
    store = StorageEnum.memory,
    path = "general",
    Bucket = S3_BUCKET_NAME,
    ACL = "private" as ObjectCannedACL,
}: {
    store?: StorageEnum;
    Bucket?: string;
    path?: string;
    ACL?: ObjectCannedACL;
    files: Express.Multer.File[];
}): Promise<string[]> => {
    const keys: string[] = await Promise.all(
        files.map((file) => uploadFile({ store, Bucket, ACL, path, file }))
    );
    return keys;
};


export const uploadLargeFile = async ({
    store = StorageEnum.disk,
    Bucket = S3_BUCKET_NAME,
    path = "general",
    ACL = "private" as ObjectCannedACL,
    file,
}: {
    store?: StorageEnum;
    Bucket?: string;
    path?: string;
    ACL?: ObjectCannedACL;
    file: Express.Multer.File;
}): Promise<string> => {
    const Key = `${APPLICATION_NAME}/${path}/${Date.now()}__${Math.random()}/${file.originalname}`;

    const upload = new Upload({
        client: s3Config(),
        params: {
            Bucket,
            Key,
            ACL,
            Body: store === StorageEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype,
        },
    });

    upload.on("httpUploadProgress", (progress) => {
        console.log("File upload progress:", progress);
    });

    await upload.done();
    return Key;
};


export const getFile = async ({
    Bucket = S3_BUCKET_NAME,
    Key,
}: {
    Bucket?: string;
    Key: string;
}): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({ Bucket, Key });
    return await s3Config().send(command);
};


export const listFiles = async ({
    Bucket = S3_BUCKET_NAME,
    folderKey,
}: {
    Bucket?: string;
    folderKey: string;
}) => {
    const command = new ListObjectsV2Command({
        Bucket,
        Prefix: `${APPLICATION_NAME}/${folderKey}`,
    });
    return await s3Config().send(command);
};


export const deleteFile = async ({
    Bucket = S3_BUCKET_NAME,
    Key,
}: {
    Bucket?: string;
    Key: string;
}): Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({ Bucket, Key });
    return await s3Config().send(command);
};


export const deleteFiles = async ({
    Bucket = S3_BUCKET_NAME,
    keysToDelete,
    Quiet = false,
}: {
    Bucket?: string;
    keysToDelete: string[];
    Quiet?: boolean;
}): Promise<DeleteObjectsCommandOutput> => {
    const Objects = keysToDelete.map((Key) => ({ Key }));

    const command = new DeleteObjectsCommand({
        Bucket,
        Delete: { Objects, Quiet },
    });
    return await s3Config().send(command);
};


export const deleteFolderContent = async ({
    Bucket = S3_BUCKET_NAME,
    Quiet = false,
    folderKey,
}: {
    Bucket?: string;
    Quiet?: boolean;
    folderKey: string;
}) => {
    const objects = await listFiles({ Bucket, folderKey });
    const keysToDelete = (objects.Contents?.map((obj) => obj.Key).filter(Boolean) as string[]) || [];

    if (keysToDelete.length === 0) {
        throw new AppError("No files found in this folder", 404);
    }
    return await deleteFiles({ Bucket, keysToDelete, Quiet });
};


export const createUploadPresignedUrl = async ({
    Bucket = S3_BUCKET_NAME,
    path = "general",
    originalname,
    mimetype,
    expiresIn = 3600,
}: {
    Bucket?: string;
    path?: string;
    originalname: string;
    mimetype: string;
    expiresIn?: number;
}) => {
    const Key = `${APPLICATION_NAME}/${path}/${Date.now()}-${originalname}`;
    const command = new PutObjectCommand({ Bucket, Key, ContentType: mimetype });
    const url = await getSignedUrl(s3Config(), command, { expiresIn });
    return { url, Key };
};


export const createGetPresignedUrl = async ({
    Bucket = S3_BUCKET_NAME,
    Key,
    expiresIn = 60,
    downloadName,
}: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    downloadName?: string;
}) => {
    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: `attachment; filename="${downloadName || Key.split("/").pop()}"`,
    });
    return await getSignedUrl(s3Config(), command, { expiresIn });
};