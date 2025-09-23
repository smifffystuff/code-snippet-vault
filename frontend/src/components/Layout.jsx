import { Link } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Code2, Plus, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Layout = ({ children }) => {
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-gray-900">
              <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <span className="hidden sm:inline">Code Snippet Vault</span>
              <span className="sm:hidden">Snippets</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
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
                <span className="text-sm text-gray-600 hidden lg:block">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]}
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Snippets
                </Link>
                <Link
                  to="/create"
                  className="btn-primary flex items-center justify-center space-x-2 mx-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Snippet</span>
                </Link>
                
                {/* Mobile User Info */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 mt-3 pt-3">
                  <span className="text-sm text-gray-600">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]}
                  </span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            <p>&copy; 2025 Code Snippet Vault. Built with React and Express.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout