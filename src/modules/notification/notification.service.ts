import { Types } from "mongoose";
import NotificationModel, { INotification } from "../../DB/models/notification.model";
import notificationRepository from "../../DB/repositories/notification.repository";
import UserModel from "../../DB/models/user.model";
import userRepository from "../../DB/repositories/user.repository";
import { NotificationTypeEnum } from "../../common/enum/notification.enum";
import { sendPushNotification } from "../../common/service/firebase.service";
import { Request, Response, NextFunction } from "express";
import { responseSuccess } from "../../common/utils/response.success";
import { AppError } from "../../common/utils/global-err-handler";

const notificationModel = new notificationRepository(NotificationModel);
const userModel = new userRepository(UserModel);

class NotificationService {

    
    sendNotification = async ({
        receiverId,
        senderId,
        type,
        postId,
        content,
    }: {
        receiverId: Types.ObjectId;
        senderId: Types.ObjectId;
        type: NotificationTypeEnum;
        postId?: Types.ObjectId;
        content: string;
    }) => {
        const notification = await notificationModel.create({
            receiverId,
            senderId,
            type,
            postId,
            content,
        } as Partial<INotification>);

        const receiver = await userModel.findById(receiverId);
        if (receiver?.fcmTokens && receiver.fcmTokens.length > 0) {
            await sendPushNotification({
                tokens: receiver.fcmTokens,
                title: "Saraha App",
                body: content,
            });
        }

        return notification;
    };

    storeFcmToken = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.body;
        if (!token) {
            throw new AppError("FCM token is required", 400);
        }

        await userModel.findByIdAndUpdate(req.user._id, { $addToSet: { fcmTokens: token } });

        responseSuccess({ res, message: "FCM token stored successfully" });
    };

    removeFcmToken = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.body;
        if (!token) {
            throw new AppError("FCM token is required", 400);
        }

        await userModel.findByIdAndUpdate(req.user._id, { $pull: { fcmTokens: token } });

        responseSuccess({ res, message: "FCM token removed successfully" });
    };

    getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
        const notifications = await notificationModel.find({
            filter: { receiverId: req.user._id },
            options: { sort: { createdAt: -1 } },
        });

        responseSuccess({ res, message: "Notifications fetched successfully", data: { notifications } });
    };

    markAsRead = async (req: Request, res: Response, next: NextFunction) => {
       const { id } = req.params as { id: string };

        await notificationModel.findByIdAndUpdate(new Types.ObjectId(id), { isRead: true });

        responseSuccess({ res, message: "Notification marked as read" });
    };

}

export default new NotificationService();