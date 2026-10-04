import 'dotenv/config';

interface EmbedResponse {
  embeddings: number[][];
}

export async function generateEmbedding(texts: string[]): Promise<number[][]> {
  const embeddingServiceUrl = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8001/embed';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(embeddingServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Embedding service returned ${response.status}: ${response.statusText}`);
    }

    const data: EmbedResponse = await response.json();

    if (!data.embeddings || !Array.isArray(data.embeddings)) {
      throw new Error('Invalid response format from embedding service');
    }

    console.log('Embedder: generated', data.embeddings.length, 'embeddings');
    return data.embeddings;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Embedding request timed out after 30 seconds');
    }
    console.error('Embedding generation failed:', error);
    throw error;
  }
}
