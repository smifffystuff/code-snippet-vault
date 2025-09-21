import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

const POPULAR_LANGUAGES = [
  'javascript', 'python', 'java', 'typescript', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css',
  'sql', 'bash', 'powershell', 'json', 'yaml', 'markdown'
]

const FilterControls = ({ onFilterChange, currentFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    language: '',
    tags: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...currentFilters
  })

  // Only call onFilterChange when filters actually change, not on every render
  useEffect(() => {
    // Don't call on initial render if filters haven't changed from defaults
    const hasChanged = filters.language !== '' || 
                      filters.tags !== '' || 
                      filters.sortBy !== 'createdAt' || 
                      filters.sortOrder !== 'desc'
    
    if (hasChanged || Object.keys(currentFilters).length > 0) {
      onFilterChange(filters)
    }
  }, [filters.language, filters.tags, filters.sortBy, filters.sortOrder]) // Remove onFilterChange from deps

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    const clearedFilters = {
      language: '',
      tags: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
  }

  const hasActiveFilters = filters.language || filters.tags || 
    filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-outline flex items-center space-x-2 ${
          hasActiveFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
            {[filters.language, filters.tags].filter(Boolean).length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => updateFilter('language', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All languages</option>
                  {POPULAR_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => updateFilter('tags', e.target.value)}
                  placeholder="e.g., async, utility, react"
                  className="input-field text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Date Modified</option>
                    <option value="title">Title</option>
                    <option value="language">Language</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => updateFilter('sortOrder', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FilterControls