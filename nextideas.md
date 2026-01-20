# Future Roadmap: Innovative AI Features

This document outlines the next phase of development to transform the Semantic Book Search library into an innovative, "modern" AI product.

## 1. 🗣️ "Talk to the Book" (Deep RAG)
**Concept**: Enable users to have a dedicated chat session with a specific book. Instead of a general librarian, the AI adopts the persona and knowledge context of the specific book.

**User Story**:
- User clicks "Chat with this Book" on the *Dune* book card.
- User asks: "What is the spice melange?"
- AI answers *only* using information from the *Dune* summary/metadata, perhaps even in the style of Frank Herbert.

**Implementation Context**:
- **Backend**: New endpoint `/api/books/{id}/chat`. Retrieve specific book embeddings/content. Construct a system prompt that enforces the "Book Persona" and restricts knowledge to that specific documents.
- **Frontend**: A modal or dedicated page that opens when a user clicks a "Chat" action on `BookCard`.
- **Value**: High. Transforms static data into an interactive experience.

## 2. 🗺️ Visual Knowledge Graph (The "God View")
**Concept**: A 2D semantic map visualizing the entire library. Books are nodes; distance represents semantic similarity.

**User Story**:
- User visits a "Explore" tab.
- They see a galaxy of dots. Colors represent genres.
- Zooming in reveals clusters (e.g., "Cyberpunk", "Space Opera").
- Dragging a book node reveals its nearest semantic neighbors.

**Implementation Context**:
- **Backend**: Endpoint to return all book embeddings or pre-calculated coordinates.
- **Frontend**: Use **D3.js** or **Recharts** scatter plot.
- **Math**: Perform dimensionality reduction (PCA or t-SNE) on the high-dimensional vector embeddings to map them to 2D (x, y) coordinates for the UI.
- **Value**: High "Wow" factor. Visualizes the "AI's Brain".

## 3. 🎙️ Voice-Activated "Ambient" Mode
**Concept**: Hands-free, voice-driven library interface.

**User Story**:
- User taps a microphone icon.
- User says: "Find me something sad but hopeful."
- App displays results and *speaks* the top recommendation's summary back to the user.

**Implementation Context**:
- **Frontend**: Use the browser's native `SpeechRecognition` and `SpeechSynthesis` APIs (Web Speech API). No extra backend needed for speech-to-text if using browser native, or could use OpenAI Whisper.
- **Value**: High accessibility and futuristic feel.
