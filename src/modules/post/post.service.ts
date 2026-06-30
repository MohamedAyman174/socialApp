import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import PostModel, { IPost } from "../../DB/models/post.model";
import postRepository from "../../DB/repositories/post.repository";
import { createPostDTO, updatePostDTO, getPostsDTO } from "./post.dto";
import { AppError } from "../../common/utils/global-err-handler";
import { responseSuccess } from "../../common/utils/response.success";
import { uploadFiles } from "../../common/utils/file-upload/s3.service";
import { AvailabilityEnum } from "../../common/enum/post.enum";
import notificationService from "../notification/notification.service";
import { NotificationTypeEnum } from "../../common/enum/notification.enum";

const postModel = new postRepository(PostModel);

class PostService {

    createPost = async (req: Request, res: Response, next: NextFunction) => {
        const { content, availability, allowComments, tags }: createPostDTO = req.body;
        const files = req.files as Express.Multer.File[];

        if (!content && (!files || files.length === 0)) {
            throw new AppError("Post must have content or attachments", 400);
        }

        let attachments: string[] = [];
        if (files && files.length > 0) {
            attachments = await uploadFiles({
                files,
                path: `users/${req.user._id}/posts`,
            });
        }

        const post = await postModel.create({
            content,
            attachments,
            availability,
            allowComments,
            tags: tags?.map((id) => new Types.ObjectId(id)),
            createdBy: req.user._id,
        } as Partial<IPost>);

        responseSuccess({ res, status: 201, message: "Post created successfully", data: { post } });
    };

    getPosts = async (req: Request, res: Response, next: NextFunction) => {
        const { page = 1, limit = 10 }: getPostsDTO = req.query as any;


        const posts = await postModel.find({
            filter: {
                $or: [
                    { availability: AvailabilityEnum.public },
                    { createdBy: req.user._id },
                ],
            },
            options: {
                sort: { createdAt: -1 },
                skip: (page - 1) * limit,
                limit,
                populate: [
                    { path: "createdBy", select: "userName email profilePic" },
                    { path: "comments" },
                ],
            },
        });

        responseSuccess({
            res,
            message: "Posts fetched successfully",
            data: { posts, page, limit },
        });
    };

    getPostById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };

        const post = await postModel.findOne({
            filter: { _id: new Types.ObjectId(id) },
        });

        if (!post) {
            throw new AppError("Post not found", 404);
        }

        responseSuccess({ res, message: "Post fetched successfully", data: { post } });
    };

    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const { content, availability, allowComments, tags }: updatePostDTO = req.body;

        const post = await postModel.findOne({ filter: { _id: new Types.ObjectId(id) } });
        if (!post) {
            throw new AppError("Post not found", 404);
        }
        if (post.createdBy.toString() !== req.user._id.toString()) {
            throw new AppError("You are not allowed to update this post", 403);
        }

        const updatedPost = await postModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            {
                ...(content && { content }),
                ...(availability && { availability }),
                ...(allowComments && { allowComments }),
                ...(tags && { tags: tags.map((t) => new Types.ObjectId(t)) }),
            }
        );

        responseSuccess({ res, message: "Post updated successfully", data: { post: updatedPost } });
    };

    likePost = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };
        const userId = req.user._id;

        const post = await postModel.findOne({ filter: { _id: new Types.ObjectId(id) } });
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        const alreadyLiked = post.likes?.some((likeId) => likeId.toString() === userId.toString());

        if (!alreadyLiked && post.createdBy.toString() !== userId.toString()) {
            await notificationService.sendNotification({
                receiverId: post.createdBy,
                senderId: userId,
                type: NotificationTypeEnum.like,
                postId: post._id,
                content: "liked your post",
            });
        }

        const updatedPost = alreadyLiked
            ? await postModel.findByIdAndUpdate(new Types.ObjectId(id), { $pull: { likes: userId } })
            : await postModel.findByIdAndUpdate(new Types.ObjectId(id), { $addToSet: { likes: userId } });

        responseSuccess({
            res,
            message: alreadyLiked ? "Post unliked successfully" : "Post liked successfully",
            data: { post: updatedPost },
        });
    };

}

export default new PostService();