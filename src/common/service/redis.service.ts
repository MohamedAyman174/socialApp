import { createClient, RedisClientType } from "redis";
import { REDIS_URL } from "../../config/config.service";
import e from "express";
import { log } from "node:console";
import { EventEnum } from "../enum/event.enum";
import { Types } from "mongoose";




class RedisService {
    revoked_key(arg0: { userId: string | Object; jti: string | Object; }): { key: string; } {
        throw new Error("Method not implemented.");
    }
    private readonly client: RedisClientType;
    constructor() {
        this.client = createClient({
            url: REDIS_URL,
        })
        this.handleEvent();
    }
    handleEvent() {
        this.client.on("error", (err) => {
            log("Redis Error:", err);
        });
    }

    async connect() {
        this.client.connect()
        log("Connected to Redis successfully");
    }


    revokeToken = ({ userId, jti }: { userId: Types.ObjectId, jti: string }) => {
        `revokeToken:${userId}:${jti}`
    }


    get_key = (userId: Types.ObjectId) => {
        `otp:${userId}`
    }


    otp_key = ({ email, subject = EventEnum.confirmEmail }: { email: string, subject?: EventEnum }) => {
        return `otp:${email}:${subject}`
    }


    max_otp_key = (email: string) => {
        return `otp:${email}:max_otp`
    }


    blocked_otp_key = (email: string) => {
        return `${this.otp_key({ email })}:blocked_otp`
    }


    getRevokeToken = ({ userId, jti }: { userId: Types.ObjectId, jti: string }) => {
        return `revokeToken:${userId}:${jti}`
    }


    setValue = async ({ key, value, ttl }: { key: string, value: any, ttl: number }) => {
        try {
            const data = typeof value === "object" ? JSON.stringify(value) : value;
            await this.client.set(key, data, {
                EX: ttl
            });
        } catch (error) {
            console.log("Error setting value in Redis:", error);
        }
    };

    update = async ({ key, value, ttl }: { key: string, value: any, ttl: number }) => {
        if (!(await this.client.exists(key))) {
            console.log(`Key ${key} does not exist in Redis. Cannot update.`);
            return;
        }
        try {
            return await this.setValue({ key, value, ttl })
        } catch (error) {
            console.log("Error updating value in Redis:", error);
        }
    }

    getValue = async ({ key }: { key: string }) => {
        try {
            const data = await this.client.get(key);
            return typeof data === "string" && data.startsWith("{") ? JSON.parse(data) : data;
        } catch (error) {
            console.log("Error getting value from Redis:", error);
        }
    };

    ttl = async ({ key }: { key: string }) => {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.log("Error getting TTL from Redis:", error);
        }
    };

    del = async ({ key }: { key: string }) => {
        try {
            await this.client.del(key);
        } catch (error) {
            console.log("Error deleting value from Redis:", error);
        }
    };

    exists = async ({ key }: { key: string }) => {
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.log("Error checking existence in Redis:", error);
        }
    };

    expire = async ({ key, ttl }: { key: string, ttl: number }) => {
        try {
            await this.client.expire(key, ttl);
        } catch (error) {
            console.log("Error setting expiration in Redis:", error);
        }
    };
    keys = async ({ pattern }: { pattern: string }) => {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            console.log("Error getting keys from Redis:", error);
        }
    };
    incr = async ({ key }: { key: string }) => {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.log("Error incrementing value in Redis:", error);
        }
    };




}



export default new RedisService();