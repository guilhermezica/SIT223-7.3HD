import type { User } from 'firebase/auth';

export type Post = {
    id: string;
    title: string;
    type: 'article' | 'question';
    plan: 'free' | 'paid';
    tags: string[];
    authorId: string;
    abstract?: string;
    description?: string;
    text?: string;
    createdAt: string | null;
};

type FetchPostsResult = {
    posts: Post[];
    ok: boolean;
    message?: string;
};

export type CreatePostInput =
    | {
        type: 'article';
        title: string;
        abstract: string;
        text: string;
        tags: string[];
        plan: 'free' | 'paid';
    }
    | {
        type: 'question';
        title: string;
        description: string;
        tags: string[];
        plan: 'free' | 'paid';
    };

type CreatePostResult = {
    ok: boolean;
    message?: string;
};

export const createPost = async (user: User, post: CreatePostInput): Promise<CreatePostResult> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await user.getIdToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { ok: false, message: errorData.message || `Unable to create post. (${response.status})` };
        }

        return { ok: true };
    } catch (error) {
        console.error('Error creating post:', error);
        return { ok: false, message: 'Server is not responding. Please try again later.' };
    }
};

export const fetchPosts = async (user: User | null): Promise<FetchPostsResult> => {
    try {
        const headers: Record<string, string> = {};
        // Sending no token is a valid case: the API treats it as a guest and
        // returns only free posts.
        if (user) {
            headers.Authorization = `Bearer ${await user.getIdToken()}`;
        }
        // Point fetch to the backend route
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, { headers });
        // If the response is not ok, we try to parse the error message from the response body. If parsing fails, we return a generic error message.
        if (!response.ok) {
            try {
                const errorData = await response.json();
                return { posts: [], ok: false, message: errorData.message || `Unable to load posts. (${response.status})` }; // Give errorData a default value of an empty object to avoid destructuring errors if the response body is empty or not JSON.
            }
            catch {
                return { posts: [], ok: false, message: `Unable to load posts. (${response.status})` };
            }
        }

        const data = await response.json();
        return { posts: data.posts, ok: true };
    } catch (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], ok: false, message: 'Server is not responding. Please try again later.' };
    }
};
