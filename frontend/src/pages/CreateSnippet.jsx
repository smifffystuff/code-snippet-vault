import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { snippetAPI } from '../services/api'
import CodeBlock from '../components/CodeBlock'
import toast from 'react-hot-toast'

const POPULAR_LANGUAGES = [
  'javascript', 'python', 'java', 'typescript', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css',
  'sql', 'bash', 'powershell', 'json', 'yaml', 'markdown'
]

const CreateSnippet = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    code: '',
    tags: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    if (!formData.code.trim()) {
      toast.error('Please enter some code')
      return
    }

    try {
      setLoading(true)
      
      const snippetData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        language: formData.language,
        code: formData.code,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      }

      const newSnippet = await snippetAPI.create(snippetData)
      toast.success('Snippet created successfully!')
      navigate(`/snippet/${newSnippet._id}`)
    } catch (err) {
      console.error('Error creating snippet:', err)
      toast.error(err.response?.data?.error || 'Failed to create snippet')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave? Your changes will be lost.')) {
      navigate('/')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Snippet</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="btn-outline"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="card">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {formData.title || 'Untitled Snippet'}
            </h2>
            {formData.description && (
              <p className="text-gray-600">{formData.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <span className="language-badge">{formData.language}</span>
            {formData.tags && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.split(',').map((tag, index) => (
                  tag.trim() && (
                    <span key={index} className="tag">
                      {tag.trim()}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
          
          {formData.code ? (
            <CodeBlock code={formData.code} language={formData.language} />
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
              No code to preview
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Async Await Wrapper Function"
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of what this code does..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language *
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {POPULAR_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., async, utility, helper"
                  className="input-field"
                />
              </div>
            </div>

            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code *
              </label>
              <textarea
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Paste your code here..."
                rows={15}
                className="input-field font-mono text-sm resize-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Snippet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default CreateSnippet