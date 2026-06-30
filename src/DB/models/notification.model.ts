import mongoose, { Types } from "mongoose";
import { NotificationTypeEnum } from "../../common/enum/notification.enum";

export interface INotification {
    _id: Types.ObjectId;
    receiverId: Types.ObjectId;
    senderId: Types.ObjectId;
    type: NotificationTypeEnum;
    postId?: Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
    {
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(NotificationTypeEnum),
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        content: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const NotificationModel =
    mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);
export default NotificationModel;