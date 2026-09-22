import './Header.css'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, plan, isAuthLoading, isPlanLoading, logout } = useAuth();

  return (
    <header className="site-header">
        <div className="header-inner">
          <div className="wordmark">          
            <Link to="/" className="wordmark-link">DEV@Deakin</Link>
          </div>
          <div className="Search">
            <input type="text" placeholder="Search" />
          </div>
          <div className="actions">
              <Link to="/browse" className="btn btn-secondary">Browse</Link>
              {/* Create Post Button */}
              <Link to="/post" className="btn btn-primary">Post</Link>
              {/* Show login button if user not logged in, but if user logged in show user.displayName and logout button */}
              {isAuthLoading ? (
                <span>Loading...</span>
              ) : user ? (
                <>
                  <span className="user-name">Hello, {user.displayName || user.email}</span>
                  <button className="btn btn-secondary" onClick={logout}>Logout</button>
                  {/* Need to add a isPlanLoading check here to avoid showing the plan before it is loaded. */}
                  {/* If isPlanLoading is true, show a loading spinner instead of the plan. */}
                  {isPlanLoading ? (
                    <span className="user-plan-banner">Loading plan...</span>
                  ) : (
                    <span className="user-plan-banner">Plan: {plan === 'paid' ? 'Premium' : 'Free'}</span>
                  )}
                </>
              ) : (
                <Link to="/login" className="btn btn-secondary">Login</Link>
              )}
              <Link to="/pricing" className="btn btn-secondary">Pricing</Link>
          </div>
        </div>
    </header>
  )
}

export default Header