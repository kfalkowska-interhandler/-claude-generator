const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractPureHtml(text) {
  const cleaned = text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const doctypeIndex = cleaned.search(/<!DOCTYPE html>/i);
  if (doctypeIndex !== -1) {
    return cleaned.slice(doctypeIndex).trim();
  }

  const htmlIndex = cleaned.search(/<html[\s>]/i);
  if (htmlIndex !== -1) {
    return cleaned.slice(htmlIndex).trim();
  }

  return cleaned;
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
Nie dodawaj backticks.
Nie dodawaj żadnych wyjaśnień przed ani po kodzie.
Kod ma zaczynać się od <!DOCTYPE html>.`;

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

  const htmlOnly = extractPureHtml(rawText);

  fs.writeFileSync('index.html', htmlOnly, 'utf8');
  console.log('Plik index.html został wygenerowany.');
}

run().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
