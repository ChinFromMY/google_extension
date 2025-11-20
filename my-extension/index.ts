// index.ts (Supabase Edge Function for RAG using Gemini)

// 1. Imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'; // Use npm: specifier for Gemini SDK
import { Hono } from 'npm:hono@4'; // Recommended library for routing in Edge Functions

// --- CORS FIX: Define Headers ---
const corsHeaders = {
    // Allow requests from any origin (safer alternatives can be implemented later)
    'Access-Control-Allow-Origin': '*', 
    // Allow the browser to send standard and Supabase-related headers
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
};



// 2. Interfaces for Type Safety
interface Lead {
  url: string;
  // Other fields you might store (e.g., content_text, user_id)
}

interface ReqPayload {
  url?: string;
  query?: string;
}

// 3. Initialize Constants and Environment Variables
const app = new Hono();
const EMBEDDING_MODEL = 'gemini-embedding-001';
const LLM_MODEL = 'gemini-2.5-flash';
const TABLE_NAME = 'bookmarked_links'; // ⬅️ Change this to your vector table name

// The Gemini API key will be accessed from the environment secrets (GEMINI_API_KEY)

// Helper function to initialize services and handle security checks
function getServices() {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    // Using the SERVICE_ROLE_KEY is required for bypassing RLS to write content/embeddings
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_API_KEY) {
        throw new Error('Server configuration error: Required environment keys (SUPABASE_URL, SERVICE_KEY, GEMINI_API_KEY) missing.');
    }

    // Initialize Supabase Client (using the secure Service Key)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false },
    });

    // Initialize Gemini AI Client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    return { supabase, genAI };
}

// Helper to fetch content (simplified, needs external library for complex parsing)
async function fetchAndCleanContent(url: string): Promise<string> {
    try {
        const response = await fetch(url); // Deno uses the Web Standard fetch API
        const html = await response.text();
        
        // **In a real application, you would use an HTML parsing library here** // to extract meaningful text, strip headers/footers, etc.
        // For simplicity, we just return a snippet of the raw HTML text:
        return html.substring(0, 4000); 

    } catch (e) {
        console.error(`Failed to fetch content for ${url}:`, e);
        return `Error fetching content: ${e.message}`;
    }
}

// --- API Routes (RAG_API_ENDPOINT) ---

// POST /rag-api/save (Handles saving a new URL and generating its embedding)
app.post('/save', async (c) => {
    try {
        const { supabase, genAI } = getServices();
        const { url } = (await c.req.json()) as ReqPayload;

        if (!url) return c.json({ error: 'URL is required' }, 400);

        // 1. Fetch content from the URL
        const content = await fetchAndCleanContent(url);

        // 2. Generate embedding vector using Gemini API
        const embeddingResponse = await genAI.models.embedContent({
            model: EMBEDDING_MODEL,
            content: content,
            taskType: 'RETRIEVAL_DOCUMENT', // Optimized for search
        });
        
        const embedding = embeddingResponse.embedding.values;

        // 3. Save the URL and vector to the database
        const { error: insertError } = await supabase.from(TABLE_NAME).insert({
            url: url,
            content_text: content,
            embedding: embedding, // Stored in the pg_vector column
        });

        if (insertError) throw insertError;
        
        // 4. Return the updated list of leads
        const { data: updatedLeads } = await supabase.from(TABLE_NAME).select('url').order('created_at', { ascending: false });
        
        return c.json(updatedLeads || [], 200);

    } catch (error) {
        console.error('Save error:', error.message);
        return c.json({ error: error.message }, 500);
    }
});

// POST /rag-api/rag-query (Handles semantic search and LLM answer generation)
app.post('/rag-query', async (c) => {
    try {
        const { supabase, genAI } = getServices();
        const { query } = (await c.req.json()) as ReqPayload;

        if (!query) return c.json({ error: 'Query is required' }, 400);

        // 1. Generate embedding vector for the user's query
        const embeddingResponse = await genAI.models.embedContent({
            model: EMBEDDING_MODEL,
            content: query,
            taskType: 'RETRIEVAL_QUERY', // Optimized for query
        });
        
        const queryEmbedding = embeddingResponse.embedding.values;
        const queryVector = JSON.stringify(queryEmbedding);

        // 2. Vector Similarity Search (Retrieval)
        // This relies on a Postgres function (e.g., match_documents) using the <-> operator
        const { data: matchData, error: matchError } = await supabase.rpc('match_documents', {
            query_embedding: queryVector,
            match_threshold: 0.7, // Set your required similarity threshold
            match_count: 5, // Retrieve top 5 relevant documents
        });

        if (matchError) throw matchError;

        // 3. Prepare Context for LLM (Generation)
        const context = matchData.map((d: { content_text: string }) => d.content_text).join('\n---\n');
        const relevantUrls = matchData.map((d: { url: string }) => d.url);

        const prompt = `You are a helpful Q&A assistant. Use ONLY the following retrieved context to answer the user's question. If the answer cannot be found in the context, clearly state that you don't have enough information.
        
        CONTEXT:
        ---
        ${context}
        ---
        
        QUESTION: "${query}"`;
        
        // 4. Call Gemini LLM to generate the final answer
        const response = await genAI.models.generateContent({
            model: LLM_MODEL,
            contents: prompt,
        });

        const answer = response.text.trim();

        return c.json({ answer: answer, relevant_urls: relevantUrls }, 200);

    } catch (error) {
        console.error('RAG Query error:', error.message);
        return c.json({ error: error.message }, 500);
    }
});

// POST /rag-api/clear (Handles deleting all saved data)
app.post('/clear', async (c) => {
    try {
        const { supabase } = getServices();
        const { error: deleteError } = await supabase.from(TABLE_NAME).delete().neq('url', 'placeholder_to_delete_all'); // Simple trick to delete all rows

        if (deleteError) throw deleteError;

        return c.json({ message: 'All bookmarks deleted successfully.' }, 200);
    } catch (error) {
        console.error('Clear error:', error.message);
        return c.json({ error: error.message }, 500);
    }
});

// GET /rag-api/list (Handles fetching all saved URLs)
app.get('/list', async (c) => {
    try {
        const { supabase } = getServices();
        const { data: leads, error: fetchError } = await supabase.from(TABLE_NAME).select('url').order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        return c.json(leads || [], 200);

    } catch (error) {
        console.error('List error:', error.message);
        return c.json({ error: error.message }, 500);
    }
});

// 5. Final Export for Supabase Edge Functions
Deno.serve(app.fetch);