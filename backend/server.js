import 'dotenv/config'; // Load environment variables
import express from 'express'; // Import Express
import cors from 'cors'; // Import CORS
import sgMail from '@sendgrid/mail'; // Import SendGrid
import subscribeRouter from './schemas/subscribe.js'; // Import the subscribe route
import postsRouter from './routes/posts.js'; // Import the posts route
import client from 'prom-client'; // Import Prometheus client for metrics

// Comma-separated so the deployed site and a local dev server can both be allowed.
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());

const app = express(); // Create an Express app instance
app.disable('x-powered-by'); // Disable the 'X-Powered-By' header for security reasons

// Collect default metrics for Prometheus
client.collectDefaultMetrics(); 

// Middleware to enable CORS
app.use(cors({ origin: FRONTEND_ORIGINS })); 
// Middleware to parse JSON request body
app.use(express.json()); 
const httpRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
// Middleware to count HTTP requests for Prometheus
app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
    });
    next();
});
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set SendGrid API key

// Prevent caching during local development
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Routes
app.use('/subscribe', subscribeRouter); // Use the subscribe route
app.use('/posts', postsRouter); // Use the posts route

// Endpoint to expose metrics for Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});
export default app;
