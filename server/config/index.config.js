const dotenv = require("dotenv");
dotenv.config();

const config = {
    DB_CONNECTION: process.env.DB_CONNECTION,
    JWT_SECRET: process.env.JWT_SECRET,
	AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
};

module.exports = config;