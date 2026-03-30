const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateMassiveFile() {
  const prompt = `
Napisz kompletny plik JavaScript.
Temat: aplikacja do zarządzania zadaniami.
Plik ma być duży, uporządkowany i profesjonalny.
Uwzględnij:
- strukturę kodu,
- komentarze,
- funkcje,
- walidację,
- przykładowe dane,
- logikę działania.
Zwróć wyłącznie gotowy kod.
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
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
    .join('\\n');

  fs.writeFileSync('massive-file.js', text);
}

generateMassiveFile().catch(err => {
  console.error(err);
  process.exit(1);
});
