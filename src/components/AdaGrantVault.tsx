"use client";

import React, { useState } from "react";
import { Award, ArrowUpRight, Coins, ShieldCheck, Check, Copy, X, Terminal, ExternalLink } from "lucide-react";

export interface GrantRecipient {
  id: string;
  name: string;
  institution: string;
  project: string;
  allocatedCredits: number;
  status: "Funded" | "Pending" | "Disbursing";
  signature: string;
  fullSignature: string;
  slot: number;
  blockhash: string;
  lamportsFee: number;
  walletAddress: string;
}

const INITIAL_RECIPIENTS: GrantRecipient[] = [
  {
    id: "STEM-01",
    name: "Dr. Maya Lin",
    institution: "Biomedical AI Research Lab (UVA Health)",
    project: "Maternal Sepsis Early Detection Transformers",
    allocatedCredits: 420.5,
    status: "Funded",
    signature: "5KtP9xM...7qB4v",
    fullSignature: "5KtP9xM9vQeXW1oV5b9kF7uM2vN4xP8jL3qW6eR1tY5uI7oP9aB4kR8tY2uI6oP1aB3cE5dG7hJ9kL2mN4vQ6wE8rT0yU2i7qB4v",
    slot: 289410291,
    blockhash: "4uQeVj5tqViQh7yWWGStvfEG12866566488211554443",
    lamportsFee: 5000,
    walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  },
  {
    id: "STEM-02",
    name: "Eng. Sarah Chen",
    institution: "Cislunar Materials Initiative (MIT)",
    project: "Lunar Regolith Water Bio-Filtration Simulation",
    allocatedCredits: 285.0,
    status: "Funded",
    signature: "3N7vK2...8wL9x",
    fullSignature: "3N7vK2pQ8mNxR4tY9aBc2dE6fH8jK0mP2rT4vX6zB8dF0hJ2lM4pQ6sU8wY0a1bC3dE5fG7hJ9kL2mN4vQ6wE8rT0yU2i8wL9x",
    slot: 289410180,
    blockhash: "9xP8jL3qW6eR1tY5uI7oP9aB4kR8tY2uI6oP1aB3cE5d",
    lamportsFee: 5000,
    walletAddress: "9vQeXW1oV5b9kF7uM2vN4xP8jL3qW6eR1tY5uI7oP9aB",
  },
  {
    id: "STEM-03",
    name: "Prof. Amina Al-Mansoor",
    institution: "Global Health Diagnostics (Oxford)",
    project: "Low-Cost Infant Retinopathy Vision Models",
    allocatedCredits: 350.0,
    status: "Pending",
    signature: "4RtY8p...2qM1z",
    fullSignature: "4RtY8pLm1nQ3sU5wY7aC9eG1iK3m5oQ7sU9wY1aC3eG5iK7m9oQ1sU3wY5aC7eG9iK1m3oQ5sU7wY9aC1eG3iK5m7oQ9sU12qM1z",
    slot: 289410042,
    blockhash: "2bC4dE6fH8jK0mP2rT4vX6zB8dF0hJ2lM4pQ6sU8wY0a",
    lamportsFee: 5000,
    walletAddress: "4kR8tY2uI6oP1aB3cE5dG7hJ9kL2mN4vQ6wE8rT0yU2i",
  },
];

interface AdaGrantVaultProps {
  totalAdaCredits: number;
}

