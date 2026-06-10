import { Chunk } from "@/types";
import { serialize } from 'v8';

function getSizeInMB(dataStructure: any): number {
  // serialize() converts the object to a binary V8 buffer
  const bytes = serialize(dataStructure).byteLength;
  return bytes / (1024 * 1024);
}


export function chunkText(text:string , maxLength = 500 , overlap = 50):Chunk[]{
    console.log("chunking started");

    const chunks:{content:string ; index:number}[] = []
    let start = 0;
    let index = 0;

    while(start <text.length){
        let end = start + maxLength
        if(end > text.length) end = text.length
        else{
            //trying to break at a space to avoid cutting words
            const lastSpace = text.lastIndexOf(' ' , end);
            if(lastSpace > start) end = lastSpace;
        }
        chunks.push({content:text.substring(start , end).trim() , index});
        index++;
        const nextStart = end - overlap //move back by over lap to avoide breaking sentence
        start = nextStart > start ? nextStart:end;
        console.log(`Memory allocation: ${getSizeInMB(chunks).toFixed(2)} MB`);
    }
    console.log("chunking done")
    return chunks;
}