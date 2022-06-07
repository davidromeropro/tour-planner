const ActivitiesController = require("../controllers/activity.controller");
const { authenticate } = require('../config/jwt.config');

module.exports = app => {
	app.get("/api/activities/:startDate/:endDate", ActivitiesController.findActivitiesByDateRange);
	app.get("/api/activities/", authenticate, ActivitiesController.findActivities);
	app.get("/api/activities/:id", authenticate, ActivitiesController.findActivity);
	app.post("/api/activities/", authenticate, ActivitiesController.createActivity);
	app.put("/api/activities/:id", authenticate, ActivitiesController.updateActivity);
	app.delete("/api/activities/:id", authenticate, ActivitiesController.deleteActivity);
};