import { searchContent } from "@/lib/db/queries/searchContent";
import { generateEmbedding } from "@/lib/embedding";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export async function POST(documentId: string, question: string) {
    // start with enbedding the quetion
    const embeddedQuestion = await generateEmbedding(question);
    // Do a vector search over the vector db
    const contextString: string = await searchContent(documentId, embeddedQuestion);

    //creating LLM prompt

    const prompt: string =
        `
    <Context>
        ${contextString}
    </Context>

    <UserQuestion>
        ${question}    
    </UserQuestion>
    `;

    // "Gemini-2.5-Flash-Native-Audio-Dialog"

    const instruction: string = `You are a precise document analysis assistant. Your job is to carefully read and analyze the provided context, then answer the user's question based solely on that context.

You will be given:
- A <Context> section containing the document or relevant excerpts to analyze
- A <UserQuestion> section containing the question to answer

Instructions:
1. Read the <Context> thoroughly before formulating your answer
2. Answer ONLY based on information present in the <Context> — do not use outside knowledge or make assumptions beyond what is stated
3. If the answer cannot be determined from the <Context>, explicitly state: "The provided context does not contain enough information to answer this question"
4. Be concise, accurate, and direct in your response
5. Always wrap your final answer inside <Answer> tags like this:

<Answer>
Your answer here
</Answer>

Do not include any text after the closing </Answer> tag.`

    const ai = new GoogleGenAI({});
    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash-native-audio-dialog",
        contents: prompt,
        config: {
            systemInstruction: instruction,
            thinkingConfig: {
                thinkingLevel: ThinkingLevel.MEDIUM,
            }
        }
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
            }
            catch (error) {
                console.error("Gemini processing stream error:", error);
                controller.error(error);
            }

            finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        },
    });

}