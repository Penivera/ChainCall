export const MOCK_IDL = {
  version: "0.1.0",
  name: "chaincall_program",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "createPost",
      accounts: [
        { name: "post", isMut: true, isSigner: false },
        { name: "author", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "title", type: "string" },
        { name: "content", type: "string" },
        { name: "tag", type: "u8" },
      ],
    },
    {
      name: "deletePost",
      accounts: [
        { name: "post", isMut: true, isSigner: false },
        { name: "author", isMut: true, isSigner: true },
      ],
      args: [{ name: "postId", type: "u64" }],
    },
  ],
};

export const MOCK_LOGS = [
  "Program 11111111111111111111111111111111 invoke [1]",
  "Program 11111111111111111111111111111111 success",
  "Program ChainCall111111111111111111111111111111111 invoke [1]",
  "Program log: Instruction: CreatePost",
  "Program log: Creating new post with title: Hello Solana",
  "Program 11111111111111111111111111111111 invoke [2]",
  "Program 11111111111111111111111111111111 success",
  "Program ChainCall111111111111111111111111111111111 consumed 4200 of 200000 compute units",
  "Program ChainCall111111111111111111111111111111111 success",
];

export const MOCK_SIMULATION_RESULT = {
  unitsConsumed: 4200,
  logs: MOCK_LOGS,
  returnData: null,
  balanceChanges: [
    {
      address: "User11111111111111111111111111111111111111",
      before: 10.5,
      after: 10.4995,
    },
    {
      address: "Post11111111111111111111111111111111111111",
      before: 0,
      after: 0.002,
    },
  ],
};
