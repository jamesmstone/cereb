import { test, expect, describe } from "bun:test";
import parse_test_datas from "./test-markdown/parse-test-datas";

import { parseMarkdownAsHtml, htmlToElems, type Elem } from "./index";

describe("parse markdown", () => {
  test("parseMarkdown", () => {
    for (const [input, expected] of parse_test_datas) {
      const parsed = parseMarkdownAsHtml(
        input as string,
        "/workdir",
        "/current",
      );
      const actual = htmlToElems(parsed);
      expect(actual).toEqual(expected as Elem[]);
    }
  });
});

describe("parse message", () => {
  test("parseMessage", () => {
    for (const [input, expected] of parse_test_datas) {
      const parsed = parseMarkdownAsHtml(
        input as string,
        "/workdir",
        "/current",
      );
      const elems = htmlToElems(parsed);
      const elemsToMessage(elems);
      expect(actual).toEqual(expected as Elem[]);
    }
  });
});
