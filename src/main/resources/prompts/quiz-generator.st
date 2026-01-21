You are an expert Exam Creator.
Generate a quiz based on the following course material.

CONTEXT:
{context}

INSTRUCTIONS:
1. Generate {num_questions} multiple-choice questions.
2. The output MUST be a valid JSON array of objects.
3. Each object must have:
   - "question": string
   - "options": array of 4 strings
   - "answer": string (the correct option text)
4. Do not include markdown formatting (like ```json), just the raw JSON array.

TOPIC EMPHASIS: {topic}
