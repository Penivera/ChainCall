import { useState } from 'react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from "../context/WalletProvider.tsx"
import { useConnection } from '@solana/wallet-adapter-react';

// API Service
export class TransactionService {
  private baseUrl: string;

  constructor(baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  //endpoint call function
  async buildTransaction(params: {
    rpc_url: string;
    program_id: string;
    accounts: Array<{
      pubkey: string;
      is_signer: boolean;
      is_writable: boolean;
    }>;
    instruction_data: string;
    fee_payer: string;
  }) {
    const response = await fetch(`${this.baseUrl}/solana/tx/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to build transaction');
    }

    return await response.json();
  }


  async simulateTransaction(params: {
    rpc_url: string;
    transaction_base64: string;
    accounts?: string[];
  }) {
    const response = await fetch(`${this.baseUrl}/solana/tx/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to simulate transaction');
    }

    return await response.json();
  }
}


export function useTransaction() {
  const { signTransaction, isConnected, rpcUrl } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const txService = new TransactionService();

  const executeTransaction = async (params: {
    program_id: string;
    accounts: Array<{
      pubkey: string;
      is_signer: boolean;
      is_writable: boolean;
    }>;
    instruction_data: string;
    fee_payer: string;
  }) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Building transaction');
      const buildResult = await txService.buildTransaction({
        rpc_url: rpcUrl,
        ...params,
      });


      console.log('Deserializing transaction');
      const txBuffer = Buffer.from(buildResult.transaction_base64, 'base64');
      let transaction: Transaction | VersionedTransaction;

      try {
        transaction = VersionedTransaction.deserialize(txBuffer);
      } catch {
        transaction = Transaction.from(txBuffer);
      }

      console.log('✍️ Signing transaction...');
      const signedTx = await signTransaction(transaction);

      console.log('🚀 Sending transaction...');
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );

      console.log('⏳ Confirming transaction...');
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ Transaction successful!', signature);
      setIsLoading(false);

      return {
        signature,
        success: true,
      };
    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const simulateTransaction = async (params: {
    program_id: string;
    accounts: Array<{
      pubkey: string;
      is_signer: boolean;
      is_writable: boolean;
    }>;
    instruction_data: string;
    fee_payer: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {

      console.log('🔨 Building transaction for simulation...');
      const buildResult = await txService.buildTransaction({
        rpc_url: rpcUrl,
        ...params,
      });


      console.log('🎮 Simulating transaction...');
      const simResult = await txService.simulateTransaction({
        rpc_url: rpcUrl,
        transaction_base64: buildResult.transaction_base64,
        accounts: params.accounts.map(a => a.pubkey),
      });

      console.log('✅ Simulation complete!', simResult);
      setIsLoading(false);

      return simResult;
    } catch (err: any) {
      console.error('❌ Simulation failed:', err);
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    executeTransaction,
    simulateTransaction,
    isLoading,
    error,
  };
}
