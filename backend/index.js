import app from './server.js'; // Import the Express app from server.js
import 'dotenv/config'; // Load environment variables from .env file
const PORT = process.env.PORT || 3000; // Use the port from .env or default to 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});