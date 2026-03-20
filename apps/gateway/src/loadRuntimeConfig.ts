import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeConfigSchema, type RuntimeConfig } from "@repo/core";
import { FileConfigStore } from "./fileConfigStore";
import { FileSecretStore } from "./fileSecretStore";

function resolveWorkspacePaths() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = path.dirname(currentFilePath);
  const repoRoot = path.resolve(currentDirPath, "../../..");
  const workspaceDir = path.join(repoRoot, "workspace");

  return {
    repoRoot,
    workspaceDir,
    assistantConfigPath: path.join(workspaceDir, "assistant.config.json"),
    secretConfigPath: path.join(workspaceDir, "secrets.local.json"),
  };
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const paths = resolveWorkspacePaths();

  const configStore = new FileConfigStore(paths.assistantConfigPath);
  const secretStore = new FileSecretStore(paths.secretConfigPath);

  const [config, secrets] = await Promise.all([
    configStore.read(),
    secretStore.read(),
  ]);

  return runtimeConfigSchema.parse({
    model: config.model,
    systemPrompt: config.systemPrompt,
    memoryPolicy: config.memoryPolicy,
    openaiApiKey: secrets.openaiApiKey || process.env.OPENAI_API_KEY,
    braveApiKey: secrets.braveApiKey || process.env.BRAVE_API_KEY,
  });
}

export function resolveWorkspaceRoot() {
  return resolveWorkspacePaths();
}

export function resolveGatewayPaths() {
  return resolveWorkspacePaths();
}
