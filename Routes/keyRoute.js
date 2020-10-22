const express = require('express');
const router = express.Router();
const {publicJWK} = require('../Keys/key');

router.get('/', (req, res) => {
	const keys = [publicJWK];
	res.status(200).json({keys});
});

module.exports = router;
