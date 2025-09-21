import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Copy, Calendar, Tag } from 'lucide-react'
import { snippetAPI } from '../services/api'
import CodeBlock from '../components/CodeBlock'
import toast from 'react-hot-toast'

const SnippetDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSnippet()
  }, [id])

  const fetchSnippet = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await snippetAPI.getById(id)
      setSnippet(data)
    } catch (err) {
      console.error('Error fetching snippet:', err)
      setError('Snippet not found')
      toast.error('Failed to load snippet')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      toast.success('Code copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy code')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
      return
    }

    try {
      await snippetAPI.delete(id)
      toast.success('Snippet deleted successfully')
      navigate('/')
    } catch (err) {
      console.error('Error deleting snippet:', err)
      toast.error('Failed to delete snippet')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !snippet) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Snippet Not Found</h2>
        <p className="text-gray-600 mb-4">The snippet you're looking for doesn't exist or has been deleted.</p>
        <Link to="/" className="btn-primary">
          Back to Snippets
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn-outline flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="btn-outline flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </button>
          <Link
            to={`/snippet/${snippet._id}/edit`}
            className="btn-outline flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Snippet Content */}
      <div className="card">
        {/* Title and Description */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {snippet.title}
          </h1>
          {snippet.description && (
            <p className="text-gray-600 leading-relaxed">
              {snippet.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="language-badge">
              {snippet.language.toUpperCase()}
            </span>
          </div>
          
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {snippet.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(snippet.createdAt)}</span>
          </div>
          
          {snippet.updatedAt !== snippet.createdAt && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>•</span>
              <span>Modified {formatDate(snippet.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Code Block */}
        <div>
          <CodeBlock 
            code={snippet.code} 
            language={snippet.language}
            showLineNumbers={true}
          />
        </div>
      </div>
    </div>
  )
}

export default SnippetDetail