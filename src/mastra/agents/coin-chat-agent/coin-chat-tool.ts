import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from 'axios';

interface JupiterTokenData {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  decimals: number;
  twitter?: string;
  website?: string;
  dev?: string;
  circSupply: number;
  totalSupply: number;
  tokenProgram: string;
  launchpad?: string;
  metaLaunchpad?: string;
  partnerConfig?: string;
  firstPool?: {
    id: string;
    createdAt: string;
  };
  holderCount: number;
  audit?: {
    isSus?: boolean;
    mintAuthorityDisabled: boolean;
    freezeAuthorityDisabled: boolean;
    topHoldersPercentage: number;
    devMigrations?: number;
    devBalancePercentage?: number;
  };
  organicScore: number;
  organicScoreLabel: string;
  tags: string[];
  graduatedPool?: string;
  graduatedAt?: string;
  fdv: number;
  mcap: number;
  usdPrice: number;
  priceBlockId: number;
  liquidity: number;
  stats5m?: {
    priceChange?: number;
    holderChange?: number;
    liquidityChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    buyOrganicVolume?: number;
    sellOrganicVolume?: number;
    numBuys?: number;
    numSells?: number;
    numTraders?: number;
    numNetBuyers?: number;
    volumeChange?: number;
  };
  stats1h?: {
    priceChange?: number;
    holderChange?: number;
    liquidityChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    buyOrganicVolume?: number;
    sellOrganicVolume?: number;
    numBuys?: number;
    numSells?: number;
    numTraders?: number;
    numNetBuyers?: number;
    volumeChange?: number;
  };
  stats6h?: {
    priceChange?: number;
    holderChange?: number;
    liquidityChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    buyOrganicVolume?: number;
    sellOrganicVolume?: number;
    numBuys?: number;
    numSells?: number;
    numTraders?: number;
    numNetBuyers?: number;
  };
  stats24h?: {
    priceChange?: number;
    holderChange?: number;
    liquidityChange?: number;
    buyVolume?: number;
    sellVolume?: number;
    buyOrganicVolume?: number;
    sellOrganicVolume?: number;
    numBuys?: number;
    numSells?: number;
    numTraders?: number;
    numNetBuyers?: number;
  };
  bondingCurve?: number;
  updatedAt: string;
}

interface CoinAnalysis {
  mint: string;
  name: string;
  symbol: string;
  score: number;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  analysis: string;
  risk_level: 'low' | 'medium' | 'high';
  key_factors: string[];
}

export const coinAnalysisTool = createTool({
  id: "analyze-coin",
  description: "Analyze a specific coin by mint address and provide potential assessment",
  inputSchema: z.object({
    mintAddress: z.string().describe("Solana token mint address to analyze"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    analysis: z.object({
      mint: z.string(),
      name: z.string(),
      symbol: z.string(),
      score: z.number(),
      sentiment: z.enum(['bullish', 'neutral', 'bearish']),
      analysis: z.string(),
      risk_level: z.enum(['low', 'medium', 'high']),
      key_factors: z.array(z.string()),
      raw_data: z.any().optional(),
    }).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const analysis = await analyzeCoin(context.mintAddress);
      return {
        success: true,
        analysis,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze coin',
      };
    }
  },
});

export const bestCoinsTool = createTool({
  id: "get-best-coins",
  description: "Get the best performing coins from the past 30 minutes based on various metrics",
  inputSchema: z.object({
    limit: z.number().optional().default(5).describe("Number of top coins to return (default: 5)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    coins: z.array(z.object({
      mint: z.string(),
      name: z.string(),
      symbol: z.string(),
      score: z.number(),
      sentiment: z.enum(['bullish', 'neutral', 'bearish']),
      key_factors: z.array(z.string()),
      price_change_24h: z.number().optional(),
      volume: z.number().optional(),
    })).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const bestCoins = await getBestCoins(context.limit || 5);
      return {
        success: true,
        coins: bestCoins,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get best coins',
      };
    }
  },
});

