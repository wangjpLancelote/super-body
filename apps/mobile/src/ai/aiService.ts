import { supabase } from '../lib/supabase';

export type AIChatResponse = {
  success?: boolean;
  response?: string;
  data?: any;
  error?: string;
};

export type DocumentSearchResponse = {
  success: boolean;
  count: number;
  documents: Array<{
    id: string;
    title?: string;
    content?: string;
    similarity?: number;
  }>;
};

export async function chatWithAI(message: string) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      action: 'chat',
      input: message,
      dry_run: true,
    },
  });

  if (error) {
    return {
      success: false,
      response: '抱歉，处理您的消息时出现了错误。',
      error: error.message,
    } as AIChatResponse;
  }

  return data as AIChatResponse;
}

export async function searchDocuments(query: string, limit: number = 5) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      action: 'search_documents',
      query,
      limit,
    },
  });

  if (error) {
    return {
      success: false,
      count: 0,
      documents: [],
    } as DocumentSearchResponse;
  }

  return data as DocumentSearchResponse;
}
