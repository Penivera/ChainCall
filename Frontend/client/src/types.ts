export type IdlInstruction = {
  name: string;
  discriminator: number[];
  accounts: {
    name: string;
    isMut?: boolean;
    isSigner?: boolean;
  }[];
  args: {
    name: string;
    type: string;
  }[];
};

export type FetchedIdl = {
  chain: string;
  program_id: string;
  version: string;
  name: string;
  instructions: IdlInstruction[];
};

export type ApiSendTxRequest = {
  rpc_url: string;
  transaction_base64?: string;
  program_id: string;
  accounts: {
    pubkey: string;
    is_signer: boolean | undefined;
    is_writable: boolean | undefined;
  }[];
  instruction_data: string;
  fee_payer?: string;
  sign_with_backend: boolean;
};