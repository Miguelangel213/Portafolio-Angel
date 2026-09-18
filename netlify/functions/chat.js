exports.handler = async function (event) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ reply: "Método no permitido" })
        };
    }

    try {
        const rawApiKey = process.env.GROQ_API_KEY;
        const apiKey = rawApiKey ? rawApiKey.trim() : null;

        if (!apiKey) {
            console.error("ERROR: La variable GROQ_API_KEY no está configurada en Netlify.");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ reply: "Error de configuración: falta la clave de la IA." })
            };
        }

        const { message } = JSON.parse(event.body || "{}");
        if (!message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ reply: "El mensaje no puede estar vacío." })
            };
        }

        // Modelo actualizado: llama-3.1-8b-instant fue descontinuado por Groq el 16/08/2026
        const model = "openai/gpt-oss-20b";
        const url = "https://api.groq.com/openai/v1/chat/completions";

        const requestBody = {
            model,
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
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        const rawBody = await response.text();

        if (!response.ok) {
            console.error("Error de Groq — status:", response.status, "| body:", rawBody);
            let errorMsg = `Error de Groq (${response.status})`;
            try {
                const errorData = JSON.parse(rawBody);
                errorMsg = errorData.error?.message || errorMsg;
            } catch (_) {}
            // Devolvemos 200 con el error en el body: así el fetch del frontend
            // nunca lo confunde con un 404 de "función no encontrada".
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ reply: `Error al conectar con la IA: ${errorMsg}` })
            };
        }

        const data = JSON.parse(rawBody);
        const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error("Error en la Netlify Function:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ reply: `Error interno: ${error.message}` })
        };
    }
};