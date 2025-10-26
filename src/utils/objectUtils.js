/**
 * @param {Object} obj 
 * @param {string} path 
 * @param {any} value 
 */
function setNestedProperty(obj, path, value) {
  if (!path) return;
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * @param {Object} obj 
 * @param {string} path 
 * @returns {any} T
 */
function getNestedProperty(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

module.exports = {
  setNestedProperty,
  getNestedProperty,
};