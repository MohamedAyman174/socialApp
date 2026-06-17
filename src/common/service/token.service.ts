import jwt from "jsonwebtoken";

export class TokenService {
    constructor() { }


    GenerteToken = ({
        payload,
        secret_key,
        options = {}
    }:
        {
            payload: Object,
            secret_key: string,
            options?: jwt.SignOptions

        }): string => {
        return jwt.sign(payload, secret_key, options);
    }

    VerifyToken = ({
        token,
        secret_key,
        options = {}
    }: {
        token: string,
        secret_key: string,
        options?: jwt.VerifyOptions
    }): Object | string => {
        return jwt.verify(token, secret_key, options);
    }
}
export default new TokenService();