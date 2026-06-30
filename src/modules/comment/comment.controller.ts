import { Router , RequestHandler} from "express";
import commentService from "./comment.service";
import { authentication } from "../../common/middleware/authentication";
import { Validation } from "../../common/middleware/validation";
import * as commentValidation from "./comment.validation";
import { cloudFileUpload, fileValidation } from "../../common/utils/file-upload/multer.cloud";

const commentRouter = Router();

commentRouter.use(authentication as unknown as RequestHandler);

commentRouter.post(
    "/post/:postId",
    cloudFileUpload({ validation: fileValidation.image }).array("attachments", 4),
    Validation(commentValidation.createCommentSchema),
    commentService.createComment
);

commentRouter.post(
    "/:commentId/reply",
    cloudFileUpload({ validation: fileValidation.image }).array("attachments", 4),
    Validation(commentValidation.createReplySchema),
    commentService.createReply
);

commentRouter.get("/post/:postId", commentService.getPostWithComments);

export default commentRouter;