import {
  type MessageBody,
  type MessageHistory,
  type QueryResponse,
  Role,
  newAiClientFromModel,
  newTextBody,
  type TokenUsage,
  emptyResponse,
} from "./ai-service";
import { pathOrUrlToAttachmentMessage } from "./attachment";
import { messagesFromMarkdown, messageBodyToMarkdown } from "./markdown";

import { type QueryMessages } from "./query";

import { Command } from "commander";
import getStdin from "get-stdin";

const program = new Command();
program
  .name("cereb")
  .argument("[input_file]", "input file name or input from stdin")
  .option("--markdown")
  .option("--dry-run")
  .option("--format <string>", "json|markdown", "markdown")
  .option("--no-input", "default true")
  .option("--max-token <number>", "maximum token to generate")
  .option(
    "--model <string>",
    "specified or read from environment ${CEREB_DEFAULT_MODEL}",
  )
  .option("--attachement <string>", "file path or url")
  .option("--pretty")
  .parse();

const [inputFile] = program.args;
const {
  model,
  format,
  markdown,
  dryRun,
  attachement,
  pretty,
  noInput,
  maxToken,
} = program.opts();

type Format = "json" | "markdown";

function validateFormat(format: string): Format {
  if (format !== "json" && format !== "markdown") {
    throw new Error(`Invalid format: ${format}`);
  }
  return format as Format;
}

let input: string;
if (inputFile) {
  input = await Bun.file(inputFile).text();
} else {
  input = await getStdin();
  input = input.trim();
}

if (!input || !input.trim()) {
  console.error("No input file or stdin");
  program.outputHelp();
  process.exit(1);
}

const typedFormat = validateFormat(format);

const queryMessage: QueryMessages = {
  history: [],
  newMessage: [],
};

if (attachement) {
  const attachementMessage = await pathOrUrlToAttachmentMessage(attachement);
  queryMessage.newMessage.push(attachementMessage);
}

if (markdown) {
  const { history, newMessage } = await messagesFromMarkdown(input);
  queryMessage.history = history;
  queryMessage.newMessage = newMessage;
} else {
  queryMessage.newMessage.push(newTextBody(input));
}

let response: QueryResponse;
if (dryRun) {
  response = emptyResponse();
} else {
  const aiClient = newAiClientFromModel(model);
  const chat = await aiClient.newChat();
  chat.pushHistories(queryMessage.history);

  response = await chat.sendQuery({
    bodies: queryMessage.newMessage,
    maxToken,
  });
}

if (typedFormat === "markdown") {
  const markdownResponse = messageBodyToMarkdown(
    Role.Assistant,
    response.content,
    response.tokenUsage,
  );

  if (!noInput) {
    const markdownInput = messageBodyToMarkdown(
      Role.User,
      queryMessage.newMessage,
    );
    process.stdout.write(markdownInput + "\n\n");
  }

  process.stdout.write(markdownResponse);
  process.exit(0);
} else if (typedFormat === "json") {
  let jsonResult: {
    input?: Array<MessageHistory>;
    response: Array<MessageBody>;
    tokenUsage: TokenUsage;
  };
  if (!noInput) {
    let chatHistory = queryMessage.history;
    chatHistory.push({
      role: Role.User,
      messages: queryMessage.newMessage,
    });
    jsonResult = {
      input: chatHistory,
      response: response.content,
      tokenUsage: response.tokenUsage,
    };
  } else {
    jsonResult = {
      response: response.content,
      tokenUsage: response.tokenUsage,
    };
  }

  if (pretty) {
    process.stdout.write(JSON.stringify(jsonResult, null, 4));
  } else {
    process.stdout.write(JSON.stringify(jsonResult));
  }

  process.exit(0);
}
