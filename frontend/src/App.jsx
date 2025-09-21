import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateSnippet from './pages/CreateSnippet'
import EditSnippet from './pages/EditSnippet'
import SnippetDetail from './pages/SnippetDetail'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateSnippet />} />
        <Route path="/snippet/:id" element={<SnippetDetail />} />
        <Route path="/snippet/:id/edit" element={<EditSnippet />} />
      </Routes>
    </Layout>
  )
}

export default App