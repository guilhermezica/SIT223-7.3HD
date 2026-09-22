import './SignupPage.css'
import { db, auth } from "../firebase";
import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router";
import { z } from "zod";

const signupSchema = z.object({
    userName: z.string().min(1, { message: "Name is required" }),
    userEmail: z.email({ message: "Invalid email address" }),
    userPassword: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    ConfirmPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters long" }),
}).refine((data) => data.userPassword === data.ConfirmPassword, {
    message: "Passwords do not match",
    path: ["ConfirmPassword"],
});

export default function SignupPage() {
    const [userEmail, setUserEmail] = useState(''); // useState is a hook that allows us to manage state in a functional component. A hook is a special function that lets you “hook into” React features.
    const [userPassword, setUserPassword] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const [userName, setUserName] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const [ConfirmPassword, setConfirmPassword] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const [error, setError] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const [success, setSuccess] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const navigate = useNavigate();

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => navigate('/login'), 3000);
        return () => clearTimeout(timer);
        }, [success, navigate]);
    
    async function handleSubmit(e: React.FormEvent) { // handleSubmit is a function that will be called when the form is submitted.
        setError(''); // Reset error state
        setSuccess(''); // Reset success state
        e.preventDefault(); // Prevents the default form submission behavior
        const validation = signupSchema.safeParse({
            userName,
            userEmail,
            userPassword,
            ConfirmPassword
        });
        if (!validation.success) {
            const fieldErrors = validation.error.flatten().fieldErrors;
            if (fieldErrors.userName) setError(fieldErrors.userName[0]);
            else if (fieldErrors.userEmail) setError(fieldErrors.userEmail[0]);
            else if (fieldErrors.userPassword) setError(fieldErrors.userPassword[0]);
            else if (fieldErrors.ConfirmPassword) setError(fieldErrors.ConfirmPassword[0]);
            return;
        }
        try {
            const cred = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
            await setDoc(doc(db, 'users', cred.user.uid), { fullName: userName, email: userEmail, plan: 'free', createdAt: new Date() });
            await updateProfile(cred.user, { displayName: userName });
            // create a document in the users collection with the user's plan: "free", createdAt and displayName. 
            // This document will be used to store the user's plan and other information in the future.
            setSuccess('Account created successfully');
        } catch (err: unknown) {
            // Email already in use error code is 'auth/email-already-in-use'
            if ((err as { code: string }).code === 'auth/email-already-in-use') {
                setError('Email already in use');
            } else if ((err as { code: string }).code === 'auth/weak-password') {
                // Weak password error code is 'auth/weak-password'
                setError('Password is too weak');
            } else {
                setError('An error occurred while creating your account');
            }
        }
    }
    return (
        <div className="signup-page">
            <div className="header">
                <h1>Create a DEV@Deakin Account</h1>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <p>Please enter your details to create an account.</p>
                <form onSubmit={handleSubmit}>
        <div/>
        <div className="form-group">
            {/* Add red asterisk to mandatory fields  */}
            <label htmlFor="name">Name*</label>
            <input
                id = "name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="email">Email*</label>
            <input
                id = "email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)} // setUserEmail is a function that will be called when the email input changes
            />
            <label htmlFor="password">Password*</label>
            <input
                id = "password"
                type="password"
                autoComplete="new-password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
            />
            <label htmlFor="confirmPassword">Confirm Password*</label>
            <input
                id = "confirmPassword"
                type="password"
                autoComplete="new-password"
                value={ConfirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit">Create Account </button>
        </div>
        </form>
        </div>
            
    )
}