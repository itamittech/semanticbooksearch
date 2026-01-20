
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SearchPage } from './pages/SearchPage';
import { ChatPage } from './pages/ChatPage';
import { AddBookPage } from './pages/AddBookPage';
import { HybridSearchPage } from './pages/HybridSearchPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/add" element={<AddBookPage />} />
          <Route path="/hybrid-search" element={<HybridSearchPage />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
