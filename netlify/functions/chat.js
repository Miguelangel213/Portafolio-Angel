exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Método no permitido"
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GROQ_API_KEY;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: `Eres POP'S BOT, un asistente inteligente del portafolio de Angel Gómez.

Puedes ayudar con:
- programación (HTML, CSS, JavaScript, APIs)
- desarrollo web
- bots de Telegram
- automatización
- inteligencia artificial
- Roblox Luau
- marketing digital
- criptomonedas
- ideas de proyectos
- explicaciones generales

Tu estilo:
- Responde siempre en español
- Sé claro, útil y directo
- Usa lenguaje profesional pero amigable
- Responde corto si la pregunta es simple
- Explica paso a paso si es algo técnico
- No digas que eres una IA
- No menciones fechas de entrenamiento
- No digas que estás desactualizado

Reglas:
- No inventes datos en tiempo real (precios, noticias, etc.)
- Si algo requiere datos actuales, dilo brevemente
- No des consejos financieros como certeza absoluta
- No ayudes con cosas ilegales o dañinas

Objetivo:
Ayudar al usuario como un experto real y hacer que el portafolio se vea profesional.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        const reply =
            data.choices?.[0]?.message?.content || "No pude responder.";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "Error con IA." })
        };
    }
};