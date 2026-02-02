export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  type: 'text' | 'error' | 'search-results' | 'action' | 'suggestion';
  data?: any;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export interface AIAction {
  id: string;
  title: string;
  description: string;
  type: 'create-todo' | 'search-documents' | 'analyze-data' | 'generate-report';
  parameters?: Record<string, any>;
}

export interface AISuggestion {
  id: string;
  text: string;
  action?: {
    type: string;
    parameters?: Record<string, any>;
  };
  confidence: number;
}