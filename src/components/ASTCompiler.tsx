"use client";

import React, { useState, useEffect } from "react";
import { executeTriEngineOptimization, CodeOptimizationResult } from "@/lib/ai-engines";
import { Code2, Cpu, Zap, Droplets, Leaf, RefreshCw } from "lucide-react";

const INITIAL_INEFFICIENT_CODE = `import torch

# INEFFICIENCY DETECTED: O(n^3) scalar iterations, redundant PCIe roundtrips
def unoptimized_cross_attention(query, key, value):
    batch, seq_len, dim = query.shape
    out = torch.zeros((batch, seq_len, dim))
    
    # Redundant host-to-device synchronization
    q = query.cpu().cuda()
    k = key.cpu().cuda()
    v = value.cpu().cuda()
    
    # Cubic Loop scalar dot-products
    for b in range(batch):
        for i in range(seq_len):
            for j in range(seq_len):
                score = 0.0
                for d in range(dim):
                    score += q[b, i, d] * k[b, j, d]
                score = score / (dim ** 0.5)
                # Unvectorized accumulation
                for d in range(dim):
                    out[b, i, d] += score * v[b, j, d]
    return out`;

interface ASTCompilerProps {
  onOptimizationComplete?: (metrics: CodeOptimizationResult["metrics"]) => void;
  externalTrigger?: number;
  externalResult?: CodeOptimizationResult | null;
  isExternalCompiling?: boolean;
}

export default function ASTCompiler({
  onOptimizationComplete,
  externalTrigger,
  externalResult,
  isExternalCompiling,
}: ASTCompilerProps) {
  const [sourceCode, setSourceCode] = useState(INITIAL_INEFFICIENT_CODE);
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<CodeOptimizationResult | null>(null);

  // Sync externalResult from demo if provided
  useEffect(() => {
    if (externalResult) {
      setResult(externalResult);
    }
  }, [externalResult]);

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const data = await executeTriEngineOptimization(sourceCode);
      setResult(data);
      if (onOptimizationComplete) {
        onOptimizationComplete(data.metrics);
      }
    } catch (err) {
      console.error("Compilation error:", err);
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    if (externalTrigger && externalTrigger > 0) {
      handleCompile();
    }
  }, [externalTrigger]);

  const currentlyCompiling = isCompiling || isExternalCompiling;

  return (
    <div className="terminal-box rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-cyber-700 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-lunar-cyan" />
          <h2 className="text-base font-bold text-white tracking-wide">
            NEURO-SYMBOLIC AST GREEN COMPILER
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-lunar-cyan/10 text-lunar-cyan border border-lunar-cyan/30">
            Tri-Engine: Gemini + Nebius + HF
          </span>
        </div>

        <button
          onClick={handleCompile}
          disabled={currentlyCompiling}
          className="flex items-center gap-2 px-4 py-1.5 rounded bg-lunar-cyan hover:bg-cyan-400 text-cyber-950 font-bold text-xs tracking-wider transition-colors disabled:opacity-50"
        >
          {currentlyCompiling ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              SYNTHESIZING KERNEL...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              RUN AST COMPILATION
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400 font-mono px-1">
            <span>UNOPTIMIZED INPUT [PyTorch Python]</span>
            <span className="text-red-400">O(n^3) Bottlenecks</span>
          </div>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            rows={14}
            className="w-full bg-cyber-900 border border-cyber-700 rounded p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-lunar-cyan"
            spellCheck={false}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400 font-mono px-1">
            <span>VECTORIZED GREEN KERNEL [Target: H100 FP8 TensorCore]</span>
            <span className="text-emerald-400">
              {result ? `Engine: ${result.engine}` : "Awaiting AST Run"}
            </span>
          </div>
          <textarea
            readOnly
            value={result ? result.optimizedCode : "# Optimized output will materialize here after Tri-Engine synthesis..."}
            rows={14}
            className="w-full bg-cyber-900/90 border border-cyber-700 rounded p-3 text-xs font-mono text-emerald-300 focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {result && (
        <div className="pt-2 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Cpu className="w-3.5 h-3.5 text-lunar-cyan" />
                <span>FLOPs Reduction</span>
              </div>
              <div className="text-lg font-bold text-lunar-cyan mt-1">
                -{result.metrics.flopsReductionPercent}%
              </div>
            </div>

            <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Zap className="w-3.5 h-3.5 text-lunar-gold" />
                <span>Energy Saved</span>
              </div>
              <div className="text-lg font-bold text-lunar-gold mt-1">
                {(result.metrics.energySavedJoules / 1000).toFixed(1)} kJ
              </div>
            </div>

            <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Avoided Carbon</span>
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {Number(result.metrics.carbonAvoidedGrams).toFixed(1)} gCO₂
              </div>
            </div>

            <div className="p-3 bg-cyber-900 border border-cyber-700 rounded">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Water Cool Saved</span>
              </div>
              <div className="text-lg font-bold text-blue-400 mt-1">
                {Number(result.metrics.waterSavedMl).toFixed(1)} mL
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-cyber-900/60 border border-cyber-700 rounded text-xs space-y-1">
            <span className="font-bold text-gray-300">AST Diagnostics & Proof of Savings:</span>
            {result.diagnostics.map((diag, idx) => (
              <div key={idx} className="text-gray-400 flex items-center gap-1.5">
                <span className="text-lunar-cyan">▸</span> {diag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
