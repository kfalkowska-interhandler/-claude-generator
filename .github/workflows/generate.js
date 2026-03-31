const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractPureHtml(text) {
  if (!text) return '';

  let cleaned = text
    .replace(/```html/gi, '')
    .replace(/```/g, '')
    .replace(/^\s*html\s*/i, '')
    .trim();

  const doctypeMatch = cleaned.match(/<!DOCTYPE html>[\s\S]*$/i);
  if (doctypeMatch) {
    return doctypeMatch[0].trim();
  }

  const htmlMatch = cleaned.match(/<html[\s\S]*$/i);
  if (htmlMatch) {
    return htmlMatch[0].trim();
  }

  return cleaned;
}

function injectSafetyCleaner(html) {
  const cleanerScript = `
<script>
document.addEventListener('DOMContentLoaded', function () {
  const nodes = Array.from(document.body.childNodes);

  for (const node of nodes) {
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent &&
      (
        node.textContent.trim().startsWith('\`\`\`html') ||
        node.textContent.trim() === '\`\`\`' ||
        node.textContent.trim() === 'html'
      )
    ) {
      node.remove();
    }
  }
});
</script>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${cleanerScript}\n</body>`);
  }

  return html + cleanerScript;
}

async function run() {
  const prompt = `
Wygeneruj kompletny, gotowy do uruchomienia plik HTML.

Temat: Menedżer zadań po polsku.

Wymagania:
- nowoczesny wygląd,
- responsywny layout,
- dodawanie zadań,
- usuwanie zadań,
- oznaczanie jako wykonane,
- wyszukiwanie,
- sortowanie,
- zapisywanie danych w localStorage,
- osadzony CSS i JavaScript w jednym pliku,
- bez zewnętrznych bibliotek.

Bardzo ważne zasady odpowiedzi:
- zwróć wyłącznie czysty HTML,
- nie używaj markdown,
- nie dodawaj \`\`\`html ani \`\`\`,
- nie dodawaj żadnego komentarza przed kodem,
- nie dodawaj żadnego komentarza po kodzie,
- odpowiedź ma zaczynać się dokładnie od <!DOCTYPE html>.
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 5000,
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

  let html = extractPureHtml(rawText);
  html = injectSafetyCleaner(html);

  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Plik index.html został wygenerowany poprawnie.');
}

run().catch(err => {
  console.error('Błąd generowania:', err);
  process.exit(1);
});
