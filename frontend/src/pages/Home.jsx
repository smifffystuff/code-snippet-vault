import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, AlertCircle, Loader2 } from 'lucide-react'
import { snippetAPI } from '../services/api'
import SnippetCard from '../components/SnippetCard'
import SearchBar from '../components/SearchBar'
import FilterControls from '../components/FilterControls'
import toast from 'react-hot-toast'

const Home = () => {
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState('my') // 'my', 'public', 'all'
  const [filters, setFilters] = useState({
    language: '',
    tags: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({})

  // Memoize the filter object to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({ ...filters, view: currentView }), [
    filters.language,
    filters.tags,
    filters.sortBy,
    filters.sortOrder,
    currentView
  ])

  const fetchSnippets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        search: searchQuery,
        ...memoizedFilters
      }
      
      const data = await snippetAPI.getAll(params)
      setSnippets(data.snippets || [])
      setPagination(data.pagination || {})
    } catch (err) {
      console.error('Error fetching snippets:', err)
      setError('Failed to load snippets. Please try again.')
      toast.error('Failed to load snippets')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, memoizedFilters])

  useEffect(() => {
    fetchSnippets()
  }, [fetchSnippets])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const handleDeleteSnippet = async (snippetId) => {
    try {
      await snippetAPI.delete(snippetId)
      setSnippets(prev => prev.filter(snippet => snippet._id !== snippetId))
      toast.success('Snippet deleted successfully')
    } catch (err) {
      console.error('Error deleting snippet:', err)
      toast.error('Failed to delete snippet')
    }
  }

  if (loading && snippets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your snippets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSnippets}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Code Snippets</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            {pagination.total 
              ? `${pagination.total} snippet${pagination.total !== 1 ? 's' : ''} found`
              : currentView === 'my' 
                ? 'Your personal code library'
                : currentView === 'public'
                  ? 'Community shared snippets'
                  : 'All available snippets'
            }
          </p>
        </div>
        <Link to="/create" className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span>New Snippet</span>
        </Link>
      </div>

      {/* View Switcher */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setCurrentView('my')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              currentView === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Snippets
          </button>
          <button
            onClick={() => setCurrentView('public')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              currentView === 'public'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Public Snippets
          </button>
          <button
            onClick={() => setCurrentView('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              currentView === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Snippets
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search snippets by title or description..."
          />
        </div>
        <FilterControls 
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Results */}
      {snippets.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery || Object.values(filters).some(Boolean) ? (
            <>
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No snippets found</h2>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilters({
                    language: '',
                    tags: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  })
                }}
                className="btn-outline"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No snippets yet</h2>
              <p className="text-gray-600 mb-4">
                Start building your code library by creating your first snippet
              </p>
              <Link to="/create" className="btn-primary">
                Create Your First Snippet
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Snippets Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                onDelete={handleDeleteSnippet}
              />
            ))}
          </div>

          {/* Pagination Info */}
          {pagination.pages > 1 && (
            <div className="text-center text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </div>
          )}
        </>
      )}

      {loading && snippets.length > 0 && (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto" />
        </div>
      )}
    </div>
  )
}

export default Home