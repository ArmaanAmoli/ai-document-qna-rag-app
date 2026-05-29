import {test , expect} from 'vitest';
import { generateEmbedding } from '../embedding';

test('The model return an array of length 384', async ()=>{
    const ans = await generateEmbedding("This is a sample text");
    expect (ans.length).toBe(384);
})