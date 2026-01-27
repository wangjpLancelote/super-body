/**
 * Vector Store Integration with Supabase pgvector
 * 
 * This module provides:
 * - Embedding generation using LangChain embeddings
 * - Vector storage and similarity search via Supabase pgvector
 * - Support for documents and todos embedding
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import type { Document } from '@langchain/core/documents';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small',
  stripNewLines: true,
});

/**
 * Initialize vector store for documents
 */
export async function initializeDocumentVectorStore() {
  try {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      embeddings,
      {
        client: supabase,
        tableName: 'documents',
        queryName: 'match_documents',
      }
    );
    return vectorStore;
  } catch (error) {
    console.error('Failed to initialize document vector store:', error);
    throw error;
  }
}

/**
 * Initialize vector store for todos
 */
export async function initializeTodoVectorStore() {
  try {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      embeddings,
      {
        client: supabase,
        tableName: 'todos',
        queryName: 'match_todos',
      }
    );
    return vectorStore;
  } catch (error) {
    console.error('Failed to initialize todo vector store:', error);
    throw error;
  }
}

/**
 * Create embedding for text
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddings.embedQuery(text);
    return result;
  } catch (error) {
    console.error('Failed to create embedding:', error);
    throw error;
  }
}

/**
 * Store document with embedding
 */
export async function storeDocument(
  userId: string,
  title: string,
  content: string
): Promise<string> {
  try {
    // Create embedding for document content
    const embedding = await createEmbedding(`${title}\n${content}`);

    // Store in Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        title,
        content,
        embedding,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to store document:', error);
    throw error;
  }
}

/**
 * Store todo with embedding
 */
export async function storeTodoEmbedding(
  todoId: string,
  userId: string,
  title: string,
  description?: string
): Promise<void> {
  try {
    // Create embedding for todo
    const text = description ? `${title}\n${description}` : title;
    const embedding = await createEmbedding(text);

    // Update todo with embedding
    const { error } = await supabase
      .from('todos')
      .update({ embedding })
      .eq('id', todoId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to store todo embedding:', error);
    throw error;
  }
}

/**
 * Search documents by similarity
 */
export async function searchDocuments(
  userId: string,
  query: string,
  limit: number = 5
): Promise<Array<{ id: string; title: string; content: string; similarity: number }>> {
  try {
    // Create embedding for query
    const queryEmbedding = await createEmbedding(query);

    // Search in vector store using raw SQL for control
    const { data, error } = await supabase
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_count: limit,
        p_user_id: userId,
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to search documents:', error);
    throw error;
  }
}

/**
 * Search todos by similarity
 */
export async function searchTodos(
  userId: string,
  query: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  title: string;
  description?: string;
  status: string;
  similarity: number;
}>> {
  try {
    // Create embedding for query
    const queryEmbedding = await createEmbedding(query);

    // Search in vector store
    const { data, error } = await supabase
      .rpc('match_todos', {
        query_embedding: queryEmbedding,
        match_count: limit,
        p_user_id: userId,
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to search todos:', error);
    throw error;
  }
}

/**
 * Create RPC function for document matching (to be run in Supabase SQL editor)
 * This is the PostgreSQL function for vector similarity search
 */
export const CREATE_MATCH_DOCUMENTS_FUNCTION = `
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  p_user_id uuid default null
) returns table (
  id uuid,
  title text,
  content text,
  similarity float
) language plpgsql as $$
begin
  return query
    select
      d.id,
      d.title,
      d.content,
      1 - (d.embedding <=> query_embedding) as similarity
    from documents d
    where (p_user_id is null or d.user_id = p_user_id)
    order by d.embedding <=> query_embedding
    limit match_count;
end;
$$;
`;

/**
 * Create RPC function for todo matching
 */
export const CREATE_MATCH_TODOS_FUNCTION = `
create or replace function match_todos(
  query_embedding vector(1536),
  match_count int default 5,
  p_user_id uuid default null
) returns table (
  id uuid,
  title text,
  description text,
  status text,
  similarity float
) language plpgsql as $$
begin
  return query
    select
      t.id,
      t.title,
      t.description,
      t.status,
      1 - (t.embedding <=> query_embedding) as similarity
    from todos t
    where (p_user_id is null or t.user_id = p_user_id)
    order by t.embedding <=> query_embedding
    limit match_count;
end;
$$;
`;

export default {
  initializeDocumentVectorStore,
  initializeTodoVectorStore,
  createEmbedding,
  storeDocument,
  storeTodoEmbedding,
  searchDocuments,
  searchTodos,
};
