const mongoose = require("mongoose");
const config = require("./index.config")

mongoose.connect(config.DB_CONNECTION, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log("Established a connection to the database"))
	.catch(err => console.log("Something went wrong when connecting to the database", err));