const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function cleanClaudeOutput(text) {
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function run() {
  const prompt = `Jako Claude Coder, wygeneruj kompletny plik HTML z osadzonym CSS i JavaScript.

Aplikacja: menedżer zadań.

Wymagania:
- nowoczesny, czysty wygląd,
- responsywny layout,
- dodawanie zadań,
- edycja zadań,
- usuwanie zadań,
- oznaczanie jako wykonane,
- wyszukiwarka,
- sortowanie,
- localStorage,
- gotowe do uruchomienia w przeglądarce,
- bez zewnętrznych bibliotek.

Zwróć wyłącznie surowy kod HTML.
Nie używaj markdown.
Nie dodawaj bloków typu code fence.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const rawText = response.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');

  const cleanText = cleanClaudeOutput(rawText);

  fs.writeFileSync('index.html', cleanText, 'utf8');
  console.log('Plik index.html został wygenerowany.');
}

run().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
