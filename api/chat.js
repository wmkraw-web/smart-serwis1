<<<<<<< HEAD
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Brak klucza API w ustawieniach Vercel.' });
  }

  try {
    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await googleRes.json();

    if (!googleRes.ok) {
      return res.status(googleRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Szczegóły błędu serwera:", error);
    return res.status(500).json({ error: `Krytyczny błąd serwera: ${error.message}` });
  }
=======
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Brak klucza API w ustawieniach Vercel.' });
  }

  try {
    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await googleRes.json();

    if (!googleRes.ok) {
      return res.status(googleRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Szczegóły błędu serwera:", error);
    return res.status(500).json({ error: `Krytyczny błąd serwera: ${error.message}` });
  }
>>>>>>> c3cd9238403fe716ddf0abdf0f399f77341e0924
}