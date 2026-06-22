import { readFile , mkdir } from "fs/promises";
import { join } from "path";
export async function loadTextFile(uniqueName:string):Promise<string>{
    try{
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const filePath = join(uploadDir, uniqueName);
        const data:string = await readFile(filePath , 'utf-8');
        return data;
    }catch(error){
        console.error('failed to read file: ',error);
        throw new Error(`An error occured while loading text: ${error}`)
    }
}