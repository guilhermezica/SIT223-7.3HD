import express from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { db } from '../config/firebaseAdmin.js';
import { attachUser, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const postBodySchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('article'),
        title: z.string().min(5),
        abstract: z.string().min(20),
        text: z.string().min(100),
        tags: z.array(z.string()).min(1).max(3),
        plan: z.enum(['free', 'paid']),
    }).strict(),
    z.object({
        type: z.literal('question'),
        title: z.string().min(5),
        description: z.string().min(10),
        tags: z.array(z.string()).min(1).max(3),
        plan: z.enum(['free', 'paid']),
    }).strict(),
]);

router.post('/', requireAuth, async (req, res) => {
    const parsed = postBodySchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid post data', errors: parsed.error.issues });
    }

    try {
        const post = await db.collection('posts').add({
            ...parsed.data,
            authorId: req.user.id,
            createdAt: FieldValue.serverTimestamp(),
        });

        return res.status(201).json({ id: post.id });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Unable to create post' });
    }
});

// Browsing is open to everyone; the caller's plan decides which posts the
// query asks Firestore for, so premium content is never fetched for a free user.
router.get('/', attachUser, async (req, res) => {
    const callerPlan = req.user?.plan ?? 'free';
    let query = db.collection('posts').orderBy('createdAt', 'desc');

    // 'plan' on a post is what it requires; 'plan' on a user is what they bought.
    if (callerPlan !== 'paid') {
        query = query.where('plan', '==', 'free');
    }

    try {
        // Fetch the posts
        const snapshot = await query.get(); // Get the query snapshot
        // createdAt is a Firestore Timestamp, which would serialise as {_seconds, _nanoseconds}.
        // Send an ISO string so the client can build a Date from it directly.
        const posts = snapshot.docs.map((doc) => {
            const { createdAt, plan, ...rest } = doc.data();
            return {
                id: doc.id,
                ...rest,
                plan: plan ?? 'free',
                createdAt: createdAt?.toDate?.()?.toISOString() ?? null,
            };
        });
        res.status(200).json({ posts }); // Return the posts as JSON
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

export default router;
