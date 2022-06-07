const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createLogger, transports, config } = require('winston');
const expressWinston = require('express-winston');
// Enable exception handling when you create your logger.
const logger = createLogger({
	levels: config.syslog.levels,
	exceptionHandlers: [
		new transports.File({ filename: 'exceptions.log' })
	],
});

const app = express();

// This will fire our mongoose.connect statement to initialize our database connection
require("./config/mongoose.config");

app.use(cookieParser(), cors({ credentials: true, origin: 'http://localhost:3000' }), express.json(), express.urlencoded({ extended: true }));
require("./routes/users.routes")(app);
require("./routes/activities.routes")(app);
require("./routes/tours.routes")(app);
require("./routes/s3.routes")(app);

// Exception handling
app.use(expressWinston.errorLogger({
	winstonInstance: logger
}));

app.listen(8000, () => console.log("The server is all fired up on port 8000"));
