import { test, expect, describe } from "bun:test";
import test_datas from "./test-markdown";

import { parseMarkdown } from "./index";

describe("parse markdown", () => {
  test("parseMarkdown", () => {
    forEach(test_datas, ([input, expected]) => {
      expect(input).toEqual(expected);
    });
  });
});
