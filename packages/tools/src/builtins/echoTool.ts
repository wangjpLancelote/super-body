import { z } from "zod";
import type { Tool } from "../types";

const echoInputSchema = z.object({
  text: z.string().min(1),
});

export const echoTool: Tool<typeof echoInputSchema> = {
  name: "echo",
  description: "Return the provided text unchanged.",
  inputSchema: echoInputSchema,
  async execute(input) {
    return input.text;
  },
};
