const express = require('express');
const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

const router = express.Router();

/**
 * @route   GET /:shortCode
 * @desc    Redirect short code to original URL & log analytics
 * @access  Public
 */
router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Find URL by shortCode
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen font-sans">
          <div class="text-center p-8 max-w-md bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl">
            <h1 class="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-4">404</h1>
            <h2 class="text-2xl font-bold mb-4">Short Link Not Found</h2>
            <p class="text-gray-400 mb-6">The link you are trying to access doesn't exist, has been deleted, or is incorrect.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition duration-200">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Check if url is active
    if (!url.isActive) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Inactive</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen font-sans">
          <div class="text-center p-8 max-w-md bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl">
            <h1 class="text-6xl font-extrabold text-yellow-500 mb-4">403</h1>
            <h2 class="text-2xl font-bold mb-4">Link Inactive</h2>
            <p class="text-gray-400 mb-6">This short link has been deactivated and is no longer accepting visits.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition duration-200">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Check if url is expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      url.isActive = false;
      await url.save();
      
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen font-sans">
          <div class="text-center p-8 max-w-md bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl">
            <h1 class="text-6xl font-extrabold text-red-500 mb-4">410</h1>
            <h2 class="text-2xl font-bold mb-4">Link Expired</h2>
            <p class="text-gray-400 mb-6">This short link has reached its expiration date and is no longer available.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition duration-200">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Log Analytics
    const userAgentStr = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentStr);
    const browserResult = parser.getBrowser();
    const deviceResult = parser.getDevice();

    const browser = browserResult.name || 'Unknown';
    let device = deviceResult.type || 'Desktop';
    // Format device type
    device = device.charAt(0).toUpperCase() + device.slice(1);

    // Get IP address
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const ipAddress = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'Unknown';

    // Get Country (Mock for local testing to create rich visual charts, or parse header)
    let country = req.headers['cf-ipcountry'] || 'Unknown';
    if (country === 'Unknown' || ipAddress.includes('127.0.0.1') || ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      const testCountries = ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Singapore', 'France'];
      country = testCountries[Math.floor(Math.random() * testCountries.length)];
    }

    // Create Analytics Log
    await Analytics.create({
      urlId: url._id,
      ipAddress,
      userAgent: userAgentStr,
      browser,
      device,
      country,
    });

    // Increment click counts
    url.totalClicks += 1;
    await url.save();

    // Redirect to original URL
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
