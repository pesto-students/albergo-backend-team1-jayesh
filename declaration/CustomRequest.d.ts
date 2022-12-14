declare namespace Express {

  type ROLE = "USER" | "HOTEL";

  interface IParsedToken {
    email: string;
    name: string;
    slug?: string;
    uuid?: string;
    role: ROLE;
    iat: number;
    exp: number;
  }

  export interface Request {
    token: string;
    parsedToken: IParsedToken;
  }
}
