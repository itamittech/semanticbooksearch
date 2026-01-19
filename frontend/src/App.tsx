
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SearchPage } from './pages/SearchPage';
import { ChatPage } from './pages/ChatPage';
import { AddBookPage } from './pages/AddBookPage';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/add" element={<AddBookPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
