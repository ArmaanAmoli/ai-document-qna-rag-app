import { CohereClient } from "cohere-ai";
import 'dotenv/config';
// console.log(process.env.COHERE_API_KEY);
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })
export async function generateEmbedding(texts: string[]): Promise<number[][]> {
    const response:any = await fetch("http://localhost:8001/embed" , {
        method:"POST",
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify({texts}),
    })
    const data = await response.json();
    return data.embeddings;
}

