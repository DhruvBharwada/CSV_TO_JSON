const csvService = require('../services/csvService');
const userService = require('../services/userService');

/**
 * HTTP handler that triggers processing of the configured CSV file.  This
 * endpoint will read the CSV from disk, insert the rows into the
 * database and compute an age distribution report.  On success the
 * distribution is returned to the client; on failure an error
 * response is sent.
 *
 * @param {import('express').Request} req Express request object.
 * @param {import('express').Response} res Express response object.
 */
async function loadCSV(req, res) {
  try {
    const distribution = await csvService.processCSVFile();
    res.status(200).json({
      message: 'CSV processed and users inserted successfully.',
      ageDistribution: distribution,
    });
  } catch (err) {
    console.error('Failed to process CSV:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
async function ageDistribution(req, res) {
  try {
    const distribution = await userService.getAgeDistribution();
    res.status(200).json(distribution);
  } catch (err) {
    console.error('Failed to retrieve age distribution:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

module.exports = {
  loadCSV,
  ageDistribution,
};