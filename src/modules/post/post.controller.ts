import { Router , RequestHandler} from "express";
import postService from "./post.service";
import { authentication } from "../../common/middleware/authentication";
import { Validation } from "../../common/middleware/validation";
import * as postValidation from "./post.validation";
import { cloudFileUpload, fileValidation } from "../../common/utils/file-upload/multer.cloud";

const postRouter = Router();

postRouter.use(authentication as unknown as RequestHandler);

postRouter.post(
    "/",
    cloudFileUpload({ validation: fileValidation.image }).array("attachments", 4),
    Validation(postValidation.createPostSchema),
    postService.createPost
);

postRouter.get("/", postService.getPosts);
postRouter.get("/:id", postService.getPostById);
postRouter.patch("/:id", Validation(postValidation.updatePostSchema), postService.updatePost);
postRouter.patch("/:id/like", postService.likePost);

export default postRouter;