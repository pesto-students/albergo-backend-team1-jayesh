import { IPayload } from "../utils/helperFunctions";
export interface IParsedToken extends IPayload {
    iat: number;
    exp: number;
}

export const parseJWT = (token: string | null) => {
    return token === null
        ? null
        : (JSON.parse(
            Buffer.from(token, 'base64').toString()
        ) as IParsedToken) ?? null;
};

export const fullParseJWT = (token: string | null) => {
    if (token) {
        const bearer = token.split(".");
        const bearerToken = bearer[1];
        return parseJWT(bearerToken);
    }
    return null;
};

export const validateJWT = (token: IParsedToken | null) => {
    if (!token) return false;
    const tokenexp = new Date(0);
    tokenexp.setUTCSeconds(token.exp);
    if (Date.now() <= +tokenexp) {
        return true;
    }
    return false;
};