import { type Elem } from "~/markdown";

const input = `

---
id: some
aliases: []
tags:
- clippings
author:
  - "[[@auth0]]"
created: "2024-09-20"
description: xxx
source:  somewhere
title: no
---


user
---
user text


assistant
---
text

`;

const expected = [
  {
    text: "id: some\naliases: []\ntags:",
    type: "p_without_link",
  },
  {
    id: "user",
    text: "user",
    type: "h2",
  },
  {
    text: "user text",
    type: "p_without_link",
  },
  {
    id: "assistant",
    text: "assistant",
    type: "h2",
  },
  {
    text: "text",
    type: "p_without_link",
  },
];

export default [input, expected] as Array<string | Elem[]>;
