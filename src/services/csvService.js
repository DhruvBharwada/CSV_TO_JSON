const fs = require('fs');
const path = require('path');
const config = require('../config');
const { parseCSVStream } = require('../utils/csvParser');

const userService = require('./userService');

/**
 * @param {Object} record 
 * @returns {{name: string, age: number, address: Object|null, additionalInfo: Object|null}}
 */
function transformRecord(record) {

  const get = (obj, key) => {
    return key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  };
  const firstName = get(record, 'name.firstName') || '';
  const lastName = get(record, 'name.lastName') || '';
  const ageRaw = get(record, 'age');
  const age = ageRaw !== undefined && ageRaw !== '' ? parseInt(ageRaw, 10) : NaN;
  if (Number.isNaN(age)) {
    throw new Error(`Invalid age value "${ageRaw}" encountered`);
  }
  if (!firstName || !lastName) {
    throw new Error('Missing mandatory name fields');
  }
  const fullName = `${firstName} ${lastName}`.trim();

  const address = record.address || null;
 
  const additionalInfo = {};
  Object.keys(record).forEach((key) => {
    if (key === 'name' || key === 'age' || key === 'address') return;
    additionalInfo[key] = record[key];
  });
  return {
    name: fullName,
    age,
    address,
    additionalInfo: Object.keys(additionalInfo).length ? additionalInfo : null,
  };
}

/**

 * @param {number} [batchSize=1000] 
 * @returns {Promise<Record<string, number>>} 
 */
async function processCSVFile(batchSize = 1000) {
  
  const csvPath = path.resolve(config.csvFilePath);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at path: ${csvPath}`);
  }
 
  await userService.createUsersTable();
  const batch = [];

  try {
    await parseCSVStream(csvPath, async (record) => {
      let user;
      try {
        user = transformRecord(record);
      } catch (e) {
  
        console.error(`Skipping record due to error: ${e.message}`);
        return;
      }
      batch.push(user);
      if (batch.length >= batchSize) {
        await userService.insertUsersBatch(batch);
        batch.length = 0;
      }
    });
   
    if (batch.length > 0) {
      await userService.insertUsersBatch(batch);
    }
  } catch (err) {
 
    throw err;
  }

  const distribution = await userService.getAgeDistribution();
  console.log('Age distribution report:');
  Object.entries(distribution).forEach(([range, percentage]) => {
    console.log(`${range}: ${percentage}%`);
  });
  return distribution;
}

module.exports = {
  processCSVFile,
};