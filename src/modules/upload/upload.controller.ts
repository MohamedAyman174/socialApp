import { Router, RequestHandler } from "express";
import uploadService from "./upload.service";
import { authentication } from "../../common/middleware/authentication";
import { cloudFileUpload, fileValidation } from "../../common/utils/file-upload/multer.cloud";
import { StorageEnum } from "../../common/enum/storage.enum";

const uploadRouter = Router();

uploadRouter.use(authentication as unknown as RequestHandler);

uploadRouter.post(
    "/profile-picture",
    cloudFileUpload({ validation: fileValidation.image }).single("file"),
    uploadService.uploadProfilePicture
);

uploadRouter.post(
    "/multiple",
    cloudFileUpload({ validation: fileValidation.image }).array("files", 5),
    uploadService.uploadMultipleFiles
);

uploadRouter.post(
    "/large-file",
    cloudFileUpload({ store: StorageEnum.disk, validation: fileValidation.image, maxFileSizeMB: 500 }).single("file"),
    uploadService.uploadLargeFileHandler
);

uploadRouter.post("/presigned-url", uploadService.getUploadPresignedUrl);
uploadRouter.get("/download-url", uploadService.getDownloadPresignedUrl);
uploadRouter.get("/stream", uploadService.streamFile);
uploadRouter.get("/list", uploadService.listFolderFiles);
uploadRouter.delete("/file", uploadService.deleteSingleFile);
uploadRouter.delete("/folder", uploadService.deleteFolder);

export default uploadRouter;