export const coinChatTool = createTool({
  id: "coin-chat",
  description: "Get detailed information about a coin for conversational purposes",
  inputSchema: z.object({
    mintAddress: z.string().describe("Solana token mint address"),
    question: z.string().optional().describe("Specific question about the token"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    coin_info: z.object({
      basic_info: z.object({
        name: z.string(),
        symbol: z.string(),
        mint: z.string(),
        verified: z.boolean(),
      }),
      social_presence: z.object({
        website: z.string().optional(),
        twitter: z.string().optional(),
        telegram: z.string().optional(),
        discord: z.string().optional(),
      }),
      technical_data: z.object({
        decimals: z.number(),
        freeze_authority: z.string().nullable(),
        mint_authority: z.string().nullable(),
        tags: z.array(z.string()).optional(),
      }),
      market_data: z.object({
        daily_volume: z.number().optional(),
        market_cap: z.number().optional(),
        liquidity: z.number().optional(),
        price_change_24h: z.number().optional(),
      }),
      description: z.string().optional(),
    }).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const coinInfo = await getCoinInfo(context.mintAddress);
      return {
        success: true,
        coin_info: coinInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get coin information',
      };
    }
  },
});

const analyzeCoin = async (mintAddress: string): Promise<CoinAnalysis> => {
  const apiUrl = `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(mintAddress)}`;
  
  const response = await axios.get(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CoinChatAgent/1.0'
    }
  });

  if (!response.data || response.data.length === 0) {
    throw new Error(`Token not found for mint address: ${mintAddress}`);
  }

  const token = response.data[0] as JupiterTokenData;
  
  // Calculate coin potential score (0-100)
  let score = 0;
  const keyFactors: string[] = [];
  
  // Organic score (20 points)
  if (token.organicScore > 75) {
    score += 20;
    keyFactors.push(`✅ High organic score (${token.organicScoreLabel})`);
  } else if (token.organicScore > 50) {
    score += 15;
    keyFactors.push(`🟢 Good organic score (${token.organicScoreLabel})`);
  } else if (token.organicScore > 25) {
    score += 10;
    keyFactors.push(`🟡 Moderate organic score (${token.organicScoreLabel})`);
  } else {
    score += 5;
    keyFactors.push(`🔴 Low organic score (${token.organicScoreLabel})`);
  }
  
  // Social media presence (15 points)
  let socialScore = 0;
  if (token.website) socialScore += 7;
  if (token.twitter) socialScore += 8;
  score += socialScore;
  
  if (socialScore >= 12) {
    keyFactors.push("🌐 Strong social presence");
  } else if (socialScore >= 6) {
    keyFactors.push("🔗 Moderate social presence");
  } else {
    keyFactors.push("📱 Limited social presence");
  }
  
  // Trading volume (20 points) - using stats24h data
  if (token.stats24h?.buyVolume || token.stats24h?.sellVolume) {
    const totalVolume = (token.stats24h.buyVolume || 0) + (token.stats24h.sellVolume || 0);
    if (totalVolume > 100000) {
      score += 20;
      keyFactors.push("📊 High trading volume");
    } else if (totalVolume > 10000) {
      score += 15;
      keyFactors.push("📊 Good trading volume");
    } else if (totalVolume > 1000) {
      score += 10;
      keyFactors.push("📊 Moderate trading volume");
    } else {
      score += 5;
      keyFactors.push("📊 Low trading volume");
    }
  } else {
    keyFactors.push("📊 Volume data unavailable");
  }
  
  // Holder count bonus (5 points) - New metric from recent endpoint
  if (token.holderCount) {
    if (token.holderCount > 100) {
      score += 5;
      keyFactors.push(`👥 High holder count (${token.holderCount})`);
    } else if (token.holderCount > 50) {
      score += 3;
      keyFactors.push(`👥 Good holder count (${token.holderCount})`);
    } else if (token.holderCount > 10) {
      score += 2;
      keyFactors.push(`👥 Moderate holder count (${token.holderCount})`);
    } else {
      keyFactors.push(`👥 Low holder count (${token.holderCount})`);
    }
  }
  
  // Token authorities (15 points)
  let authorityScore = 0;
  if (token.audit?.mintAuthorityDisabled) {
    authorityScore += 8;
    keyFactors.push("🔒 Mint authority disabled");
  } else {
    keyFactors.push("⚠️ Mint authority present");
  }
  
  if (token.audit?.freezeAuthorityDisabled) {
    authorityScore += 7;
    keyFactors.push("🔓 Freeze authority disabled");
  } else {
    keyFactors.push("⚠️ Freeze authority present");
  }
  
  // Suspicious token penalty
  if (token.audit?.isSus) {
    score -= 10;
    keyFactors.push("🚨 Marked as suspicious");
  }
  
  score += authorityScore;
  
  // Market cap (10 points)
  if (token.mcap) {
    if (token.mcap > 10000000) {
      score += 8;
      keyFactors.push("💰 Large market cap");
    } else if (token.mcap > 1000000) {
      score += 10;
      keyFactors.push("💰 Good market cap potential");
    } else if (token.mcap > 100000) {
      score += 7;
      keyFactors.push("💰 Small market cap");
    } else {
      score += 5;
      keyFactors.push("💰 Micro market cap");
    }
  }
  
  // Liquidity (10 points)
  if (token.liquidity) {
    if (token.liquidity > 500000) {
      score += 10;
      keyFactors.push("🌊 High liquidity");
    } else if (token.liquidity > 100000) {
      score += 8;
      keyFactors.push("🌊 Good liquidity");
    } else if (token.liquidity > 10000) {
      score += 5;
      keyFactors.push("🌊 Low liquidity");
    } else {
      keyFactors.push("🌊 Very low liquidity");
    }
  }
  
  // Price performance (10 points)
  if (token.stats24h?.priceChange !== undefined) {
    if (token.stats24h.priceChange > 20) {
      score += 10;
      keyFactors.push("🚀 Strong 24h performance");
    } else if (token.stats24h.priceChange > 5) {
      score += 8;
      keyFactors.push("📈 Positive 24h performance");
    } else if (token.stats24h.priceChange > -5) {
      score += 5;
      keyFactors.push("📊 Stable 24h performance");
    } else {
      score += 2;
      keyFactors.push("📉 Negative 24h performance");
    }
  }
  
  // Determine sentiment and risk level
  let sentiment: 'bullish' | 'neutral' | 'bearish';
  let riskLevel: 'low' | 'medium' | 'high';
  
  if (score >= 80) {
    sentiment = 'bullish';
    riskLevel = 'low';
  } else if (score >= 60) {
    sentiment = 'bullish';
    riskLevel = 'medium';
  } else if (score >= 40) {
    sentiment = 'neutral';
    riskLevel = 'medium';
  } else if (score >= 20) {
    sentiment = 'bearish';
    riskLevel = 'high';
  } else {
    sentiment = 'bearish';
    riskLevel = 'high';
  }
  
  const analysis = generateAnalysisText(token, score, sentiment, riskLevel);
  
  return {
    mint: token.id,
    name: token.name,
    symbol: token.symbol,
    score,
    sentiment,
    analysis,
    risk_level: riskLevel,
    key_factors: keyFactors,
  };
};

