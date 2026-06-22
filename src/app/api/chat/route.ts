import { searchContent } from "@/lib/db/queries/searchContent";
import { generateEmbedding } from "@/lib/text_utils/embedding";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export async function POST(request : Request) {
    const body = await request.json();
    console.log(body);

    const {documentId , question} = body;

    console.log(question);

    // start with enbedding the quetion
    const questionArr:string[] = [question];
    
    const embeddedQuestion = await generateEmbedding(questionArr);
    
    // Do a vector search over the vector db
    const embeddedQuestionE = embeddedQuestion[0];
    const contextString: string = await searchContent(documentId, embeddedQuestionE);

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
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: instruction,
            
        }
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                //we want to only extract the response inside <Answer> </Answer> tags
                let buffer:string = '';
                let isStreaming:boolean = false;

                for await (const chunk of responseStream) {
                    let text = chunk.text;
                    if (text) {
                        buffer += text;

                        if(!isStreaming ){
                            isStreaming = true;

                            const openingIdx = buffer.indexOf('<Answer>');
                            if(openingIdx != -1){
                                isStreaming = true;
                                buffer = buffer.substring((openingIdx+('<Answer>'.length)));
                                console.log(buffer)
                                controller.enqueue(encoder.encode(buffer));
                                continue;
                            }
                        }

                        if(isStreaming){
                            const regex = /(<\/Answer>|<\/Answe|<\/Answ|<\/Ans|<\/An|<\/A|<\/)$/;
                            if(regex.test(text)){
                                isStreaming = false;
                                const newText = text.substring(0 , text.indexOf('<'));
                                controller.enqueue(encoder.encode(newText));
                                break;
                            }

                            const closeIndex = buffer.indexOf('</Answer>') + 8;
                            if(closeIndex !== -1){
                                isStreaming = false;
                            }
                            controller.enqueue(encoder.encode(text));
                            
                        }
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