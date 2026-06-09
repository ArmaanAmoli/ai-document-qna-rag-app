import { describe , expect, it } from "vitest";
import { extractText } from "../extract-text";

describe('Text extraction test from pdf and text files',()=>{
    it('.txt extractor test',async()=>{
        const text = await extractText('sampleTXT.txt');
        expect(text).toBe('This is a sample text');
    });

    it('.pdf extractor test' ,async()=>{
        const data:any = await extractText('samplePDF.pdf');
        expect(data).toContain('This is a sample text');
    });

    it('testing other file types (should throw error)' , async()=>{
        await expect(extractText('sampleDOC.doc')).rejects.toThrow("Only .pdf and .txt files are supported");
    })
})