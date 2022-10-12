const { connect } = require("mongoose");

const dbConnect = () => {
    const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) console.log(err);
        else console.log('DB connection successful!');

    }
    );
}

export { dbConnect };