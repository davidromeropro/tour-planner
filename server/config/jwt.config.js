const jwt = require('jsonwebtoken');
const config = require('./index.config');
const User = require('../models/user.model');

const secret = config.JWT_SECRET;
module.exports.secret = secret;
module.exports.authenticate = (req, res, next) => {
	jwt.verify(req.cookies.usertoken, secret, {
		issuer: 'Tour Planner',
		audience: 'Tourists',
		maxAge: '8h'
	}, async (err, payload) => {
		if (err) {
			res.status(401).json({ msg: 'Invalid token' });
			return;
		} else {
			// Validate if user exists
			const user = await User.findOne({ _id: payload.sub }).populate('roles');
			if (!user) {
				res.status(401).json({ msg: 'You are not authorized to access' });
				return;
			}
			// Validate user roles
			const hasPermission = user.roles.find(role =>
				role.routesPermissions.find(route => req.route.path.includes(route.route) && route.methods.find(method => req.route.methods[method])));
			if (!hasPermission) {
				res.status(403).json({ msg: 'You do not have permission to access this resource' });
				return;
			}
		}
		next();
	});
}