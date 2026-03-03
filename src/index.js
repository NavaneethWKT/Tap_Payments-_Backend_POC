import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import checkoutRoutes from './routes/checkout.js';
import webhookRoutes from './routes/webhook.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/checkout', checkoutRoutes);
app.use('/webhook', webhookRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tap-poc-backend' });
});

const { port } = config.server;
app.listen(port, () => {
  console.log(`Tap PoC Backend running at http://localhost:${port}`);
  console.log('  POST /checkout/prepare  - get hash and refs for SDK');
  console.log('  POST /webhook/tap       - Tap webhook (post URL)');
});
