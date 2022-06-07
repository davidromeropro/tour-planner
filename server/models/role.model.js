const mongoose = require('mongoose');

const RoutePermission = new mongoose.Schema({
	route: {
		type: String,
		required: [true, 'Route is required']
	},
	methods: {
		type: [String]
	},
});

const RoleSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name is required']
	},
	description: {
		type: String,
		required: [true, 'Description is required']
	},
	routesPermissions: {
		type: [RoutePermission]
	},
	menus: [{
		label: String,
		link: String,
	}]
}, { timestamps: true });


const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;