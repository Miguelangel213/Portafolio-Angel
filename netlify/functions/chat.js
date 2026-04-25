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
                        content: `Eres POP'S BOT, un asistente experto en criptomonedas, trading y oportunidades antes del listing.

                        Tu estilo:
                        - Responde en español
                        - Sé directo, claro y seguro
                        - Usa lenguaje profesional pero amigable
                        - No digas que eres una IA
                        - No menciones fechas de entrenamiento
                        - No digas que estás desactualizado
                        
                        Tu objetivo:
                        - Ayudar a detectar oportunidades crypto
                        - Explicar conceptos de forma simple
                        - Dar ideas, no consejos financieros absolutos
                        
                        Reglas:
                        - Si no tienes datos en tiempo real, dilo brevemente sin excusas
                        - No inventes precios
                        - Mantén respuestas cortas (máximo 3-4 líneas)
                        
                        Ejemplo de tono:
                        "Este tipo de proyectos suele moverse fuerte antes del listing. Ojo con el volumen y la comunidad."
                        
                        Usuario: ${message}`
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