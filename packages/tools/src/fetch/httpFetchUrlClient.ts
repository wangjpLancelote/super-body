import { ToolExecutionError } from "../errors";
import type { FetchUrlClient, FetchUrlResult } from "./fetchUrlClient";

const MAX_CONTENT_LENGTH = 8_000;

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function stripHtml(html: string) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function extractTitle(html: string, fallbackUrl: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) {
    return fallbackUrl;
  }

  return normalizeWhitespace(decodeHtmlEntities(match[1])) || fallbackUrl;
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export class HttpFetchUrlClient implements FetchUrlClient {
  constructor(private readonly timeoutMs = 10_000) {}

  async fetchUrl(url: string): Promise<FetchUrlResult> {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new ToolExecutionError("fetch_url", "Invalid URL.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new ToolExecutionError(
        "fetch_url",
        "Only http and https URLs are supported.",
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      signal: AbortSignal.timeout(this.timeoutMs),
      redirect: "follow",
      headers: {
        "user-agent": "personal-ai-assistant/0.1",
      },
    }).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Unknown fetch error";
      throw new ToolExecutionError("fetch_url", message);
    });

    if (!response.ok) {
      throw new ToolExecutionError(
        "fetch_url",
        `Fetch failed with status ${response.status}.`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    const body = await response.text();

    if (contentType.includes("text/html")) {
      const title = extractTitle(body, response.url);
      const content = truncate(
        decodeHtmlEntities(stripHtml(body)),
        MAX_CONTENT_LENGTH,
      );

      return {
        url: response.url,
        title,
        content,
      };
    }

    if (contentType.includes("text/plain")) {
      return {
        url: response.url,
        title: response.url,
        content: truncate(normalizeWhitespace(body), MAX_CONTENT_LENGTH),
      };
    }

    throw new ToolExecutionError(
      "fetch_url",
      `Unsupported content type: ${contentType || "unknown"}.`,
    );
  }
}
