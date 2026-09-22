import { auth, db } from '../config/firebaseAdmin.js';

// Resolves the caller from the Bearer token and attaches req.user, but lets
// anonymous requests through with req.user = null so routes can serve free
// content to logged-out visitors.
export async function attachUser(req, res, next) {
    const authHeader = req.headers.authorization; // expected: "Bearer <idToken>"

    if (!authHeader) {
        req.user = null;
        return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Malformed Authorization header' });
    }

    const idToken = authHeader.slice('Bearer '.length);

    let decoded;
    try {
        decoded = await auth.verifyIdToken(idToken);
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    let userDoc;
    try {
        userDoc = await db.collection('users').doc(decoded.uid).get();
    } catch (error) {
        console.error('Error fetching user document:', error);
        return res.status(500).json({ message: 'Error fetching user document' });
    }

    req.user = {
        id: decoded.uid,
        plan: userDoc.data()?.plan || 'free',
    };
    next();
}

// For routes that require a signed-in user regardless of plan.
export function requireAuth(req, res, next) {
    attachUser(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        next();
    });
}
