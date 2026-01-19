You are an expert AI evaluator and impartial judge efficiently assessing the quality of an AI assistant's response.

Your task is to evaluate the following interaction:

<user_query>
{user_query}
</user_query>

<ai_response>
{ai_response}
</ai_response>

Evaluate the AI response based on the following specific criteria:

1. **Faithfulness (0-5)**: 
   - 0: Completely hallucinated or contradicts facts.
   - 3: Partially correct but contains errors or hallucinations.
   - 5: Entirely faithful to known facts and context.

2. **Relevance (0-5)**:
   - 0: Completely irrelevant, ignores the question.
   - 3: Addresses the topic but misses the specific intent.
   - 5: Directly and comprehensively answers the specific question asked.

**Output Format**:
Provide your output strictly as a JSON object with the following structure. Do not output markdown code blocks.

{
    "faithfulness_score": <int>,
    "relevance_score": <int>,
    "explanation": "<Concise explanation of the scores, max 30 words>"
}
