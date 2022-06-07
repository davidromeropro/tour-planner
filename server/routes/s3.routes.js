const { generateUploadUrl } = require("../controllers/s3.controller");

module.exports = app => {
	app.get("/api/s3/getUrl", async (req, res) => {
		const uploadUrl = await generateUploadUrl();
		res.json({ uploadUrl });
	});
}