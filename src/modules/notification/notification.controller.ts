import { Router , RequestHandler } from "express";
import notificationService from "./notification.service";
import { authentication } from "../../common/middleware/authentication";

const notificationRouter = Router();

notificationRouter.use(authentication as unknown as RequestHandler);

notificationRouter.post("/fcm-token", notificationService.storeFcmToken);
notificationRouter.delete("/fcm-token", notificationService.removeFcmToken);
notificationRouter.get("/", notificationService.getMyNotifications);
notificationRouter.patch("/:id/read", notificationService.markAsRead);

export default notificationRouter;