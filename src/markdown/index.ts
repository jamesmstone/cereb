import { Marked, Parser, Renderer, MarkedOptions } from "@ts-stack/markdown";
import { isUrl, pathOrUrlToAttachmentMessage } from "~/attachment";
import { type MessageBody, newTextBody, type TokenUsage } from "~/ai-service";
import path from "path";
import * as cheerio from "cheerio";

const obsidianInternalLinkRegex = /\[\[([^\[\]]+?)\]\]/g;
class CustomMdRenderer extends Renderer {
  constructor(
    private rootDirPath?: string,
    private currentDirPath?: string,
    options?: MarkedOptions,
  ) {
    super(options);
  }

  override link(href: string, title: string, text: string): string {
    let destination;
    if (isUrl(href)) {
      destination = href;
    } else {
      destination = this.currentDirPath
        ? path.join(this.currentDirPath, href)
        : href;
    }

    return `<a href="${destination}">${text}</a>`;
  }

  override image(href: string, title: string, text: string): string {
    return this.link(href, title, text);
  }

  override paragraph(text: string) {
    const matched = obsidianInternalLinkRegex.exec(text);

    text = text.replace(obsidianInternalLinkRegex, (match, innerLink) => {
      let destination;
      if (isUrl(innerLink)) {
        destination = innerLink;
      } else {
        destination = this.rootDirPath
          ? path.join(this.rootDirPath, innerLink)
          : innerLink;
      }

      return `<a href="${destination}">${innerLink}</a>`;
    });
    return `<p>` + text + `</p>\n`;
  }
}

export function parseMarkdown(
  md: string,
  rootWorkingDir?: string,
  currentDir?: string,
): string {
  const result = Marked.parse(md, {
    renderer: new CustomMdRenderer(rootWorkingDir, currentDir),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
  });

  return result;
}

export type Elem =
  | {
      type: "h2";
      id?: string;
      text?: string;
    }
  | {
      type: "pre";
      content: string;
      class?: string;
    }
  | {
      type: "p_with_link";
      href?: string;
      text: string;
    }
  | {
      type: "p_without_link";
      text: string;
    };

export function htmlToElems(html: string): Array<Elem> {
  Array<MessageBody>;
  let parser = cheerio.load(html);

  const elements: Elem[] = [];

  parser("h2, pre, p").each((_index, element) => {
    const el = parser(element);
    if (!el) {
      return null;
    }
    const rawTagName = el.prop("tagName");
    if (!rawTagName) {
      return null;
    }
    const tagName = rawTagName.toLowerCase();

    switch (tagName) {
      case "h2":
        elements.push({
          type: "h2",
          id: el.attr("id"),
          text: el.text(),
        });
        break;
      case "pre":
        elements.push({
          type: "pre",
          content: el.text().trim(),
          class: el.find("code").attr("class"),
        });
        break;
      case "p":
        const link = el.find("a");
        if (link.length > 0) {
          elements.push({
            type: "p_with_link",
            href: link.attr("href"),
            text: link.text(),
          });
        } else {
          elements.push({
            type: "p_without_link",
            text: el.text(),
          });
        }
        break;
    }
  });
  return elements;
}

export async function elemsToMessage(
  elems: Array<Elem>,
): Promise<Array<MessageBody>> {
  let messages: Array<MessageBody> = [];

  for (const eachElem of elems) {
    switch (eachElem.type) {
      case "h2":
        //skip for now
        break;

      case "pre":
        if (eachElem.class) {
          if (eachElem.class.startsWith("lang-")) {
            if (eachElem.class !== "lang-cereb-meta") {
              const lang = eachElem.class.replace("lang-", "");
              messages.push(
                newTextBody(`\`\`\`${lang}\n${eachElem.content}\n\`\`\``),
              );
            }
          } else {
            messages.push(newTextBody(`\`\`\`\n${eachElem.content}\n\`\`\``));
          }
        } else {
          messages.push(newTextBody(`\`\`\`\n${eachElem.content}\n\`\`\``));
        }
        break;

      case "p_with_link":
        if (eachElem.href) {
          messages.push(await pathOrUrlToAttachmentMessage(eachElem.href));
        }
        break;

      case "p_without_link":
        messages.push(newTextBody(eachElem.text));
        break;
    }
  }

  return messages;
}

export async function messagesFromMarkdown(
  md: string,
  rootWorkingDir?: string,
  currentDir?: string,
): Promise<Array<MessageBody>> {
  const parsedHtml = parseMarkdown(md, rootWorkingDir, currentDir);
  const elems = htmlToElems(parsedHtml);
  return await elemsToMessage(elems);
}

export function messageBodyToMarkdown(
  role: string,
  contents: Array<MessageBody>,
  meta?: TokenUsage,
): string {
  let content = contents
    .map((content) => {
      if (content.type === "text") {
        return content.text;
      }
      return null;
    })
    .join("\n");
  if (meta) {
    content += `\n\`\`\`cereb-meta
input  token: ${meta.inputToken}
output token: ${meta.outputToken}
\`\`\`
`;
  }

  return `${role}
---
${content}`;
}
