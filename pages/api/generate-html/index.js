// pages/api/generate-html/index.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metoda nepermisă" });
  }

  const { imageBase64 } = req.body;

  const promptText = `
Analizează imaginea încărcată și evaluează starea de sănătate a plantei sau a grupului de plante.

Dacă imaginea conține o singură plantă, te rog să:
- Identifici numele popular și numele științific.
- Include data la care a fost executat raportul.
- La secțiunea "Analiza stării", evaluează:
    1. Starea generală a plantei.
    2. Semne vizuale de boală sau deficiențe (ex.: pete, îngălbeniri, uscăciuni).
    3. Prezența dăunătorilor.
    4. Structura frunzelor și a tulpinii.
    5. Factorii de stres abiotic.
- Oferă recomandări pentru îmbunătățirea stării.

Dacă imaginea prezintă un grup de plante, te rog să:
- Estimezi suprafața (ex.: în m²) acoperită de plante.
- Estimezi numărul total de plante.
- La secțiunea "Analiza stării", evaluează punctele menționate mai sus.
- Dacă nu se identifică probleme specifice, generează un raport general pentru întregul grup.

Furnizează raportul în format HTML, folosind stiluri inspirate de Tailwind (conforme codului CSS furnizat mai jos) și structurat în secțiuni: "Introducere", "Analiza stării", "Recomandări" și "Concluzie".  
Raportul HTML trebuie să aibă un chenar subțire (1px solid #000) și un efect de umbră (box-shadow).  
Include în secțiunea <style> codul CSS definit mai jos, în stil Tailwind.  
Returnează exclusiv codul HTML rezultat, fără explicații suplimentare și fără delimitatori markdown.  
IMPORTANT: NU folosi backtick-uri în răspuns.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // dacă ai acces, folosește GPT-4 pentru performanțe mai bune
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 0.9,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
    });
    

    let generatedHTML = response.choices[0].message.content || "";
    // Eliminăm eventualele delimitatori de cod
    generatedHTML = generatedHTML.replace(/```+/g, "");
    res.status(200).json({ generatedHTML });
  } catch (error) {
    console.error("EROARE DETALIATĂ:", error.message);
    res.status(500).json({ error: error.message });
  }
}
