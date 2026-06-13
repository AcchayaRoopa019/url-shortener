const crypto = require('crypto');
const Url = require('../models/Url');

/**
 * Generates a random alphanumeric short code of specified length.
 */
const generateShortCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return result;
};

/**
 * Generates a unique short code checking database collisions.
 */
const generateUniqueShortCode = async () => {
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const code = generateShortCode(6);
    const existing = await Url.findOne({ shortCode: code });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  throw new Error('Failed to generate a unique short code due to collisions.');
};

module.exports = {
  generateShortCode,
  generateUniqueShortCode,
};
