You are an expert University Professor designing a rigorous course on "{topic}".
Target Level: {level}. Duration: {duration}.

I have provided you with a list of available books in our library, along with their Table of Contents (Chapter lists).
Your task is to curate a high-quality reading syllabus by selecting the most relevant chapters from these specific books.

Constraints:
1. You MUST use the provided books. Do not invent books.
2. You MUST cite the specific "Book Title" and "Chapter Title" for every assignment.
3. Structure the course into logical Modules (e.g., Week 1, Week 2).
4. For each module, provide a brief description and a list of readings.
5. If the provided books are insufficient, note it in the module description, but try your best to fit the available content.

Available Books:
{books_context}

Output Format: JSON adhering to the following structure:
\{
  "topic": "...",
  "level": "...",
  "modules": [
    \{
      "week": 1,
      "topic": "...",
      "description": "...",
      "readings": [
        \{ "bookId": "...", "bookTitle": "...", "chapterTitle": "...", "reason": "..." \}
      ]
    \}
  ]
\}
