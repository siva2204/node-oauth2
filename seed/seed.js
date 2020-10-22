const mongoose = require('mongoose');
const {server, dbname} = require('../env');
const ResourceOwner = require('../Models/ResourceOwner');
const Client = require('../Models/Client');

mongoose
	.connect(`mongodb://${server}/${dbname}`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(async () => {
		console.log('Database connection successful');
		await populateClient();
		await populateResourceOwner();
	})
	.catch((err) => {
		console.error('Database connection error' + err);
	});

const clients = [
	{
		clientId: 'oauth-client-1',
		clientSecret: 'oauth-client-secret-1',
		redirectUri: 'http://localhost:5001/callback',
	},
	{
		clientId: 'oauth-client-2',
		clientSecret: 'oauth-client-secret-2',
		redirectUri: 'http://localhost:5001/callback',
	},
	{
		clientId: 'oauth-client-3',
		clientSecret: 'oauth-client-secret-3',
		redirectUri: 'http://localhost:5001/callback',
	},
];

const resourceowner = [
	{
		name: 'jhon',
		email: '103119100@nitt.edu',
		password: 'nitt123',
	},
	{
		name: 'mary',
		email: '103119110@nitt.edu',
		password: 'nitt123',
	},
	{
		name: 'Ed',
		email: '103119106@nitt.edu',
		password: 'nitt123',
	},
	{
		name: 'mary',
		email: '103119024@nitt.edu',
		password: 'nitt123',
	},
];

const removeResourceOwner = async () => {
	try {
		await ResourceOwner.remove({});
		console.log('removed');
	} catch (err) {
		console.log(err);
	}
};

const removeClient = async () => {
	try {
		await Client.remove({});
		console.log('removed');
	} catch (err) {
		console.log(err);
	}
};

const populateResourceOwner = async () => {
	try {
		// await removeResourceOwner();
		let i;
		for (i = 0; i < resourceowner.length; i++) {
			let rs = new ResourceOwner(resourceowner[i]);
			await rs.save();
		}
		console.log('added');
	} catch (err) {
		console.log(err);
	}
};

const populateClient = async () => {
	try {
		// await removeClient();
		let i;
		for (i = 0; i < clients.length; i++) {
			let client = new Client(clients[i]);
			await client.save();
		}
		console.log('added');
	} catch (err) {
		console.log(err);
	}
};
