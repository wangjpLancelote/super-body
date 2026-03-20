export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchClient {
  search(query: string): Promise<SearchResultItem[]>;
}
