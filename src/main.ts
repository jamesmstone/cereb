import {
  type MessageBody,
  newAiClientFromModel,
  newTextBody,
  type TokenUsage,
} from "./ai-service";
import { pathOrUrlToAttachmentMessage } from "./attachment";
import { messagesFromMarkdown, messageBodyToMarkdown } from "./markdown";

import { Command } from "commander";
import getStdin from "get-stdin";

const program = new Command();
program
  .name("cereb")
  .argument("[input_file]", "input file name or input from stdin")
  .option("--markdown")
  .option("--format <string>", "json|markdown", "markdown")
  .option("--with-input")
  .option("--max-token <number>", "maximum token to generate")
  .option(
    "--model <string>",
    "specified or read from environment ${CEREB_DEFAULT_MODEL}",
  )
  .option("--attachement <string>", "file path or url")
  .option("--pretty")
  .parse();

const [inputFile] = program.args;
const { model, format, markdown, attachement, pretty, withInput, maxToken } =
  program.opts();

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

let queryMessages: Array<MessageBody> = [];
if (attachement) {
  const attachementMessage = await pathOrUrlToAttachmentMessage(attachement);

  queryMessages.push(attachementMessage);
}
if (markdown) {
  queryMessages.push(...(await messagesFromMarkdown(input)));
} else {
  queryMessages.push(newTextBody(input));
}

const aiClient = newAiClientFromModel(model);
const chat = await aiClient.newChat();
let response = await chat.sendQuery({
  bodies: queryMessages,
  maxToken,
});

if (typedFormat === "markdown") {
  const markdownResponse = messageBodyToMarkdown(
    "assistant",
    response.content,
    response.tokenUsage,
  );

  if (withInput) {
    const markdownInput = messageBodyToMarkdown("user", queryMessages);
    process.stdout.write(markdownInput + "\n\n");
  }

  process.stdout.write(markdownResponse);
  process.exit(0);
} else if (typedFormat === "json") {
  let jsonResult: {
    input?: Array<MessageBody>;
    response: Array<MessageBody>;
    tokenUsage: TokenUsage;
  };
  if (withInput) {
    jsonResult = {
      input: queryMessages,
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
