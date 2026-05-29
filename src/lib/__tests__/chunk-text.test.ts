import { describe , it , expect} from 'vitest';
import { chunkText } from '../chunk-text';

describe('chunkText' , ()=>{
    it('splits text into chunks of max specified length' , ()=>{
        const text = 'A'.repeat(1200);
        const chunk = chunkText(text, 500, 0);
        expect(chunk.length).toBe(3);
        expect(chunk[0].content.length).toBeLessThanOrEqual(500);
    });

    it('does not cut words in the middle' , ()=>{
        const text = 'A'.repeat(495) +' hello world';
        const chunks = chunkText(text , 500 , 0);
        expect(chunks[0].content.endsWith('A'.repeat(495))).toBe(true);
    })
})