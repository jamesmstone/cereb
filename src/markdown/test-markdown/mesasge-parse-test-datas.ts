import input_1 from "./message-parse-1.md" with { type: "text" };
import input_2 from "./message-parse-2.md" with { type: "text" };
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
      history: [],
      newMessage: [],
    },
  ],
];

export default datas;
