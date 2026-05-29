import {env , pipeline} from '@huggingface/transformers'

// Disable all external network calls to the Hugging Face Hub
env.allowRemoteModels = false;

// Tell the pipeline exactly where your root local models folder is
env.localModelPath = 'models';

export async function generateEmbedding(text:string):Promise<number[]>{
    
    const extractor = await pipeline('feature-extraction' , 'Xenova/all-MiniLM-L6-v2');
    
    const result = await extractor(text , {pooling:'mean' , normalize:true});
    return Array.from(result.data);
}
