import mongoose, { Types } from "mongoose";
import { OnModelEnum } from "../../common/enum/comment.enum";

export interface IComment {
    _id: Types.ObjectId;
    content?: string;
    attachments?: string[];
    createdBy: Types.ObjectId;
    postId: Types.ObjectId;
    onModel: OnModelEnum;
    commentOnId: Types.ObjectId;
    likes?: Types.ObjectId[];
    freezedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>(
    {
        content: {
            type: String,
            minlength: 1,
            maxlength: 2000,
            required: function (this: IComment) {
                return !this.attachments || this.attachments.length === 0;
            },
        },
        attachments: [{ type: String }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        onModel: {
            type: String,
            enum: Object.values(OnModelEnum),
            required: true,
            default: OnModelEnum.Post,
        },
        commentOnId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "onModel",
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        freezedAt: { type: Date },
    },
    {
        timestamps: true,
        strictQuery: true,
    }
);


commentSchema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "commentOnId",
});

commentSchema.pre(/^find/, function (this: mongoose.Query<any, IComment>) {
    const filter = this.getFilter();
    if (!("freezedAt" in filter)) {
        this.setQuery({ ...filter, freezedAt: { $exists: false } });
    }
});

const CommentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
export default CommentModel;