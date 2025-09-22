import { Link } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Code2, Plus } from 'lucide-react'

const Layout = ({ children }) => {
  const { user } = useUser()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <Code2 className="h-8 w-8 text-primary-600" />
              <span>Code Snippet Vault</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Browse
              </Link>
              <Link
                to="/create"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Snippet</span>
              </Link>
              
              {/* User Info and Avatar */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 Code Snippet Vault. Built with React and Express.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout