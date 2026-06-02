import { searchContent } from "@/lib/db/queries/searchContent";
import { generateEmbedding } from "@/lib/embedding";

export async function POST(documentId:string , question:string){
    // start with enbedding the quetion
    const embeddedQuestion = await generateEmbedding(question);
    // Do a vector search over the vector db
    const contextString:string = await searchContent(documentId , embeddedQuestion);
    
    //creating LLM prompt

    const prompt:string =
    `
    <Context>
        ${contextString}
    </Context>

    <UserQuestion>
        ${question}    
    </UserQuestion>
    `;

}