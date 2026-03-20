export interface GenerateTextParams {
  systemPrompt: string;
  userPrompt: string;
}

export interface LlmClient {
  generateText(params: GenerateTextParams): Promise<string>;
}
