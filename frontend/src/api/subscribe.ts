import { z } from 'zod';

const subscribeSchema = z.object({
    email: z.string().email("Please enter a valid email address")
});

type SubscribeResult = {
    message: string;
    ok: boolean; // Add ok property to indicate success or failure
};

export const subscribe = async (email: string): Promise<SubscribeResult> => {
    const result = subscribeSchema.safeParse({ email });
    if (!result.success) {
        return { message: result.error.issues[0].message, ok: false };
    }
    try {
        // Point fetch to the backend route for subscribing
        const response = await fetch(`${import.meta.env.VITE_API_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        if (response.ok) {
            const data = await response.json();
            return { message:  data.message, ok: true }; // Include ok in the response
        } else {
            const errorData = await response.json();
            return { message: errorData.message, ok: false };
        }
    }
    catch (error) {
        console.error('Error subscribing:', error);
        return { message: 'Server is not responding. Please try again later.', ok: false };
    }
};


