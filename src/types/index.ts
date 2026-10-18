export type NodeDomain = 'terrestrial' | 'lunar';
export type NodeStatus = 'nominal' | 'carbon_spike' | 'cooling_alert' | 'lunar_active';
export type RoutingPolicy = 'greedy_latency' | 'carbon_terrestrial' | 'cislunar_zero_carbon';

export interface ComputeNode {
  id: string;
  name: string;
  domain: NodeDomain;
  region: string;
  lat: number;
  lng: number;
  pue: number;
  carbonIntensity: number; // gCO2/kWh
  wue: number; // Liters/kWh
  tempCelsius: number;
  gpuUtil: number; // percentage 0-100
  activeTFlops: number;
  cooling: string;
  status: NodeStatus;
  latencyMs: number;
  workloadState: 'IDLE' | 'PROCESSING' | 'OFFLOADING' | 'RECEIVING';
  solarFluxWm2?: number;
}

export interface ASTBottleneck {
  line: number;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  issue: string;
  fix: string;
}

export interface ASTWorkloadSample {
  id: string;
  title: string;
  category: string;
  description: string;
  rawPythonCode: string;
  optimizedPythonCode: string;
  baselineFlops: number;
  optimizedFlops: number;
  flopsReductionPct: number;
  energySavedJoules: number;
  energySavedKwh: number;
  carbonAvoidedGrams: number;
  waterSavedLiters: number;
  adaCreditsCalculated: number;
  bottlenecks: ASTBottleneck[];
  geminiExplanation: string;
}

export interface CompilationResult {
  code: string;
  isAiGenerated: boolean;
  model: string;
  summary: string;
  metrics: {
    baselineFlops: number;
    optimizedFlops: number;
    flopsReductionPct: number;
    energySavedJoules: number;
    energySavedKwh: number;
    carbonAvoidedGrams: number;
    waterSavedLiters: number;
    adaCreditsCalculated: number;
  };
  bottlenecks: ASTBottleneck[];
  theoreticalSpeedup: string;
  hardwareBenefit: string;
}

export interface FemaleSTEMResearcher {
  id: string;
  name: string;
  title: string;
  institution: string;
  avatar: string;
  category: string;
  projectSummary: string;
  targetAda: number;
  awardedAda: number;
  solanaWallet: string;
  activeBadge: string;
  impactMetric: string;
  publicationCite: string;
}

export interface SolanaTransactionRecord {
  signature: string;
  slot: number;
  timestamp: string;
  researcherId: string;
  researcherName: string;
  adaAmount: number;
  carbonSavedGrams: number;
  waterSavedLiters: number;
  programId: string;
  status: 'confirmed' | 'finalized';
  blockhash: string;
  memo: string;
}

export interface PresageVitals {
  heartRate: number; // BPM
  breathingRate: number; // RPM
  cognitiveFatigue: number; // 0-100%
  focusScore: number; // 0-100%
  stressState: 'Optimal Flow' | 'Moderate Strain' | 'Rest Advised';
  pulseWave: number[];
  isCameraActive: boolean;
  eyeBlinkRate: number; // blinks/min
  ergonomicPosture: 'Ergonomic' | 'Slouched' | 'Forward Head';
}

export interface TigerDataTelemetryPoint {
  timestamp: string;
  usEast1Carbon: number;
  usWest2Carbon: number;
  euNorth1Carbon: number;
  lunarCarbon: number;
  cislunarThroughputGbps: number;
  queryExecutionMs: number;
  totalSavedCo2Kg: number;
}
