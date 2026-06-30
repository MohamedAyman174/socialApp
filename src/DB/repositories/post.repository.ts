import { Model } from "mongoose";
import PostModel, { IPost } from "../models/post.model";
import BaseRepository from "./base.repository";

class postRepository extends BaseRepository<IPost> {
    constructor(protected _model: Model<IPost> = PostModel) {
        super(_model);
    }
}

export default postRepository;