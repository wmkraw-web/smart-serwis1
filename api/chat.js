export default async function handler(req, res) {
  // Akceptujemy tylko zapytania typu POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pobieramy bezpiecznie klucz, który ustawisz w panelu Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Brak klucza API po stronie serwera Vercel.' });
  }

  try {
    // Wysyłamy zapytanie do Google z bezpiecznego miejsca (serwera)
    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body) // Przekazujemy to, co przyszło z frontendu
    });

    const data = await googleRes.json();
    
    if (!googleRes.ok) {
      return res.status(googleRes.status).json(data);
    }
    
    // Zwracamy odpowiedź z powrotem do aplikacji użytkownika
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

### Krok 2: Modyfikacja aplikacji (Frontendu)

Teraz musimy powiedzieć naszej aplikacji, żeby przestała odpytywać Google, a zaczęła odpytywać nasz nowy mikro-serwer.

1. Otwórz plik **`src/App.jsx`**.
2. **Usuń całkowicie linijkę nr 5** (tę z Twoim kluczem: `const apiKey = "AIzaSy...";`). Twój kod w `App.jsx` od teraz w ogóle nie może zawierać tego klucza.
3. Znajdź w kodzie funkcję `const callGeminiAPI = async (userText, retries = 5) => { ... }` i podmień ją w całości na tę wersję:

```javascript
  const callGeminiAPI = async (userText, retries = 5) => {
    const prompt = `
Użytkownik pyta o urządzenie:
Marka: ${device.brand}
Model: ${device.model}
Typ: ${device.type}

Pytanie: ${userText}
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "Jesteś ekspertem serwisowym. Twoim zadaniem jest podawanie BEZPOŚREDNICH i KONKRETNYCH odpowiedzi technicznych. Nie odsyłaj użytkownika do wyszukiwarki ani ogólnych stron wsparcia. Jeśli użytkownik pyta o części (np. RAM, filtry), podaj dokładny typ i parametry dla tego konkretnego modelu. Jeśli pyta o kod błędu, podaj jego dokładne znaczenie i kroki naprawy. Używaj wyszukiwarki Google, aby znaleźć twarde dane techniczne na temat zadanego modelu. Bądź zwięzły i profesjonalny." }] },
      tools: [{ google_search: {} }] 
    };

    let delay = 1000;
    for (let i = 0; i < retries; i++) {
      try {
        // ZMIANA: Wysyłamy zapytanie do naszego własnego mikro-serwera na Vercel!
        const response = await fetch(`/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd serwera: ${response.status} - ${errorData.error?.message || errorData.error || 'Odrzucono'}`);
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Przepraszam, nie udało mi się wygenerować odpowiedzi.";
      } catch (error) {
        if (i === retries - 1) {
          return `🚨 **Błąd połączenia:**\n${error.message}`;
        }
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }
  };