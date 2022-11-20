import { connect } from "mongoose";

const dbConnect = async () => {
    if (process.env.DATABASE && process.env.DATABASE_PASSWORD) {
        try {
            const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
            connect(DB, (err: any) => {
                if (err) console.log(err);
                else console.log('DB connection successfull!');
            }
            );
        } catch (error) {
            if (error) return Promise.reject(error);
        }
    } else {
        console.log('DB connection failed!');
    }
};

export { dbConnect };