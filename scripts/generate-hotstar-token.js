#!/usr/bin/env node
/**
 * Generate Hotstar API Token using Akamai Token Generator
 *
 * Install: npm install akamai-token
 * Usage: node scripts/generate-hotstar-token.js
 *
 * Documentation: https://github.com/akamai/AkamaiOPEN-edgegrid-node
 */

// Note: Install akamai-token package first
// npm install akamai-token

try {
  const AkamaiToken = require('akamai-token');

  // Configuration from environment variables
  const secret = process.env.HOTSTAR_AKAMAI_SECRET || '7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617';

  // Token parameters
  const config = {
    key: secret,           // Your secret key
    acl: '/*',            // Access Control List (all paths)
    startTime: 'now',     // Start time
    window: 2000,         // Token valid for 2000 seconds (~33 minutes)
  };

  // Generate token
  const at = new AkamaiToken(config);
  const token = at.generateToken();

  console.log('\n=== Hotstar API Token Generated ===\n');
  console.log('Token:', token);
  console.log('\nAdd this to your .env.local file:');
  console.log(`HOTSTAR_TOKEN=${token}`);
  console.log('\nToken valid for: 2000 seconds (33 minutes)');
  console.log('\n=== Test with cURL ===\n');
  console.log(`curl --location 'https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&orderBy=contentId&order=desc&offset=0&size=5' \\
  --header 'x-country-code: in' \\
  --header 'x-platform-code: ANDROID' \\
  --header 'x-partner-name: 92837456123' \\
  --header 'x-region-code: DL' \\
  --header 'x-client-code: pt' \\
  --header 'hdnea: ${token}'`);
  console.log('\n');

} catch (error) {
  console.error('Error: akamai-token package not installed');
  console.error('\nInstall it with:');
  console.error('npm install akamai-token');
  console.error('\nOr use Python/Java methods from documentation');
  process.exit(1);
}
