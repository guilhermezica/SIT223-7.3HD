import { useContext, useEffect, createContext, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";
// Define the shape of the authentication context, including user information, loading states, logout function, and user plan.
type AuthContextType = {
    user: User | null;
    isAuthLoading: boolean;
    isPlanLoading: boolean;
    logout: () => Promise<void>;
    plan: string | null;
};
// Create a context for authentication, which will be used to provide and consume authentication-related data throughout the application.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// The useAuth hook provides a convenient way to access the authentication context in functional components. It ensures that the context is used within an AuthProvider, throwing an error if not.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
// The AuthProvider component is responsible for managing the authentication state of the application.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => { 
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true); // Loading state for authentication (default is true because we haven't checked the user's auth state yet)
  const [isPlanLoading, setIsPlanLoading] = useState<boolean>(false); // Loading state for the user's plan (default is false because we haven't started fetching the plan yet)

    const logout = async () => {
        await auth.signOut();
    };
    useEffect(() => { // onAuthStateChanged is a function that listens for changes to the user's sign-in state. 
    // It takes two arguments: the auth object and a callback function that will be called whenever the user's sign-in state changes. 
    // The callback function receives a User object if the user is signed in, or null if the user is signed out.
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
        });
        return unsubscribe;
    }, []);
    // We need a second useEffect to listen to changes to the user state and fetch the user's plan from Firestore.
        useEffect(() => {
        if (!user) { // If there is no user, we set the plan to null and set isPlanLoading to false. This is important because if the user logs out, we want to clear the plan state and stop loading.
            setPlan(null);
            setIsPlanLoading(false);
            return;
        }
    
        setIsPlanLoading(true); // We set isPlanLoading to true because we are about to fetch the user's plan from Firestore.
    
        const unsubscribe = onSnapshot(
            doc(db, 'users', user.uid), // We use onSnapshot to listen for real-time updates to the user's document in Firestore. This way, if the user's plan changes while they are logged in, we will automatically update the plan state in our app.
            (docSnap) => {
                if (docSnap.exists()) {
                    setPlan(docSnap.data().plan); // If the document exists, we set the plan state to the value of the plan field in the document.
                } else {
                    setPlan('free'); // If the document does not exist, we set the plan state to 'free'. This is a fallback in case the user's document is deleted or never created.
                }
                setIsPlanLoading(false); // We set isPlanLoading to false because we have finished fetching the user's plan from Firestore.
            },
            (error: Error) => { // If there is an error fetching the user's plan from Firestore, we log the error to the console, set the plan state to 'free', and set isPlanLoading to false. We also show a toast notification to inform the user that their plan could not be fetched.
                console.error('Error fetching user plan:', error); // Log the error to the console for debugging purposes.
                setPlan('free'); // Set the plan state to 'free' as a fallback. This ensures that the app continues to function even if there is an error fetching the user's plan.
                toast.error('Error fetching user plan'); // Show a toast notification to inform the user that their plan could not be fetched. This provides feedback to the user and improves the user experience.
                setIsPlanLoading(false); // Set isPlanLoading to false because we have finished attempting to fetch the user's plan from Firestore, even though it failed.
            }
        );
        return unsubscribe; // We return the unsubscribe function from onSnapshot to clean up the listener when the component unmounts or when the user changes. This prevents memory leaks and ensures that we are not listening to changes for a user that is no longer logged in.
    }, [user]); // We add user as a dependency to this useEffect so that it runs whenever the user state changes. This ensures that we fetch the user's plan whenever they log in or log out.
        return ( // We return the AuthContext.Provider component, which provides the user, isAuthLoading, isPlanLoading, logout, and plan values to any child components that consume the AuthContext. This allows us to access the authentication state and user plan throughout our app.
            <AuthContext.Provider value={{ user, isAuthLoading, isPlanLoading, logout, plan }}>
                {children}
            </AuthContext.Provider>
        );
    }
;
