import { CohereClient } from "cohere-ai";
import 'dotenv/config';
// console.log(process.env.COHERE_API_KEY);
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })
export async function generateEmbedding(text: string): Promise<number[]> {

    const response:any = await cohere.embed({
        texts: [text],
        model: "embed-english-light-v3.0",
        inputType: "search_document",
    });
    return response.embeddings[0] as number[];
}

