import * as claudeModels from "./claude/models.json";
import * as openAIModels from "./openai/models.json";

import { ClaudeClient } from "./claude";
import { OpenAIClient } from "./openai";
import { defaultAiModel } from "~/config";

export interface AiClient {
  newChat: () => Promise<Chat>;
}

export enum Role {
  User = "user",
  Assistant = "assistant",
}

export interface TokenUsage {
  inputToken: number;
  outputToken: number;
}

export interface Chat {
  sendQuery: (query: Query) => Promise<QueryResponse>;
  history: () => Array<MessageHistory>;
  pushHistories: (histories: Array<MessageHistory>) => void;
  tokenUsage: () => TokenUsage;
}

export enum ImageType {
  Jpeg = "image/jpeg",
  Png = "image/png",
  Gif = "image/gif",
  Webp = "image/webp",
}
export function detectImageTypeFromFilePathOrUrl(
  filepathOrUrl: string,
): ImageType | null {
  //TODO(tacogips) very naive implementation for now
  if (filepathOrUrl.endsWith(".jpg") || filepathOrUrl.endsWith(".jpeg")) {
    return ImageType.Jpeg;
  } else if (filepathOrUrl.endsWith(".png")) {
    return ImageType.Png;
  } else if (filepathOrUrl.endsWith(".webp")) {
    return ImageType.Webp;
  } else if (filepathOrUrl.endsWith(".gif")) {
    return ImageType.Gif;
  }
  return null;
}

export const strToImageType: Record<string, ImageType> = {
  "image/jpeg": ImageType.Jpeg,
  "image/png": ImageType.Png,
  "image/gif": ImageType.Gif,
  "image/webp": ImageType.Webp,
};

export interface Query {
  bodies: Array<MessageBody>;
  systemPrompt?: Array<TextBody>;
  maxToken?: number;
  temperature?: number; // 0.0 - 1.0  for Claude, between 0 and 2 for OpenAI //TODO(tacogips) unify this
}

export type MessageHistory = {
  role: Role;
  messages: Array<MessageBody>;
};

export type QueryResponse = {
  tokenUsage: TokenUsage;
  usedModel: string | null;
  content: Array<MessageBody>;
};

export function emptyResponse(): QueryResponse {
  return {
    tokenUsage: {
      inputToken: 0,
      outputToken: 0,
    },
    usedModel: null,
    content: [],
  };
}

export type MessageBody = TextBody | ImageBody | IgnoreBody;

export function newTextBody(text: string): TextBody {
  return {
    type: "text",
    text,
  };
}

export function newImageBody(
  imageType: ImageType,
  base64Image: string,
): ImageBody {
  return {
    type: "image",
    imageType,
    base64Image,
  };
}

export function newIgnoreBody(text: string): IgnoreBody {
  return {
    type: "ignore",
    text,
  };
}

export type TextBody = {
  type: "text";
  text: string;
};

export type ImageBody = {
  type: "image";
  imageType: ImageType;
  base64Image: string;
};

export type IgnoreBody = {
  type: "ignore";
  text: string;
};

export enum AiService {
  Claude,
  OpenAI,
}
export type AiModel = {
  modelName: string;
  service: AiService;
};

function searchAiServiceByModelName(modelName: string): AiService {
  if (claudeModels["models"].includes(modelName)) {
    return AiService.Claude;
  }

  if (openAIModels["models"].includes(modelName)) {
    return AiService.OpenAI;
  }

  throw new Error(`unknown model name ${modelName}`);
}

export function aiModelFromName(modelName: string): AiModel {
  const service = searchAiServiceByModelName(modelName);
  return { modelName, service };
}

export function newAiClientFromModel(specifiedModelName?: string): AiClient {
  const modelName = specifiedModelName || defaultAiModel();
  if (!modelName) {
    throw new Error(
      "no model name specified nor default model name is not set",
    );
  }
  const aiModel = aiModelFromName(modelName);

  switch (aiModel.service) {
    case AiService.Claude:
      return new ClaudeClient(aiModel.modelName);

    case AiService.OpenAI:
      return new OpenAIClient(aiModel.modelName);
  }
}

export function allModelList(): string[] {
  return [...claudeModels["models"], ...openAIModels["models"]];
}
