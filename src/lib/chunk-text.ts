export function chunkText(text:string , maxLength = 500 , overlap = 50):{content:string , index:number}[]{
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
        start = end - overlap //move back by over lap to avoide breaking sentence
    }
    return chunks;
}