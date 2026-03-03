import 'dotenv/config';

const required = ['TAP_SECRET_KEY', 'TAP_PUBLIC_KEY', 'TAP_MERCHANT_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Missing env: ${key}. Set in .env for full functionality.`);
  }
}

// BASE_URL must be HTTPS (e.g. ngrok). Tap rejects config when post URL is localhost or HTTP.
const rawBaseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const baseUrl = rawBaseUrl.replace(/\/$/, '');

if (baseUrl.startsWith('http://') && baseUrl.includes('localhost')) {
  console.warn('Tap may return INVALID_CONFIGURATION when post URL is localhost. Set BASE_URL to your ngrok HTTPS URL.');
}

export const config = {
  tap: {
    secretKey: process.env.TAP_SECRET_KEY || '',
    publicKey: process.env.TAP_PUBLIC_KEY || '',
    merchantId: String(process.env.TAP_MERCHANT_ID || ''),
    apiBase: 'https://api.tap.company/v2',
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    baseUrl,
  },
};
