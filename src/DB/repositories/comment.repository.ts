import { Model } from "mongoose";
import CommentModel, { IComment } from "../models/comment.model";
import BaseRepository from "./base.repository";

class commentRepository extends BaseRepository<IComment> {
    constructor(protected _model: Model<IComment> = CommentModel) {
        super(_model);
    }
}

export default commentRepository;