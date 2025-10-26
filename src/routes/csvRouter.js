const { Router } = require('express');
const csvController = require('../controllers/csvController');

const router = Router();

router.post('/load', csvController.loadCSV);

router.get('/age-distribution', csvController.ageDistribution);

module.exports = router;