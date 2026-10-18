import { ComputeNode, ASTWorkloadSample, FemaleSTEMResearcher, SolanaTransactionRecord } from '@/types';

export const INITIAL_NODES: ComputeNode[] = [
  {
    id: 'us-east-1',
    name: 'Northern Virginia Grid (UVA Region)',
    domain: 'terrestrial',
    region: 'US East (PJM Interconnection)',
    lat: 38.0336,
    lng: -78.5080,
    pue: 1.48,
    carbonIntensity: 428, // High fossil/gas peaking
    wue: 1.82, // Liters/kWh (heavy cooling tower evaporation)
    tempCelsius: 34.2,
    gpuUtil: 91,
    activeTFlops: 850000,
    cooling: 'Mechanical Evaporative Chiller',
    status: 'carbon_spike',
    latencyMs: 12,
    workloadState: 'PROCESSING',
    solarFluxWm2: 320,
  },
  {
    id: 'us-west-2',
    name: 'Oregon Columbia Basin',
    domain: 'terrestrial',
    region: 'US West (Bonneville Hydro)',
    lat: 45.7285,
    lng: -119.5516,
    pue: 1.18,
    carbonIntensity: 182,
    wue: 0.94,
    tempCelsius: 22.4,
    gpuUtil: 74,
    activeTFlops: 620000,
    cooling: 'Direct Evaporative + Hydro Assist',
    status: 'nominal',
    latencyMs: 44,
    workloadState: 'PROCESSING',
    solarFluxWm2: 410,
  },
  {
    id: 'eu-north-1',
    name: 'Stockholm Nordic Hydro & Wind',
    domain: 'terrestrial',
    region: 'Europe North (Vattenfall Grid)',
    lat: 59.3293,
    lng: 18.0686,
    pue: 1.12,
    carbonIntensity: 36,
    wue: 0.31,
    tempCelsius: 14.8,
    gpuUtil: 68,
    activeTFlops: 510000,
    cooling: 'Natural Ambient Free-Air',
    status: 'nominal',
    latencyMs: 98,
    workloadState: 'IDLE',
    solarFluxWm2: 180,
  },
  {
    id: 'ap-northeast-1',
    name: 'Tokyo Bay High-Density AI Cluster',
    domain: 'terrestrial',
    region: 'Asia Pacific (TEPCO Grid)',
    lat: 35.6762,
    lng: 139.6503,
    pue: 1.41,
    carbonIntensity: 448,
    wue: 1.68,
    tempCelsius: 28.6,
    gpuUtil: 84,
    activeTFlops: 740000,
    cooling: 'Closed-Loop Glycol Chillers',
    status: 'nominal',
    latencyMs: 142,
    workloadState: 'PROCESSING',
    solarFluxWm2: 390,
  },
  {
    id: 'sa-east-1',
    name: 'São Paulo Subtropical Array',
    domain: 'terrestrial',
    region: 'South America (CESP Clean Hydro)',
    lat: -23.5505,
    lng: -46.6333,
    pue: 1.52,
    carbonIntensity: 196,
    wue: 2.14,
    tempCelsius: 32.1,
    gpuUtil: 59,
    activeTFlops: 430000,
    cooling: 'Standard Evaporative Chiller',
    status: 'cooling_alert',
    latencyMs: 128,
    workloadState: 'IDLE',
    solarFluxWm2: 580,
  },
  {
    id: 'lunar-shackleton-1',
    name: 'Lunar Shackleton South Pole Array',
    domain: 'lunar',
    region: 'Shackleton Crater Rim (Peak of Eternal Light)',
    lat: -89.9000,
    lng: 0.0000,
    pue: 1.02,
    carbonIntensity: 0.0, // 100% solar + vacuum
    wue: 0.00, // Zero water required! Deep-space 20K radiation
    tempCelsius: -253.1, // Near absolute zero space sink
    gpuUtil: 32,
    activeTFlops: 1200000,
    cooling: 'Deep-Space 20K Radiative Sink (0.00 WUE)',
    status: 'lunar_active',
    latencyMs: 1280, // Optical speed of light cislunar lag (1.28s)
    workloadState: 'RECEIVING',
    solarFluxWm2: 1361, // Constant unfiltered solar radiation
  },
];

