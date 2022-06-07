module.exports = rolesRights = {
	'admin': [{ url: '/api/pirates/', methods: ['get','post', 'put', 'delete'] }],
	'guest': [{ url: '/api/pirates/', methods: ['get'] }]
}
