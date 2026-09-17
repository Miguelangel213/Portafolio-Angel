exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ reply: "Método no permitido" })
        };
    }

    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.error("ERROR: La variable GROQ_API_KEY no está configurada en Netlify.");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ reply: "Error de configuración: falta la clave de la IA." })
            };
        }

        console.log("GROQ_API_KEY presente:", apiKey.slice(0, 8) + "...");

        const { message } = JSON.parse(event.body || "{}");
        if (!message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ reply: "El mensaje no puede estar vacío." })
            };
        }

        const model = "llama-3.1-8b-instant";
        const url = "https://api.groq.com/openai/v1/chat/completions";

        console.log("Enviando a Groq — modelo:", model, "| url:", url);

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

        console.log("Groq respondió — status:", response.status);

        if (!response.ok) {
            console.error("Error de Groq — status:", response.status, "| body:", rawBody);
            let errorMsg = `Error de Groq (${response.status})`;
            try {
                const errorData = JSON.parse(rawBody);
                errorMsg = errorData.error?.message || errorMsg;
            } catch (_) {}
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ reply: `Error al conectar con la IA: ${errorMsg}` })
            };
        }

        let data;
        try {
            data = JSON.parse(rawBody);
        } catch (parseErr) {
            console.error("Respuesta de Groq no es JSON válido:", rawBody.slice(0, 500));
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ reply: "La IA devolvió una respuesta inesperada." })
            };
        }

        const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

        console.log("Respuesta exitosa — largo:", reply.length);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error("Error en la Netlify Function:", error.name, error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ reply: `Error interno: ${error.message}` })
        };
    }
};
