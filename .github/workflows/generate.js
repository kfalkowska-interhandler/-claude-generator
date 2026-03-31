Tak — poniżej masz gotowy cały plik generate.js do skopiowania 1:1. Korzysta z oficjalnego SDK Anthropic, wysyła prompt przez client.messages.create(...) i zapisuje wynik do pliku app.html przez fs.writeFileSync(...).

javascript
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

Zwróć wyłącznie gotowy kod HTML, bez żadnych wyjaśnień przed i po.`;

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

  const text = response.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');

  fs.writeFileSync('app.html', text, 'utf8');
  console.log('Plik app.html został wygenerowany.');
}

run().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
