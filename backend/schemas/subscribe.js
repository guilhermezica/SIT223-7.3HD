import { z } from 'zod'; // Import Zod
import express from 'express'; // Import Express
import sgMail from '@sendgrid/mail'; // Import SendGrid`

// Create a new router instance
const router = express.Router(); 

// Define a Zod schema for validating the email
export const subscribeSchema = z.object({ // creating a schema for validating the email
    email: z.email({error: "Please enter a valid email address",}) // email must be a string and a valid email
});

router.post('/', async (req, res) => {
    const result = subscribeSchema.safeParse(req.body); // Validate the request body against the schema

    if (!result.success) { // If validation fails, return error message
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    try {
        const email  = result.data.email; // Extract email from request body
        const msg = { // Create the message object
            to: email, // Recipient email
            from: process.env.SENDER_EMAIL, // Sender email
            subject: 'Welcome to my newsletter!', // Subject
            html: '<p>Thank you for subscribing to our newsletter!</p>', // HTML content
        };

        const [response] = await sgMail.send(msg); // Send the email using SendGrid
        console.log('SendGrid status:', response.statusCode); // Log the response message

        res.status(200).json({ message: 'Subscription successful' }); // Return success message
    } catch (error) {
        console.error('Error sending email:', error); // Log the error
        res.status(500).json({ message: 'Error sending email' }); // Return error message
    }
});

export default router; // Export the schema for use in other files