const getBestCoins = async (limit: number) => {
  // Get recent tokens and analyze them
  const apiUrl = `https://lite-api.jup.ag/tokens/v2/recent`;
  
  const response = await axios.get(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CoinChatAgent/1.0'
    }
  });

  if (!response.data) {
    throw new Error('Failed to fetch token data');
  }

  const tokens = response.data as JupiterTokenData[];
  const analyzedCoins = [];

  for (const token of tokens.slice(0, 20)) { // Analyze top 20 to find best
    try {
      const analysis = await analyzeCoin(token.id);
      const totalVolume = (token.stats24h?.buyVolume || 0) + (token.stats24h?.sellVolume || 0);
      analyzedCoins.push({
        mint: token.id,
        name: token.name,
        symbol: token.symbol,
        score: analysis.score,
        sentiment: analysis.sentiment,
        key_factors: analysis.key_factors.slice(0, 3), // Top 3 factors
        price_change_24h: token.stats24h?.priceChange,
        volume: totalVolume,
      });
    } catch (error) {
      // Skip tokens that fail analysis
      continue;
    }
  }

  // Sort by score and return top coins
  return analyzedCoins
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

const getCoinInfo = async (mintAddress: string) => {
  const apiUrl = `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(mintAddress)}`;
  
  const response = await axios.get(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'CoinChatAgent/1.0'
    }
  });

  if (!response.data || response.data.length === 0) {
    throw new Error(`Token not found for mint address: ${mintAddress}`);
  }

  const token = response.data[0] as JupiterTokenData;
  
  return {
    basic_info: {
      name: token.name,
      symbol: token.symbol,
      mint: token.id,
      verified: token.organicScoreLabel !== 'low', // Use organic score as verification proxy
    },
    social_presence: {
      website: token.website,
      twitter: token.twitter,
      telegram: undefined, // Not available in new API structure
      discord: undefined, // Not available in new API structure
    },
    technical_data: {
      decimals: token.decimals,
      freeze_authority: token.audit?.freezeAuthorityDisabled ? null : 'present',
      mint_authority: token.audit?.mintAuthorityDisabled ? null : 'present',
      tags: token.tags,
    },
    market_data: {
      daily_volume: (token.stats24h?.buyVolume || 0) + (token.stats24h?.sellVolume || 0),
      market_cap: token.mcap,
      liquidity: token.liquidity,
      price_change_24h: token.stats24h?.priceChange,
    },
    description: undefined, // Not available in new API structure
  };
};

const generateAnalysisText = (
  token: JupiterTokenData, 
  score: number, 
  sentiment: string, 
  riskLevel: string
): string => {
  const parts = [
    `${token.name} ($${token.symbol}) analysis:`,
    `Overall Score: ${score}/100 (${sentiment.toUpperCase()})`,
    `Risk Level: ${riskLevel.toUpperCase()}`,
  ];

  if (token.organicScoreLabel !== 'low') {
    parts.push(`✅ Good organic score (${token.organicScoreLabel}) adds credibility.`);
  } else {
    parts.push(`⚠️ Low organic score (${token.organicScoreLabel}) - exercise caution.`);
  }

  const totalVolume = (token.stats24h?.buyVolume || 0) + (token.stats24h?.sellVolume || 0);
  if (totalVolume > 10000) {
    parts.push(`📊 Good trading activity with $${totalVolume.toLocaleString()} daily volume.`);
  }

  if (token.audit?.mintAuthorityDisabled && token.audit?.freezeAuthorityDisabled) {
    parts.push("🔒 Both mint and freeze authorities are disabled - good tokenomics.");
  } else if (token.audit?.mintAuthorityDisabled) {
    parts.push("🔒 Mint authority disabled but freeze authority present.");
  }

  const socialCount = [token.website, token.twitter].filter(v => v).length;
  if (socialCount >= 2) {
    parts.push("🌐 Strong social media presence across multiple platforms.");
  } else if (socialCount >= 1) {
    parts.push("🔗 Has some social media presence.");
  }

  return parts.join(" ");
};
