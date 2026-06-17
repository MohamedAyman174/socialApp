import { populate } from 'dotenv';
import { ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { Model } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import userModel, { IUser } from '../models/user.model';
import { AppError } from '../../common/utils/global-err-handler';
import BaseRepository from './base.repository';



class userRepository extends BaseRepository<IUser> {
    constructor(protected _model: Model<IUser>=userModel)  {
        super(_model);
     }
     

   }

export default userRepository;



