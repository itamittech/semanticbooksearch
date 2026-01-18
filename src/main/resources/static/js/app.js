document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loadBooksBtn = document.getElementById('loadBooksBtn');
    const loadingStatus = document.getElementById('loadingStatus');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const genreSelect = document.getElementById('genreSelect');
    const semanticResultsContainer = document.getElementById('semanticResults');
    const keywordResultsContainer = document.getElementById('keywordResults');

    // Modal Elements
    const showAddBookModalBtn = document.getElementById('showAddBookModal');
    const addBookModal = document.getElementById('addBookModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addBookForm = document.getElementById('addBookForm');

    // Chat Elements
    const chatInput = document.getElementById('chatInput');
    const chatBtn = document.getElementById('chatBtn');
    const chatHistory = document.getElementById('chatHistory');

    // Initialize
    loadGenres();

    // --- Event Listeners ---

    // Tabs
    window.switchTab = function (tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

        document.getElementById(tabId).style.display = 'block';
        event.target.classList.add('active');
    };

    // Load Books
    loadBooksBtn.addEventListener('click', async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/books/load', { method: 'POST' });
            if (response.ok) {
                const text = await response.text();
                loadingStatus.textContent = 'Success: ' + text;
                loadingStatus.style.color = 'green';
                loadGenres(); // Refresh genres in case of new ones
            } else {
                loadingStatus.textContent = 'Error loading books';
                loadingStatus.style.color = 'red';
            }
        } catch (error) {
            loadingStatus.textContent = 'Network error';
            loadingStatus.style.color = 'red';
        }
        setLoading(false);
    });

    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    // Chat
    chatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // Modal
    showAddBookModalBtn.addEventListener('click', () => addBookModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => addBookModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == addBookModal) addBookModal.style.display = 'none';
    });

    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addBookForm);
        const book = Object.fromEntries(formData.entries());
        // Auto-generate ID (simple random for demo)
        book.id = Date.now().toString();

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(book)
            });
            if (response.ok) {
                alert('Book added successfully!');
                addBookModal.style.display = 'none';
                addBookForm.reset();
                loadGenres();
            } else {
                alert('Failed to add book.');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Network error.');
        }
    });

    // --- Functions ---

    function setLoading(isLoading) {
        loadBooksBtn.disabled = isLoading;
        if (isLoading) loadBooksBtn.textContent = 'Loading...';
        else loadBooksBtn.textContent = 'Load Books from JSON';
    }

    async function loadGenres() {
        try {
            const response = await fetch('/api/books/genres');
            if (response.ok) {
                const genres = await response.json();
                genreSelect.innerHTML = '<option value="All">All Genres</option>';
                genres.forEach(genre => {
                    const option = document.createElement('option');
                    option.value = genre;
                    option.textContent = genre;
                    genreSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load genres', error);
        }
    }

    async function performSearch() {
        const query = searchInput.value.trim();
        const genre = genreSelect.value;
        if (!query) return;

        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        semanticResultsContainer.innerHTML = '<p>Loading...</p>';
        keywordResultsContainer.innerHTML = '<p>Loading...</p>';

        try {
            const params = new URLSearchParams({ q: query, limit: 3 });
            if (genre !== 'All') params.append('genre', genre);

            const response = await fetch(`/api/books/search/compare?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                renderResults(data.semantic, semanticResultsContainer);
                renderResults(data.keyword, keywordResultsContainer);
            } else {
                semanticResultsContainer.innerHTML = '<p>Error searching.</p>';
                keywordResultsContainer.innerHTML = '<p>Error searching.</p>';
            }
        } catch (error) {
            console.error(error);
            semanticResultsContainer.innerHTML = '<p>Network error.</p>';
            keywordResultsContainer.innerHTML = '<p>Network error.</p>';
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }

    function renderResults(results, container) {
        container.innerHTML = '';
        if (!results || results.length === 0) {
            container.innerHTML = '<p>No matches found.</p>';
            return;
        }

        results.forEach(result => {
            const book = result.book;
            const score = (result.relevanceScore * 100).toFixed(1);

            const el = document.createElement('div');
            el.className = 'result-item';
            el.innerHTML = `
                <h4>${book.title}</h4>
                <div class="result-meta">
                    ${book.author} | ${book.genre} (${book.publicationYear})
                    <br>Match Score: <strong>${score}%</strong>
                </div>
                <div class="result-summary">${book.summary}</div>
            `;
            container.appendChild(el);
        });
    }

    async function sendMessage() {
        const query = chatInput.value.trim();
        if (!query) return;

        // Add User Message
        addMessage(query, 'user');
        chatInput.value = '';
        chatBtn.disabled = true;

        // Add Placeholder AI Message
        const loadingMsg = addMessage('Thinking...', 'ai');

        try {
            const response = await fetch('/api/books/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (response.ok) {
                const answer = await response.text();
                loadingMsg.textContent = answer;
            } else {
                loadingMsg.textContent = 'Sorry, something went wrong.';
            }
        } catch (error) {
            loadingMsg.textContent = 'Network error.';
        } finally {
            chatBtn.disabled = false;
        }
    }

    function addMessage(text, role) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.textContent = text;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return msgDiv;
    }
});
