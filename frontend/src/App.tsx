import {Routes, Route} from 'react-router';
import { PricingPage, HomePage, LoginPage, SignupPage, NewPostPage, BrowsePage } from './pages';
import Layout from './pages/Layout';

function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path='post' element={<NewPostPage />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="pricing" element={<PricingPage />} /> // Route to the new pricing.tsx file instead of PricingPage.tsx
        </Route>
      </Routes>
    </div> 
  )
}

export default App
