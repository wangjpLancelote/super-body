import OpenAI from "openai";
import type { GenerateTextParams, LlmClient } from "./types";

export class OpenAIResponsesClient implements LlmClient {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model = process.env.OPENAI_MODEL ?? "gpt-5.4",
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: params.systemPrompt,
      input: params.userPrompt,
    });

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("Model returned empty output.");
    }

    return text;
  }
}
