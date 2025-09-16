# Gemini AI Integration Plan

## Use Cases

- Generate reading content by topic/language/length.
- Generate 5 multiple-choice questions based on session content.

## API Setup

- Env: `GEMINI_API_KEY`
- Safety: enable safe content; block disallowed categories.

## Prompt Patterns

- Content generation:
  - System: "You are a writing assistant for speed reading practice."
  - User: "Language: {en|vi}. Topic: {topic}. Target words: {n}. Write clear, neutral text for learners."
- Quiz generation:
  - System: "You create comprehension MCQs (4 options) about given text."
  - User: "Return JSON: [{index,prompt,options[4],correctIndex}] based on this text: ..."

## Error Handling

- Timeouts: 10s; retry x2 with backoff.
- Rate limit: 5/session, 50/day/user (enforced app-side).

## Minimal Test (manual)

```bash
curl -s -H "Authorization: Bearer $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Write 120 words about photosynthesis in English"}' \
  https://generativelanguage.googleapis.com/v1/models/gemini:generateContent
```
