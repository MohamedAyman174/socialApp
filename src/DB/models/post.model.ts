import mongoose, { Types } from "mongoose";
import { AvailabilityEnum, AllowCommentsEnum } from "../../common/enum/post.enum";

export interface IPost {
    _id: Types.ObjectId;
    content?: string;
    attachments?: string[];
    availability: AvailabilityEnum;
    allowComments: AllowCommentsEnum;
    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];
    createdBy: Types.ObjectId;
    freezedAt?: Date;
    freezedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>(
    {
        content: {
            type: String,
            minlength: 2,
            maxlength: 5000,
            required: function (this: IPost) {
                
                return !this.attachments || this.attachments.length === 0;
            },
        },
        attachments: [
            {
                type: String,
            },
        ],
        availability: {
            type: String,
            enum: Object.values(AvailabilityEnum),
            default: AvailabilityEnum.public,
        },
        allowComments: {
            type: String,
            enum: Object.values(AllowCommentsEnum),
            default: AllowCommentsEnum.allow,
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        freezedAt: { type: Date },
        freezedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        strictQuery: true,
    }
);


postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
});


postSchema.pre(/^find/, function (this: mongoose.Query<any, IPost>) {
    const filter = this.getFilter();
    if (!("freezedAt" in filter)) {
        this.setQuery({ ...filter, freezedAt: { $exists: false } });
    }
});

const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
export default PostModel;