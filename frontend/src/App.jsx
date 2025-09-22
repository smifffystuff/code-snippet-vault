import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateSnippet from './pages/CreateSnippet'
import EditSnippet from './pages/EditSnippet'
import SnippetDetail from './pages/SnippetDetail'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import { setAuthToken } from './services/api'

function AuthenticatedApp() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the auth token function for API calls
    setAuthToken(getToken);
  }, [getToken]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateSnippet />} />
        <Route path="/snippet/:id" element={<SnippetDetail />} />
        <Route path="/snippet/:id/edit" element={<EditSnippet />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <>
      <SignedOut>
        <Routes>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </SignedOut>
      
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
    </>
  )
}

export default App