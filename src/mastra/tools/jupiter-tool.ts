import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import axios, { AxiosResponse } from 'axios';

// Jupiter API response interface based on the documentation
interface JupiterTokenData {
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
}

interface JupiterApiResponse {
  data: JupiterTokenData[];
}

export const jupiterTokenTool = createTool({
  id: 'jupiter_token_search',
  description: 'Search for token information using Jupiter API with a Solana token mint address',
  inputSchema: z.object({
    tokenMintAddress: z.string().describe('The Solana token mint address to search for'),
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
    })).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const apiUrl = `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(context.tokenMintAddress)}`;
      
      const response: AxiosResponse<JupiterApiResponse> = await axios.get(apiUrl, {
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
          }))
        };
      } else {
        return {
          success: false,
          error: 'No token data found for the provided mint address',
        };
      }
      
    } catch (error) {
      console.error('Error fetching token data from Jupiter API:', error);
      return {
        success: false,
        error: 'Failed to fetch token data from Jupiter API',
      };
    }
  },
});
