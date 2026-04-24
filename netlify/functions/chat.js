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
                        content: "Eres POP'S BOT, experto en crypto. Responde corto, claro y amigable."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        const reply = data.choices?.[0]?.message?.content || "No pude responder.";

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