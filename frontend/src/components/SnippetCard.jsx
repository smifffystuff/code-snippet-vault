import { Link } from 'react-router-dom'
import { Calendar, Edit, Eye, Trash2, Copy } from 'lucide-react'
import CodeBlock from './CodeBlock'
import toast from 'react-hot-toast'

const SnippetCard = ({ snippet, onDelete, showActions = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      toast.success('Code copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy code')
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      onDelete(snippet._id)
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link 
            to={`/snippet/${snippet._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
          >
            {snippet.title}
          </Link>
          {snippet.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {snippet.description}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy code"
            >
              <Copy className="h-4 w-4" />
            </button>
            <Link
              to={`/snippet/${snippet._id}`}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="View snippet"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/snippet/${snippet._id}/edit`}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
              title="Edit snippet"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete snippet"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tags and Language */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="language-badge">
          {snippet.language}
        </span>
        {snippet.isPublic && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Public
          </span>
        )}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {snippet.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{snippet.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Code Preview */}
      <div className="mb-4">
        <CodeBlock 
          code={snippet.code.slice(0, 200) + (snippet.code.length > 200 ? '...' : '')}
          language={snippet.language}
          className="text-sm"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>Created {formatDate(snippet.createdAt)}</span>
          {snippet.isPublic && snippet.userEmail && (
            <span className="ml-2 text-xs">
              by {snippet.userEmail}
            </span>
          )}
        </div>
        
        {snippet.updatedAt !== snippet.createdAt && (
          <span>
            Modified {formatDate(snippet.updatedAt)}
          </span>
        )}
      </div>
    </div>
  )
}

export default SnippetCard