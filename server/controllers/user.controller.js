const User = require('../models/user.model');
const Role = require('../models/role.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/index.config')

module.exports.register = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		// Check if user is registered
		if (user) {
			res.status(400).json({ msg: 'The user is already registered!' });
		} else {
			// Add default role
			const role = await Role.findOne({ name: 'Tourist' });
			const user = new User({...req.body, roles: [role._id]});
			await user.save();
			res.status(201).json({ msg: 'success!' });
		}
	} catch (error) {
		res.status(400).json({ msg: 'Something went wrong', error });
	}
};

module.exports.login = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			res.status(400).json({ msg: 'The user is not registered!' });
		} else {
			// Decrypt password
			const passwordIsValid = await bcrypt.compare(req.body.password, user.password);
			if (passwordIsValid) {
				const secret = config.JWT_SECRET;
				console.log('Valid password');
				const id = user._id;
				const payload = {
					iss: 'Tour Planner',
					aud: 'Tourists',
					sub: id
				};
				const newJWT = jwt.sign(payload, secret);
				res.status(200).cookie('usertoken', newJWT, secret, { httpOnly: true }).json({ id });
			} else {
				console.log('Invalid login attempt!');
				res.status(400).json({ msg: 'Invalid login attempt!' });
			}
		}
	} catch (error) {
		console.log('err', error);
		res.status(500).json({ msg: 'There was an error, please contact with the administrator', error });
	}
};

module.exports.logout = (req, res) => {
	res.clearCookie('usertoken');
	res.status(200).json({ msg: 'success!' });
}

module.exports.findUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate('roles');
		// get menus of the user role
		const menus = user.roles.map(role => role.menus).flat();
		const uniqueMenus = [...new Set(menus)];
		const roles = user.roles.map(role => role.name).join(', ');

		// 200 OK
		res.status(200).json({ name: `${user.firstName} ${user.lastName}`, roles, menus: uniqueMenus });
	} catch (error) {
		console.log(error);
		// 404 Not Found
		res.status(404).json({ msg: 'Something went wrong', error });
	}
};


module.exports.authenticated = (req, res) => {
	res.status(200).json({ msg: 'success!', isAuthenticated: true });
}
