const express = require('express');
const app = express();

app.get('/callback', (req, res) => {
	console.log(req.query);
	res.json(req.query);
});

app.listen(5001);