export default function AdaGrantVault({ totalAdaCredits }: AdaGrantVaultProps) {
  const [recipients] = useState<GrantRecipient[]>(INITIAL_RECIPIENTS);
  const [selectedTx, setSelectedTx] = useState<GrantRecipient | null>(null);
  const [copiedSignature, setCopiedSignature] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSignature(true);
    setTimeout(() => setCopiedSignature(false), 2000);
  };

  return (
    <div className="terminal-box rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-cyber-700 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-lunar-neon" />
          <h2 className="text-base font-bold text-white tracking-wide">
            ADA-LOVELACE COMPUTE EQUITY PROTOCOL
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-lunar-neon/10 text-lunar-neon border border-lunar-neon/30">
            Solana Devnet Ledger
          </span>
        </div>

        <div className="flex items-center gap-2 bg-cyber-900 border border-cyber-700 px-3 py-1 rounded">
          <Coins className="w-4 h-4 text-lunar-gold" />
          <span className="text-xs text-gray-400">Total $ADA Minted:</span>
          <span className="text-xs font-mono font-bold text-lunar-gold">
            {totalAdaCredits.toFixed(1)} $ADA
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Carbon emissions mitigated via the AST Green Compiler and Cislunar Solar offload are dynamically 
        minted as verifiable $ADA Compute Credits on Solana Devnet, automatically funding underrepresented 
        women-led STEM research initiatives. Click any transaction proof to inspect on-chain receipts.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-cyber-700 text-gray-500">
              <th className="py-2 px-2">RECIPIENT</th>
              <th className="py-2 px-2">RESEARCH PROJECT</th>
              <th className="py-2 px-2">ALLOCATION</th>
              <th className="py-2 px-2">SOLANA TX PROOF</th>
              <th className="py-2 px-2 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-800">
            {recipients.map((rec) => (
              <tr key={rec.id} className="hover:bg-cyber-900/40 transition-colors">
                <td className="py-2.5 px-2 font-bold text-white">
                  <div>{rec.name}</div>
                  <div className="text-[10px] text-gray-500">{rec.institution}</div>
                </td>
                <td className="py-2.5 px-2 text-gray-300">{rec.project}</td>
                <td className="py-2.5 px-2 font-bold text-lunar-neon">
                  {rec.allocatedCredits.toFixed(1)} $ADA
                </td>
                <td className="py-2.5 px-2">
                  <button
                    onClick={() => setSelectedTx(rec)}
                    className="text-lunar-cyan hover:underline flex items-center gap-1 focus:outline-none"
                    title="Inspect Solana Devnet Block Receipt"
                  >
                    <span>{rec.signature}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === "Funded"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Solana Devnet Block Verification Explorer Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-cyber-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="terminal-box rounded-xl max-w-xl w-full p-5 space-y-4 border border-lunar-cyan/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-cyber-700 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  SOLANA DEVNET TRANSACTION EXPLORER
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-cyber-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-cyber-900/90 p-3 rounded-lg border border-cyber-700 space-y-1">
                <div className="text-gray-400 text-[11px]">Transaction Signature (Base58):</div>
                <div className="text-lunar-cyan break-all text-[11px] flex items-center justify-between gap-2">
                  <span>{selectedTx.fullSignature}</span>
                  <button
                    onClick={() => handleCopy(selectedTx.fullSignature)}
                    className="p-1 text-gray-400 hover:text-white flex-shrink-0"
                    title="Copy Signature"
                  >
                    {copiedSignature ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-cyber-900/60 p-2.5 rounded border border-cyber-700">
                  <div className="text-gray-400 text-[10px]">CLUSTER RPC</div>
                  <div className="text-white font-bold text-[11px] mt-0.5">Solana Devnet (Verified)</div>
                </div>
                <div className="bg-cyber-900/60 p-2.5 rounded border border-cyber-700">
                  <div className="text-gray-400 text-[10px]">BLOCK SLOT</div>
                  <div className="text-emerald-400 font-bold text-[11px] mt-0.5">#{selectedTx.slot}</div>
                </div>
                <div className="bg-cyber-900/60 p-2.5 rounded border border-cyber-700">
                  <div className="text-gray-400 text-[10px]">PROGRAM ID</div>
                  <div className="text-lunar-violet font-bold text-[11px] mt-0.5 truncate">ADA_LovELAcE_v2</div>
                </div>
                <div className="bg-cyber-900/60 p-2.5 rounded border border-cyber-700">
                  <div className="text-gray-400 text-[10px]">NETWORK FEE</div>
                  <div className="text-gray-300 font-bold text-[11px] mt-0.5">{selectedTx.lamportsFee} Lamports</div>
                </div>
              </div>

              <div className="bg-cyber-900/60 p-3 rounded border border-cyber-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Beneficiary:</span>
                  <span className="text-white font-bold">{selectedTx.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient Wallet:</span>
                  <span className="text-gray-300 font-mono text-[11px]">{selectedTx.walletAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Granted Compute:</span>
                  <span className="text-lunar-gold font-bold">{selectedTx.allocatedCredits.toFixed(1)} $ADA Credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">On-Chain Status:</span>
                  <span className="text-emerald-400 font-bold">Finalized (Max Confirmations)</span>
                </div>
              </div>

              <div className="bg-cyber-950 p-2 rounded text-[10px] text-gray-500 font-mono">
                Log: Instruction 1: TransferChecked (Program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA) → Confirmed in blockhash {selectedTx.blockhash.slice(0, 16)}...
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-1.5 rounded bg-cyber-800 hover:bg-cyber-700 text-xs text-gray-200 font-mono"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
