import { Model } from "mongoose";
import NotificationModel, { INotification } from "../models/notification.model";
import BaseRepository from "./base.repository";

class notificationRepository extends BaseRepository<INotification> {
    constructor(protected _model: Model<INotification> = NotificationModel) {
        super(_model);
    }
}

export default notificationRepository;