export const INITIAL_WORKLOADS: ASTWorkloadSample[] = [
  {
    id: 'workload-med-conv',
    title: 'Unvectorized Medical Image 3D Convolution',
    category: 'Healthcare & Oncology ML',
    description: 'Python nested for-loops processing UVA Health 3D MRI voxel tensors. Thrashing L2 GPU cache and synchronizing CPU-GPU memory on every voxel.',
    rawPythonCode: `# [INEFFICIENT BASELINE] 3D MRI Voxel Feature Extractor
import torch

def extract_features_naive(mri_volume, kernel):
    # mri_volume shape: [128, 128, 64] float32
    # Inefficient Python triply-nested loop bottleneck
    D, H, W = mri_volume.shape
    output = torch.zeros((D-2, H-2, W-2), dtype=torch.float32)
    
    # Critical AST Bottleneck: O(N^3) interpreter overhead
    for d in range(D - 2):
        for h in range(H - 2):
            for w in range(W - 2):
                # Unnecessary CPU-to-CUDA synchronizing stall
                patch = mri_volume[d:d+3, h:h+3, w:w+3].to("cuda")
                k_cuda = kernel.to("cuda")
                # Scalar accumulation on device
                val = torch.sum(patch * k_cuda)
                output[d, h, w] = val.cpu() # Host transfer in loop!
                
    return output`,
    optimizedPythonCode: `# [SELENE-GRID AST GREEN SYNTHESIS] Gemini 2.5 Flash Optimized
import torch
import torch.nn.functional as F

@torch.compile(mode="max-autotune")
def extract_features_vectorized(mri_volume: torch.Tensor, kernel: torch.Tensor) -> torch.Tensor:
    """
    AST Optimization Applied:
    1. Vectorized F.conv3d replacing O(D*H*W) nested Python interpreter loops.
    2. Zero host-device synchronization: Tensors pre-allocated in VRAM with pinned memory.
    3. FP8 / BFloat16 mixed-precision enabled: 76.4% memory bandwidth reduction.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 5D batch format: [Batch, Channel, Depth, Height, Width]
    x = mri_volume.unsqueeze(0).unsqueeze(0).to(device, dtype=torch.bfloat16, non_blocking=True)
    w = kernel.unsqueeze(0).unsqueeze(0).to(device, dtype=torch.bfloat16)
    
    with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
        out = F.conv3d(x, w, padding=0)
        
    return out.squeeze(0).squeeze(0)`,
    baselineFlops: 1840000000000, // 1.84 TFLOPs
    optimizedFlops: 420000000000,  // 0.42 TFLOPs
    flopsReductionPct: 77.17,
    energySavedJoules: 48200,
    energySavedKwh: 0.01339,
    carbonAvoidedGrams: 5.73,
    waterSavedLiters: 0.0244,
    adaCreditsCalculated: 19.42,
    bottlenecks: [
      {
        line: 11,
        type: 'Triple Nested Python Loop',
        severity: 'critical',
        issue: 'O(D*H*W) triple for-loop in pure Python interpreter causes 48x runtime overhead.',
        fix: 'Synthesize fused torch.nn.functional.conv3d tensor kernel with fused CUDA blocks.',
      },
      {
        line: 16,
        type: 'Host-Device Sync Stall',
        severity: 'critical',
        issue: 'patch.to("cuda") and val.cpu() force redundant PCIe bus roundtrips on every voxel.',
        fix: 'Pre-allocate full tensor on GPU with non_blocking=True and zero intra-loop transfers.',
      },
      {
        line: 8,
        type: 'Unquantized FP32 Precision',
        severity: 'warning',
        issue: 'Full 32-bit IEEE float arithmetic doubles memory footprint and cooling requirements.',
        fix: 'Cast to torch.bfloat16 with automatic mixed precision (AMP) context.',
      },
    ],
    geminiExplanation: 'Replaced O(N³) interpreted loop with native torch.conv3d CUDA kernel and bfloat16 autocasting. Eliminated 1,048,576 host-to-device PCIe sync stalls, slashing memory traffic by 77.2% and saving 48.2 kJ of electrical cooling power.',
  },
  {
    id: 'workload-grad-accum',
    title: 'Redundant Gradient Accumulation & Loss Stalling',
    category: 'Foundation Model Pretraining',
    description: 'Transformer pretraining loop calling synchronous loss.item() logging on every microstep, missing FlashAttention fusion, and triggering GPU pipeline bubbles.',
    rawPythonCode: `# [INEFFICIENT BASELINE] Distributed Transformer Step
import torch

def train_step_inefficient(model, optimizer, data_loader):
    model.train()
    total_loss = 0.0
    
    # Inefficient: Unfused unbatched gradient updates
    for step, (inputs, targets) in enumerate(data_loader):
        inputs, targets = inputs.cuda(), targets.cuda()
        
        # FP32 standard forward pass without autocast
        outputs = model(inputs)
        loss = torch.nn.functional.cross_entropy(outputs, targets)
        
        # Pipeline bubble: loss.item() forces full GPU pipeline synchronization
        current_loss = loss.item() 
        total_loss += current_loss
        
        loss.backward()
        
        # Sub-optimal: stepping optimizer every micro-batch instead of fused accumulation
        optimizer.step()
        optimizer.zero_grad() # Non-set_to_none memory overhead
        
    return total_loss / len(data_loader)`,
    optimizedPythonCode: `# [SELENE-GRID AST GREEN SYNTHESIS] Gemini 2.5 Flash Optimized
import torch
from torch.cuda.amp import autocast, GradScaler

@torch.compile(mode="reduce-overhead")
def train_step_optimized(model, optimizer, data_loader, accum_steps=8):
    """
    AST Optimization Applied:
    1. Scaled AMP BFloat16/FP8 mixed precision with GradScaler.
    2. Gradient accumulation with model.no_sync() to eliminate all-reduce chatter.
    3. Removed loss.item() barrier inside critical training loops.
    4. zero_grad(set_to_none=True) to eliminate VRAM memset overhead.
    """
    model.train()
    scaler = GradScaler()
    optimizer.zero_grad(set_to_none=True)
    accumulated_loss = torch.tensor(0.0, device='cuda')
    
    for step, (inputs, targets) in enumerate(data_loader):
        inputs = inputs.to('cuda', non_blocking=True)
        targets = targets.to('cuda', non_blocking=True)
        
        with autocast(dtype=torch.bfloat16):
            outputs = model(inputs)
            loss = torch.nn.functional.cross_entropy(outputs, targets) / accum_steps
            
        scaler.scale(loss).backward()
        accumulated_loss += loss.detach()
        
        if (step + 1) % accum_steps == 0:
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad(set_to_none=True)
            
    return accumulated_loss.item()`,
    baselineFlops: 4220000000000, // 4.22 TFLOPs
    optimizedFlops: 1630000000000,  // 1.63 TFLOPs
    flopsReductionPct: 61.37,
    energySavedJoules: 87400,
    energySavedKwh: 0.02428,
    carbonAvoidedGrams: 10.39,
    waterSavedLiters: 0.0442,
    adaCreditsCalculated: 35.21,
    bottlenecks: [
      {
        line: 16,
        type: 'Pipeline Sync Stall',
        severity: 'critical',
        issue: 'loss.item() forces a CPU synchronization barrier at every single micro-batch.',
        fix: 'Keep loss in tensor registers on device and only synchronize at the end of the epoch.',
      },
      {
        line: 22,
        type: 'Premature Gradient Stepping',
        severity: 'critical',
        issue: 'optimizer.step() called every micro-step increases CUDA kernel launch frequency by 8x.',
        fix: 'Implement gradient accumulation window of 8 micro-batches with set_to_none=True.',
      },
      {
        line: 12,
        type: 'Unfused Precision',
        severity: 'warning',
        issue: 'Unquantized FP32 forward pass requires twice the DRAM memory bandwidth.',
        fix: 'Wrap with torch.cuda.amp.autocast(dtype=torch.bfloat16) and torch.compile.',
      },
    ],
    geminiExplanation: 'Synthesized 8-step gradient accumulation with zero-memory grad reset (set_to_none=True) and bfloat16 AMP autocast. Eradicated synchronous device stalls, achieving a 61.4% FLOP reduction and 87.4 kJ energy saving.',
  },
  {
    id: 'workload-llm-embed',
    title: 'Unbatched LLM Embedding & Retrieval Loop',
    category: 'NLP & Semantic Search',
    description: 'Iterating over 10,000 clinical sentences one by one in a Python loop, sending each single token sequence to GPU independently without bucketing.',
    rawPythonCode: `# [INEFFICIENT BASELINE] Unbatched Vector Embeddings
import torch

def generate_embeddings_naive(model, sentence_list):
    embeddings = []
    
    # Inefficient: Single-item sequential GPU dispatch
    for sentence in sentence_list:
        # Tokenizing and shipping individual tensor
        tokens = [ord(c) for c in sentence[:64]]
        input_ids = torch.tensor(tokens, dtype=torch.long)
        
        # Synchronous individual forward pass
        input_ids = input_ids.unsqueeze(0).to("cuda")
        with torch.no_grad():
            output = model(input_ids)
            vector = output.last_hidden_state[:, 0, :].cpu()
            
        embeddings.append(vector)
        
    return torch.cat(embeddings, dim=0)`,
    optimizedPythonCode: `# [SELENE-GRID AST GREEN SYNTHESIS] Gemini 2.5 Flash Optimized
import torch

@torch.compile(mode="max-autotune")
def generate_embeddings_batched(model, sentence_list, batch_size=256):
    """
    AST Optimization Applied:
    1. Dynamic bucketed micro-batching (batch_size=256) replaces sequential dispatch.
    2. Pinned memory host-to-device streaming with non-blocking DMA transfers.
    3. Tensor core FP8 matrix multiply activation.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    all_vectors = []
    
    # Batch processing with pre-padded memory
    for i in range(0, len(sentence_list), batch_size):
        batch = sentence_list[i:i + batch_size]
        # Vectorized padding in pinned memory
        batch_tokens = torch.zeros((len(batch), 64), dtype=torch.long)
        for idx, s in enumerate(batch):
            seq = [ord(c) for c in s[:64]]
            batch_tokens[idx, :len(seq)] = torch.tensor(seq, dtype=torch.long)
            
        input_ids = batch_tokens.to(device, non_blocking=True)
        with torch.no_grad(), torch.autocast(device_type="cuda", dtype=torch.bfloat16):
            out = model(input_ids)
            vectors = out.last_hidden_state[:, 0, :].clone()
            
        all_vectors.append(vectors)
        
    return torch.cat(all_vectors, dim=0).cpu()`,
    baselineFlops: 2950000000000,
    optimizedFlops: 980000000000,
    flopsReductionPct: 66.78,
    energySavedJoules: 66700,
    energySavedKwh: 0.01853,
    carbonAvoidedGrams: 7.93,
    waterSavedLiters: 0.0337,
    adaCreditsCalculated: 26.85,
    bottlenecks: [
      {
        line: 8,
        type: 'Sequential Single-Item Dispatch',
        severity: 'critical',
        issue: 'Sequential single-sentence GPU calls waste 98% of Tensor Core compute capacity.',
        fix: 'Implement bucketing batch generator with batch_size=256 to saturate parallel SMs.',
      },
      {
        line: 16,
        type: 'Frequent PCIe Thrashing',
        severity: 'critical',
        issue: 'Transferring individual 1x768 embedding vectors back to CPU creates severe bus contention.',
        fix: 'Accumulate batch outputs in high-bandwidth VRAM and stream a single concatenated chunk.',
      },
      {
        line: 14,
        type: 'Missing Autocast Context',
        severity: 'warning',
        issue: 'Inference running at full FP32 consumes double the activation memory bandwidth.',
        fix: 'Enable torch.autocast(device_type="cuda", dtype=torch.bfloat16).',
      },
    ],
    geminiExplanation: 'Batch vectorization with batch size 256 and pinned memory streaming saturated Tensor Cores, eliminating 9,999 individual GPU launch roundtrips and trimming compute time by 66.8%.',
  },
];

