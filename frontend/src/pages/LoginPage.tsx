import './LoginPage.css';
import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router';

export default function LoginPage() {
    const [userEmail, setUserEmail] = useState(''); // useState is a hook that allows us to manage state in a functional component. A hook is a special function that lets you “hook into” React features. 
    const [userPassword, setUserPassword] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const [error, setError] = useState(''); // useState is a hook that allows us to manage state in a functional component.
    const navigate = useNavigate();
    async function handleSubmit(e: React.FormEvent) { // handleSubmit is a function that will be called when the form is submitted.
        e.preventDefault(); // Prevents the default form submission behavior
        setError(''); // Reset error state
        try {
            await signInWithEmailAndPassword(auth, userEmail, userPassword);
            // on success, navigate to the home page '/'
            navigate('/');

        } catch (err: unknown) {
            // Tell user to either try again or sign up upon invalid credentials error message
            if ((err as { code: string }).code === 'auth/invalid-credential') {
                setError('Invalid credentials. Please try again or sign up.');
            } else {
                setError('An error occurred while logging in. Please try again.');
            }
        }
    }
    return (
        <div className="login-page">
            <div className="login-page-header">
                <h1>Login Page</h1>
                <button type="button" onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
            <div className="form-group">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <p>Please enter your credentials to log in.</p>
                <div className="input-group">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email</label>
                        <input
                            id = "email"
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)} // setUserEmail is a function that will be called when the email input changes
                            autoComplete = "username"
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            id = "password"
                            type="password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            autoComplete = "current-password"
                            />
                        <button type="submit">Login </button>
                    </form>
                </div>
            </div>
        </div>         
    )
}

