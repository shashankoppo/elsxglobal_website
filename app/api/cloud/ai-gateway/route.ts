export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

interface AIProvider {
  id: string;
  name: string;
  defaultModel: string;
  availableModels: string[];
  status: 'operational' | 'degraded' | 'maintenance';
  spend24h: number;
  rateLimitTpm: string;
  rateLimitRpm: string;
  cacheHitRate: number;
  p95LatencyMs: number;
}

interface CacheEntry {
  hash: string;
  promptPreview: string;
  responsePreview: string;
  model: string;
  tokensSaved: number;
  costSavedUsd: number;
  timestamp: string;
}

let providers: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'],
    status: 'operational',
    spend24h: 742.30,
    rateLimitTpm: '2,500,000 TPM',
    rateLimitRpm: '10,000 RPM',
    cacheHitRate: 51.4,
    p95LatencyMs: 420,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultModel: 'claude-3-5-sonnet',
    availableModels: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    status: 'operational',
    spend24h: 512.40,
    rateLimitTpm: '1,200,000 TPM',
    rateLimitRpm: '4,000 RPM',
    cacheHitRate: 46.8,
    p95LatencyMs: 580,
  },
  {
    id: 'google',
    name: 'Google Vertex AI',
    defaultModel: 'gemini-2.0-flash',
    availableModels: ['gemini-2.0-flash', 'gemini-1.5-pro'],
    status: 'operational',
    spend24h: 248.80,
    rateLimitTpm: '4,000,000 TPM',
    rateLimitRpm: '15,000 RPM',
    cacheHitRate: 42.1,
    p95LatencyMs: 290,
  },
  {
    id: 'groq',
    name: 'Groq LPU',
    defaultModel: 'llama-3.3-70b',
    availableModels: ['llama-3.3-70b', 'mixtral-8x7b-32768'],
    status: 'operational',
    spend24h: 184.20,
    rateLimitTpm: '10,000,000 TPM',
    rateLimitRpm: '30,000 RPM',
    cacheHitRate: 38.5,
    p95LatencyMs: 85,
  },
];

let semanticCache: CacheEntry[] = [
  {
    hash: 'h_8f3a9e',
    promptPreview: 'Translate customer invoice receipt to Hindi with GST calculation...',
    responsePreview: 'ग्राहक चालान रसीद (जीएसटी 18% सहित): कुल राशि ₹4,999...',
    model: 'gpt-4o',
    tokensSaved: 1240,
    costSavedUsd: 0.0372,
    timestamp: '2 min ago',
  },
  {
    hash: 'h_4b1c7d',
    promptPreview: 'Analyze server latency anomaly from Pune PoP edge node...',
    responsePreview: 'Telemetry correlation indicates temporary NIXI transit BGP flap...',
    model: 'claude-3-5-sonnet',
    tokensSaved: 2890,
    costSavedUsd: 0.0867,
    timestamp: '18 min ago',
  },
];

export async function GET() {
  try {
    const totalSpend = providers.reduce((sum, p) => sum + p.spend24h, 0);
    const avgCacheHit = providers.reduce((sum, p) => sum + p.cacheHitRate, 0) / providers.length;

    return NextResponse.json({
      success: true,
      stats: {
        activeModels: 15,
        cacheHitRate: `${avgCacheHit.toFixed(1)}%`,
        tokens24h: '148.4M',
        totalSpend24hUsd: totalSpend.toFixed(2),
        savingsUsd: (totalSpend * 0.58).toFixed(2),
        activeProviders: providers.filter(p => p.status === 'operational').length,
      },
      providers,
      cacheEntries: semanticCache,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prompt, model = 'gpt-4o', provider = 'openai', options, intent } = body;

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    if (action === 'test_prompt' || action === 'completion') {
      if (!prompt) {
        return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
      }

      // Check semantic cache simulation
      const promptHash = crypto.createHash('sha256').update(prompt.trim().toLowerCase()).digest('hex').slice(0, 8);
      const isCached = semanticCache.some(c => c.promptPreview.toLowerCase().includes(prompt.toLowerCase().slice(0, 15)));

      const estimatedTokens = Math.max(30, Math.ceil(prompt.length / 4) + 60);
      const costPerToken = 0.00003; // ~$0.03 / 1k tokens

      if (isCached) {
        return NextResponse.json({
          success: true,
          cached: true,
          cacheHitRate: '100% (Semantic Cache Hit)',
          latencyMs: 1.8,
          model,
          provider,
          tokensUsed: 0,
          tokensSaved: estimatedTokens,
          costUsd: 0,
          costSavedUsd: Number((estimatedTokens * costPerToken).toFixed(4)),
          response: `[VaultHost Semantic Cache Hit] ${prompt}\n\nAutomated analysis: Optimal edge response generated with 0ms origin wait time and 100% cost reduction.`,
        });
      }

      // Record fresh cache entry
      semanticCache.unshift({
        hash: `h_${promptHash}`,
        promptPreview: prompt.slice(0, 60) + (prompt.length > 60 ? '...' : ''),
        responsePreview: `Edge processed response for query: "${prompt.slice(0, 40)}"`,
        model,
        tokensSaved: estimatedTokens,
        costSavedUsd: Number((estimatedTokens * costPerToken).toFixed(4)),
        timestamp: 'Just now',
      });

      return NextResponse.json({
        success: true,
        cached: false,
        latencyMs: Math.floor(Math.random() * 150) + 80,
        model,
        provider,
        tokensUsed: estimatedTokens,
        tokensSaved: 0,
        costUsd: Number((estimatedTokens * costPerToken).toFixed(4)),
        costSavedUsd: 0,
        response: `VaultHost AI Gateway successfully proxied request to ${provider}/${model}.\nTelemetry: tokens=${estimatedTokens}, cache_indexed=true, pqc_attested=true.`,
      });
    }

    if (action === 'purge_cache') {
      semanticCache = [];
      return NextResponse.json({ success: true, message: 'Global AI semantic cache purged successfully.' });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
