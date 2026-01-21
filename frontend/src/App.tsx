
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SearchPage } from './pages/SearchPage';
import { ChatPage } from './pages/ChatPage';
import { AddBookPage } from './pages/AddBookPage';
import { HybridSearchPage } from './pages/HybridSearchPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { StudyRoomPage } from './pages/StudyRoomPage';
import { CourseViewPage } from './pages/CourseViewPage';

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
          <Route path="/study-room" element={<StudyRoomPage />} />
          <Route path="/study-room/course/:id" element={<CourseViewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
