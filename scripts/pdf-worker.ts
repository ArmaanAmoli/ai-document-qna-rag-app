import {getDocumentProxy , extractText} from "unpdf";
import {readFile, readFileSync} from "fs";
// argv -> full path of directory , target file name , actual command
const filePath = process.argv[2];
async function run(){
    const buffer = readFileSync(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const {text} = await extractText(pdf , {mergePages:true});
    pdf.destroy()
    process.stdout.write(text);
}

run().catch((err)=>{
    process.stderr.write(err.message);
    process.exit(1);
});