import e from "express";
import mongoose from "mongoose";
import { MONGO_URI } from "../config/config.service";

export const checkDBConnection = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB successfully ${MONGO_URI}`);
    }
    catch (error) {
        console.error(error);
    }
}