import { sign } from 'jsonwebtoken';
import { JWT_EXPIRE, JWT_SECRET, ROLE } from './constants';

export const generateUID = (first: string, second: string) => {
    let firstPart: string | number = (Math.random() * 46656) | 0;
    let secondPart: string | number = (Math.random() * 46656) | 0;
    firstPart = (
        first.replace(" ", "-").slice(0, 3) + firstPart.toString(36)
    ).slice(-3);
    secondPart = (second.slice(0, 3) + secondPart.toString(36)).slice(-3);
    const result = firstPart + secondPart;
    return result.toString().toLowerCase().trim();
};

export interface IPayload {
    email: string;
    name: string;
    slug?: string;
    uuid?: string;
    role: ROLE;
}

export const sendPayload = (payload: IPayload) => {
    try {
        const token = sign(
            payload,
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRE,
            }
        );
        return token;
    } catch (error) {
        throw error;
    }
};