import 'dotenv/config'; // Load environment variables
import express from 'express'; // Import Express
import cors from 'cors'; // Import CORS
import sgMail from '@sendgrid/mail'; // Import SendGrid
import subscribeRouter from './schemas/subscribe.js'; // Import the subscribe route
import postsRouter from './routes/posts.js'; // Import the posts route
const PORT = process.env.PORT || 3000; // Use the port from .env or default to 3000
// Comma-separated so the deployed site and a local dev server can both be allowed.
const FRONTEND_ORIGINS = process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim());

const app = express(); // Create an Express app

// Middleware
app.use(cors({ origin: FRONTEND_ORIGINS })); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request body
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
