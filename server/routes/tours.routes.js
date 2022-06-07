const ToursController = require("../controllers/tour.controller");
const { authenticate } = require('../config/jwt.config');

module.exports = app => {
	app.get("/api/tours/:id", authenticate, ToursController.findTours);
	app.get("/api/tours/activities/:id", authenticate, ToursController.findTourActivities);
	app.post("/api/tours/", authenticate, ToursController.createTour);
	app.put("/api/tours/:id", authenticate, ToursController.updateTour);
	app.delete("/api/tours/:id", authenticate, ToursController.deleteTour);
};