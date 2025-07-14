import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import axios, { AxiosResponse } from 'axios';

// Jupiter API response interface for recent tokens
interface JupiterRecentTokenData {
  mint: string;
  symbol: string;
  name: string;
  image?: string;
  decimals: number;
  coingeckoId?: string;
  description?: string;
  extensions?: {
    coingeckoId?: string;
    description?: string;
    discord?: string;
    telegram?: string;
    twitter?: string;
    website?: string;
  };
  tags?: string[];
  chainId: number;
  address: string;
  logoURI?: string;
  verified?: boolean;
  daily_volume?: number;
  freeze_authority?: string | null;
  mint_authority?: string | null;
  market_cap?: number;
  liquidity?: number;
  price_change_24h?: number;
  created_at?: string;
}

interface JupiterRecentApiResponse {
  data: JupiterRecentTokenData[];
}

export const jupiterRecentTokensTool = createTool({
  id: 'jupiter_recent_tokens',
  description: 'Fetch recent tokens from Jupiter API for analysis and discovery',
  inputSchema: z.object({
    limit: z.number().optional().default(50).describe('The maximum number of tokens to fetch (default: 50)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.array(z.object({
      mint: z.string(),
      symbol: z.string(),
      name: z.string(),
      image: z.string().optional(),
      decimals: z.number(),
      description: z.string().optional(),
      extensions: z.object({
        website: z.string().optional(),
        twitter: z.string().optional(),
        telegram: z.string().optional(),
        discord: z.string().optional(),
        description: z.string().optional(),
      }).optional(),
      tags: z.array(z.string()).optional(),
      verified: z.boolean().optional(),
      daily_volume: z.number().optional(),
      freeze_authority: z.string().nullable().optional(),
      mint_authority: z.string().nullable().optional(),
      market_cap: z.number().optional(),
      liquidity: z.number().optional(),
      price_change_24h: z.number().optional(),
      created_at: z.string().optional(),
    })).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      // Jupiter API doesn't have a direct "recent tokens" endpoint, so we'll use the token list
      // and simulate recent tokens by fetching a broad search and limiting results
      const apiUrl = `https://lite-api.jup.ag/tokens/v2/search?limit=${context.limit || 50}`;
      
      const response: AxiosResponse<JupiterRecentApiResponse> = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SolHypeBot/1.0'
        }
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return {
          success: true,
          data: response.data.data.map(token => ({
            mint: token.mint,
            symbol: token.symbol,
            name: token.name,
            image: token.image,
            decimals: token.decimals,
            description: token.description || token.extensions?.description,
            extensions: token.extensions ? {
              website: token.extensions.website,
              twitter: token.extensions.twitter,
              telegram: token.extensions.telegram,
              discord: token.extensions.discord,
              description: token.extensions.description,
            } : undefined,
            tags: token.tags,
            verified: token.verified,
            daily_volume: token.daily_volume,
            freeze_authority: token.freeze_authority,
            mint_authority: token.mint_authority,
            market_cap: token.market_cap,
            liquidity: token.liquidity,
            price_change_24h: token.price_change_24h,
            created_at: token.created_at,
          }))
        };
      } else {
        return {
          success: false,
          error: 'No recent token data found',
        };
      }
      
    } catch (error) {
      console.error('Error fetching recent tokens from Jupiter API:', error);
      return {
        success: false,
        error: 'Failed to fetch recent tokens from Jupiter API',
      };
    }
  },
});
