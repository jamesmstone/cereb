import input_1 from "./message-parse-1.md" with { type: "text" };
import input_2 from "./message-parse-2.md" with { type: "text" };
import input_3 from "./message-parse-3.md" with { type: "text" };
import input_4 from "./message-parse-4.md" with { type: "text" };
import { type MessageBody } from "~/ai-service";

import { type QueryMessages } from "~/query";

const datas: (string | QueryMessages)[][] = [
  [
    input_1,
    {
      history: [],
      newMessage: [
        {
          type: "text",
          text: "this is a user message",
        },
      ],
    },
  ],

  [
    input_2,

    {
      history: [
        {
          messages: [
            {
              text: "this  is a user message",
              type: "text",
            },
          ],
          role: "user",
        },
        {
          messages: [
            {
              text: "hi i am a assistant",
              type: "text",
            },
          ],
          role: "assistant",
        },
      ],

      newMessage: [],
    },
  ],

  [
    input_3,

    {
      history: [
        {
          messages: [
            {
              text: "this  is a user message",
              type: "text",
            },
          ],
          role: "user",
        },
        {
          messages: [
            {
              text: "hi i am a assistant",
              type: "text",
            },
          ],
          role: "assistant",
        },
      ],

      newMessage: [],
    },
  ],

  [
    input_4,

    {
      history: [
        {
          messages: [
            {
              text: "this  is a user message",
              type: "text",
            },
          ],
          role: "user",
        },
        {
          messages: [
            {
              text: "hi i am a assistant",
              type: "text",
            },
          ],
          role: "assistant",
        },
      ],

      newMessage: [
        {
          text: "this  is new user message",
          type: "text",
        },
      ],
    },
  ],
];

export default datas;
