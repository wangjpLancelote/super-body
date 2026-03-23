export interface FetchUrlResult {
  url: string;
  title: string;
  content: string;
}

export interface FetchUrlClient {
  fetchUrl(url: string): Promise<FetchUrlResult>;
}
