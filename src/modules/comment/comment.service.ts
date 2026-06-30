import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import CommentModel, { IComment } from "../../DB/models/comment.model";
import commentRepository from "../../DB/repositories/comment.repository";
import PostModel from "../../DB/models/post.model";
import postRepository from "../../DB/repositories/post.repository";
import { createCommentDTO, createReplyDTO } from "./comment.dto";
import { AppError } from "../../common/utils/global-err-handler";
import { responseSuccess } from "../../common/utils/response.success";
import { uploadFiles } from "../../common/utils/file-upload/s3.service";
import { OnModelEnum } from "../../common/enum/comment.enum";
import { AllowCommentsEnum } from "../../common/enum/post.enum";
import notificationService from "../notification/notification.service";
import { NotificationTypeEnum } from "../../common/enum/notification.enum";

const commentModel = new commentRepository(CommentModel);
const postModel = new postRepository(PostModel);

class CommentService {

    createComment = async (req: Request, res: Response, next: NextFunction) => {
        const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
        const { content }: createCommentDTO = req.body;
        const files = req.files as Express.Multer.File[];

        if (!postId) {
            throw new AppError("Post ID is required", 400);
        }

        const post = await postModel.findOne({ filter: { _id: new Types.ObjectId(postId) } });
        if (!post) {
            throw new AppError("Post not found", 404);
        }
        if (post.allowComments === AllowCommentsEnum.deny) {
            throw new AppError("Comments are disabled on this post", 403);
        }

        if (!content && (!files || files.length === 0)) {
            throw new AppError("Comment must have content or attachments", 400);
        }

        let attachments: string[] = [];
        if (files && files.length > 0) {
            attachments = await uploadFiles({ files, path: `users/${req.user._id}/comments` });
        }

        const comment = await commentModel.create({
            content,
            attachments,
            createdBy: req.user._id,
            postId: post._id,
            onModel: OnModelEnum.Post,
            commentOnId: post._id,
        } as Partial<IComment>);

        if (post.createdBy.toString() !== req.user._id.toString()) {
            await notificationService.sendNotification({
                receiverId: post.createdBy,
                senderId: req.user._id,
                type: NotificationTypeEnum.comment,
                postId: post._id,
                content: "commented on your post",
            });
        }

        responseSuccess({ res, status: 201, message: "Comment added successfully", data: { comment } });
    };

    createReply = async (req: Request, res: Response, next: NextFunction) => {
        const { commentId } = req.params as { commentId: string };
        const { content }: createReplyDTO = req.body;
        const files = req.files as Express.Multer.File[];

        const parentComment = await commentModel.findOne({ filter: { _id: new Types.ObjectId(commentId) } });
        if (!parentComment) {
            throw new AppError("Comment not found", 404);
        }

        if (!content && (!files || files.length === 0)) {
            throw new AppError("Reply must have content or attachments", 400);
        }

        let attachments: string[] = [];
        if (files && files.length > 0) {
            attachments = await uploadFiles({ files, path: `users/${req.user._id}/comments` });
        }

        const reply = await commentModel.create({
            content,
            attachments,
            createdBy: req.user._id,
            postId: parentComment.postId,
            onModel: OnModelEnum.Comment,
            commentOnId: parentComment._id,
        } as Partial<IComment>);

        if (parentComment.createdBy.toString() !== req.user._id.toString()) {
            await notificationService.sendNotification({
                receiverId: parentComment.createdBy,
                senderId: req.user._id,
                type: NotificationTypeEnum.reply,
                postId: parentComment.postId,
                content: "replied to your comment",
            });
        }

        responseSuccess({ res, status: 201, message: "Reply added successfully", data: { reply } });
    };

    getPostWithComments = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params as { postId: string };

        const post = await postModel.findOne({
            filter: { _id: new Types.ObjectId(postId) },
        });
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        
        const comments = await commentModel.find({
            filter: { onModel: OnModelEnum.Post, commentOnId: post._id },
            options: {
                sort: { createdAt: -1 },
                populate: [
                    { path: "createdBy", select: "userName profilePic" },
                    {
                        path: "replies",
                        populate: { path: "createdBy", select: "userName profilePic" },
                    },
                ],
            },
        });

        responseSuccess({
            res,
            message: "Post with comments fetched successfully",
            data: { post, comments },
        });
    };

}

export default new CommentService();