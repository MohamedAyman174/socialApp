import { populate } from 'dotenv';
import { ProjectionType, QueryFilter, QueryOptions, SaveOptions, Types, UpdateQuery } from 'mongoose';
import { Model } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../models/user.model';
import { AppError } from '../../common/utils/global-err-handler';




abstract class BaseRepository<TDocument> {
    constructor(protected _model: Model<TDocument>) { }

async create(
    data: Partial<TDocument>,
    options?: SaveOptions
): Promise<HydratedDocument<TDocument>> {
    return this._model.create(data as any, options) as Promise<HydratedDocument<TDocument>>;
}

    async findById(
        id: Types.ObjectId
    ): Promise<HydratedDocument<TDocument> | null> {
        return this._model.findById(id);
    }

    async findOne({
        filter,
        projection
    }: {
        filter: QueryFilter<TDocument>,
        projection?: ProjectionType<TDocument>
    }): Promise<HydratedDocument<TDocument> | null> {
        return this._model.findOne(filter, projection);
    }

    async find({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TDocument>,
        projection?: ProjectionType<TDocument>,
        options?: QueryOptions
    }): Promise<HydratedDocument<TDocument>[]> {
        return this._model.find(filter, projection)
            .sort(options?.sort)
            .skip(options?.skip || 0)
            .limit(options?.limit || 0)
            .populate(options?.populate as string | string[])
    }

    async findByIdAndUpdate(
        id: Types.ObjectId,
        update: UpdateQuery<TDocument>,
        options?: QueryOptions
    ): Promise<HydratedDocument<TDocument> | null> {
        return this._model.findByIdAndUpdate(id, update, { new: true, ...options });
    }

    async findOneAndUpdate(
        filter: QueryFilter<TDocument>,
        update: UpdateQuery<TDocument>,
        options?: QueryOptions
    ): Promise<HydratedDocument<TDocument> | null> {
        return this._model.findOneAndUpdate(filter, update, { new: true, ...options });
    }

    async findByIdAndDelete(
        id: Types.ObjectId
    ): Promise<HydratedDocument<TDocument> | null> {
        return this._model.findByIdAndDelete(id);
    }
}

export default BaseRepository;