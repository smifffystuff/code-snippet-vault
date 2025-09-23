import { useEffect } from 'react'
import Prism from 'prismjs'

// Import the theme
import 'prismjs/themes/prism-tomorrow.css'

// Import only the most essential and stable language components
import 'prismjs/components/prism-markup' // HTML
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-json'

const CodeBlock = ({ code, language = 'javascript', className = '', showLineNumbers = false }) => {
  useEffect(() => {
    // Try to load the specific language component if needed
    const normalizedLanguage = normalizeLanguage(language)
    
    // Load additional language components dynamically if available
    if (normalizedLanguage === 'python') {
      import('prismjs/components/prism-python').catch(() => {})
    } else if (normalizedLanguage === 'typescript') {
      import('prismjs/components/prism-typescript').catch(() => {})
    } else if (normalizedLanguage === 'java') {
      import('prismjs/components/prism-java').catch(() => {})
    } else if (normalizedLanguage === 'bash') {
      import('prismjs/components/prism-bash').catch(() => {})
    }
    
    // Small delay to ensure language is loaded before highlighting
    setTimeout(() => {
      Prism.highlightAll()
    }, 10)
  }, [code, language])

  // Normalize language names for Prism
  const normalizeLanguage = (lang) => {
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript', 
      'py': 'python',
      'sh': 'bash',
      'shell': 'bash',
      'c++': 'cpp',
      'c#': 'csharp',
      'cs': 'csharp',
      'yml': 'yaml',
      'md': 'markdown',
      'html': 'markup'
    }
    
    return languageMap[lang.toLowerCase()] || lang.toLowerCase()
  }

  const normalizedLanguage = normalizeLanguage(language)

  return (
    <div className={`relative ${className}`}>
      <pre className={`code-block ${showLineNumbers ? 'line-numbers' : ''} overflow-x-auto`}>
        <code className={`language-${normalizedLanguage} text-sm sm:text-base`}>
          {code}
        </code>
      </pre>
      
      {/* Language badge */}
      <div className="absolute top-2 right-2">
        <span className="language-badge text-xs">
          {language.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export default CodeBlock