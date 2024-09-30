// TODO(tacogips) test
const input = `
user
---

\`\`\`python
1+2
\`\`\`

\`\`\`sql
select * from sss
\`\`\`

\`\`\`
some text
\`\`\`


![some](image.png)

[aaa](image.png)

what is this?

[[image.png]]

[aaa](http://tacogips.me/some.jpg)

what is this, again?





assistant
---

	asdf
`;

const expected = [
  {
    type: "h2",
    id: "dummy",
    text: "dummy",
  },
  {
    type: "h2",
    id: "user",
    text: "user",
  },
  {
    type: "pre",
    content: "1+2",
    class: "lang-python",
  },
  {
    type: "pre",
    content: "select * from sss",
    class: "lang-sql",
  },
  {
    type: "pre",
    content: "some text",
    class: undefined,
  },
  {
    type: "p_with_link",
    href: "/d/some/root/current/image.png",
    text: "some",
  },
  {
    type: "p_with_link",
    href: "/d/some/root/current/image.png",
    text: "aaa",
  },
  {
    type: "p_with_link",
    href: "/d/some/root/image.png",
    text: "image.png",
  },
  {
    type: "p_with_link",
    href: "http://tacogips.me/some.jpg",
    text: "aaa",
  },
  {
    type: "p_without_link",
    text: "what is this?",
  },
  {
    type: "p_without_link",
    text: "what is this, again?",
  },
  {
    type: "h2",
    id: "assistant",
    text: "assistant",
  },
  {
    type: "pre",
    content: "asdf",
    class: undefined,
  },
];

export default [input, expected] as string[];