export const FEMALE_STEM_RESEARCHERS: FemaleSTEMResearcher[] = [
  {
    id: 'res-maya-lin',
    name: 'Dr. Maya Lin',
    title: 'Assistant Professor of Biomedical AI',
    institution: 'UVA Health & Johns Hopkins Medicine',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    category: 'Maternal Healthcare & Clinical AI',
    projectSummary: 'Ultra-low-resource Transformer predicting neonatal sepsis and maternal hemorrhaging 4 hours prior to clinical shock in rural Virginia and Sub-Saharan clinics.',
    targetAda: 2500,
    awardedAda: 1842.8,
    solanaWallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    activeBadge: 'UVA Health Fellow',
    impactMetric: 'Saved 312 Neonatal ICU bed-days',
    publicationCite: 'Lancet Digital Health 2025 (Vol 7, e34-e49)',
  },
  {
    id: 'res-elena-rostova',
    name: 'Dr. Elena Rostova',
    title: 'Senior Astrobiology Research Fellow',
    institution: 'NASA Artemis Science Council / Caltech',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    category: 'Cislunar Life Support & Bio-Filtration',
    projectSummary: 'Machine learning models controlling closed-loop cyanobacteria bioreactors for oxygen synthesis and regolith water reclamation on lunar surface habitats.',
    targetAda: 3000,
    awardedAda: 2195.4,
    solanaWallet: '9vQeXW1oV5b9kF7uM2vN4xP8jL3qW6eR1tY5uI7oP9aB',
    activeBadge: 'Artemis IV Investigator',
    impactMetric: '99.4% H2O Recovery in Vacuum Tests',
    publicationCite: 'Nature Astronomy 2025 (doi:10.1038/s41550)',
  },
  {
    id: 'res-amina-patel',
    name: 'Dr. Amina Patel',
    title: 'Lead Research Scientist, Fairness in AI',
    institution: 'UVA School of Data Science / Stanford ML',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Algorithmic Equity & Oncology',
    projectSummary: 'Eliminating demographic representation bias in multimodal breast cancer MRI detection models for historically underrepresented female patient cohorts.',
    targetAda: 2000,
    awardedAda: 1680.0,
    solanaWallet: '4kR8tY2uI6oP1aB3cE5dG7hJ9kL2mN4vQ6wE8rT0yU2i',
    activeBadge: 'ML @ UVA AI Equity Chair',
    impactMetric: '42% Reduction in False Negative Skew',
    publicationCite: 'JAMA Oncology 2026 (In Press)',
  },
  {
    id: 'res-sarah-chen',
    name: 'Sarah Chen, M.S.',
    title: 'Ph.D. Candidate in Computational Geophysics',
    institution: 'MIT Earth, Atmospheric & Planetary Sciences',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    category: 'Climate Physics & Cryosphere AI',
    projectSummary: 'Physics-Informed Neural Networks (PINNs) simulating Thwaites Glacier meltwater hydro-fractures using high-resolution synthetic aperture radar (SAR) satellite feeds.',
    targetAda: 1800,
    awardedAda: 1340.5,
    solanaWallet: '2bC4dE6fH8jK0mP2rT4vX6zB8dF0hJ2lM4pQ6sU8wY0a',
    activeBadge: 'NSF Graduate Research Fellow',
    impactMetric: '14x Faster Cryosphere Inversion',
    publicationCite: 'Geophysical Research Letters 2025',
  },
  {
    id: 'res-kemi-adeyemi',
    name: 'Dr. Kemi Adeyemi',
    title: 'Principal Investigator in Genomic Pathology',
    institution: 'African Bio-Genomics Institute / Oxford',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    category: 'Edge Hematology AI',
    projectSummary: 'Decentralized vision transformer running on edge solar-powered microscope rigs to classify sickle cell morphology in underserved mobile clinic vans.',
    targetAda: 2200,
    awardedAda: 1910.2,
    solanaWallet: '5mN7pQ9rT1vX3zB5dF7hJ9lM1pQ3sU5wY7aC9eG1iK3m',
    activeBadge: 'Gates Global Health Awardee',
    impactMetric: '18,400 Rural Screenings Deployed',
    publicationCite: 'Nature Medicine 2025 (Vol 31, 89-98)',
  },
];

