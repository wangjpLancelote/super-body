import { ToolExecutionError } from "../errors";
import type { SearchClient, SearchResultItem } from "./searchClient";

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[];
  };
}

export class BraveSearchClient implements SearchClient {
  constructor(private readonly apiKey: string) {}

  async search(query: string): Promise<SearchResultItem[]> {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": this.apiKey,
        },
      },
    );

    if (!res.ok) {
      throw new ToolExecutionError(
        "web_search",
        `Brave API returned ${res.status}`,
      );
    }

    const json = (await res.json()) as BraveSearchResponse;
    const results = json.web?.results ?? [];

    return results
      .filter((item) => item.title && item.url)
      .map((item) => ({
        title: item.title ?? "",
        url: item.url ?? "",
        snippet: item.description ?? "",
      }));
  }
}
