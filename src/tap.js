import crypto from 'crypto';
import { config } from './config.js';

const { tap } = config;

/**
 * Generate HMAC-SHA256 hash string required by Tap Checkout SDK.
 * Same formula as in Tap docs: x_publickey + x_amount + x_currency + x_transaction + x_post
 */
export function generateHashString({
  amount,
  currency,
  transactionReference,
  postUrl = '',
}) {
  const formattedAmount = Number(amount).toFixed(2);
  const toBeHashed =
    `x_publickey${tap.publicKey}` +
    `x_amount${formattedAmount}` +
    `x_currency${currency}` +
    `x_transaction${transactionReference}` +
    `x_post${postUrl}`;
  const hash = crypto.createHmac('sha256', tap.secretKey).update(toBeHashed).digest('hex');
  return hash;
}

export function getTapConfig() {
  return {
    publicKey: tap.publicKey,
    merchantId: tap.merchantId,
  };
}
