export interface ChatRequest {
    message: string;
  }
  
  export interface ChatResponse {
    reply: string;
    memoryUpdated: boolean;
  }
  
  export interface AppState {
    gateway: "online" | "offline";
    agentId: string;
    memoryPath: string;
  }
  