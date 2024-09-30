import { test, expect, describe } from "bun:test";
import parse_test_datas from "./test-markdown/parse-test-datas";

import { parseMarkdown, htmlToElems, type Elem } from "./index";

describe("parse markdown", () => {
  test("parseMarkdown", () => {
    for (const [input, expected] of parse_test_datas) {
      const parsed = parseMarkdown(input as string, "/workdir", "/current");
      const actual = htmlToElems(parsed);
      expect(actual).toEqual(expected as Elem[]);
    }
  });
});
