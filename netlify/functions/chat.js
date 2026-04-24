exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Método no permitido"
        };
    }

    try {
        const { message } = JSON.parse(event.body);

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ reply: "Falta la API key en Netlify." })
            };
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `Eres POP'S BOT. Responde en español, corto, claro y amigable. Usuario: ${message}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    reply: data.error?.message || "Error con Gemini API."
                })
            };
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Gemini respondió vacío. Revisa la API key o el modelo.";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                reply: "Error interno en la función."
            })
        };
    }
};