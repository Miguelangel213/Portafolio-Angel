exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ reply: "Método no permitido" })
        };
    }

    try {
        const apiKey = process.env.GROQ_API_KEY;
        
        // Validar que la API Key exista en Netlify
        if (!apiKey) {
            console.error("ERROR: La variable GROQ_API_KEY no está configurada en Netlify.");
            return {
                statusCode: 500,
                body: JSON.stringify({ reply: "Error de configuración: falta la clave de la IA." })
            };
        }

        const { message } = JSON.parse(event.body || "{}");
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ reply: "El mensaje no puede estar vacío." })
            };
        }

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
                        content: `Eres POP'S BOT, el asistente inteligente del portafolio de Angel Gómez.

Directrices principales:
- Puedes responder sobre CUALQUIER tema general que te pregunten sin limitaciones (programación, tecnología, dudas cotidianas, explicaciones, etc.).
- Si te preguntan sobre el creador o su trabajo, resalta los proyectos y habilidades de Angel Gómez de forma profesional.
- Responde siempre en español, con un tono amigable, claro y directo.
- No inventes datos en tiempo real (precios, noticias actuales).
- No digas que eres un modelo de lenguaje ni menciones tu fecha de entrenamiento.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        // Verificar si Groq devolvió un error (API Key inválida, cuota, etc.)
        if (!response.ok) {
            console.error("Error devuelto por la API de Groq:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ reply: "Error de autenticación o conexión con Groq." })
            };
        }

        const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error("Error en la Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "Error interno al conectar con la IA." })
        };
    }
};