export const INITIAL_SOLANA_TXS: SolanaTransactionRecord[] = [
  {
    signature: '5K7m...8xL2eQp9f4kR8tY2uI6oP1aB3cE5dG7hJ9kL2mN4vQ6wE8rT0yU2i',
    slot: 289410291,
    timestamp: 'Just now',
    researcherId: 'res-maya-lin',
    researcherName: 'Dr. Maya Lin (UVA Health)',
    adaAmount: 142.8,
    carbonSavedGrams: 512.4,
    waterSavedLiters: 2.18,
    programId: 'ADA_LovELAcE_GrEEn_t0kEn_PR0T0C0L_v2',
    status: 'finalized',
    blockhash: '9vQeXW1oV5b9kF7uM2vN4xP8jL3qW6eR1tY5uI7oP9aB',
    memo: 'Workload: 3D MRI Conv AST synthesis energy offset',
  },
  {
    signature: '3vNx...4mK9aBc2dE6fH8jK0mP2rT4vX6zB8dF0hJ2lM4pQ6sU8wY0a1bC',
    slot: 289410180,
    timestamp: '4m ago',
    researcherId: 'res-elena-rostova',
    researcherName: 'Dr. Elena Rostova (NASA Artemis)',
    adaAmount: 215.0,
    carbonSavedGrams: 890.1,
    waterSavedLiters: 3.84,
    programId: 'ADA_LovELAcE_GrEEn_t0kEn_PR0T0C0L_v2',
    status: 'finalized',
    blockhash: '4kR8tY2uI6oP1aB3cE5dG7hJ9kL2mN4vQ6wE8rT0yU2i',
    memo: 'Workload: Lunar Shackleton cislunar laser offload batch #408',
  },
  {
    signature: '7pL2...9wE1xZ3vB5dF7hJ9lM1pQ3sU5wY7aC9eG1iK3m5oQ7sU9wY1aC',
    slot: 289410042,
    timestamp: '11m ago',
    researcherId: 'res-amina-patel',
    researcherName: 'Dr. Amina Patel (UVA SDS)',
    adaAmount: 98.4,
    carbonSavedGrams: 374.0,
    waterSavedLiters: 1.62,
    programId: 'ADA_LovELAcE_GrEEn_t0kEn_PR0T0C0L_v2',
    status: 'confirmed',
    blockhash: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    memo: 'Workload: LLM Embedding vectorizer batch optimization',
  },
];
