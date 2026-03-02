// Gemini AI summarization service

export async function simplifyNews(description: string): Promise<{ bullets: string[]; paragraph: string }> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not found');

  const systemInstruction = `Summarize this news for a 15-year-old. Use 3 bullet points and one short paragraph. Keep it simple and remove jargon.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: description }] },
        { role: 'system', parts: [{ text: systemInstruction }] }
      ]
    })
  });

  if (!response.ok) throw new Error('Gemini API request failed');
  const data = await response.json();

  // Parse Gemini response (adjust as needed for actual API response)
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const bullets = text.match(/•\s.*?(?=\n|$)/g) || [];
  const paragraph = text.replace(/•\s.*?(?=\n|$)/g, '').trim();

  return { bullets, paragraph };
}
