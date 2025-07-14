import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import * as fs from 'fs/promises';
import * as path from 'path';

// Analysis result interface
interface TokenAnalysisResult {
  mint: string;
  symbol: string;
  name: string;
  score: number;
  sentiment: string;
  analysis_reason: string;
  market_cap?: number;
  daily_volume?: number;
  price_change_24h?: number;
  liquidity?: number;
  extensions?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  analyzed_at: string;
  rank: number;
}

interface AnalysisHistory {
  last_analysis: string;
  best_token: TokenAnalysisResult;
  previous_analyses: TokenAnalysisResult[];
}

const ANALYSIS_FILE_PATH = path.join(process.cwd(), 'data', 'recent_analysis.json');

export const fileStorageTool = createTool({
  id: 'file_storage_analysis',
  description: 'Save and load token analysis results from file storage',
  inputSchema: z.object({
    action: z.enum(['save', 'load']).describe('Action to perform: save or load'),
    analysisResult: z.object({
      mint: z.string(),
      symbol: z.string(),
      name: z.string(),
      score: z.number(),
      sentiment: z.string(),
      analysis_reason: z.string(),
      market_cap: z.number().optional(),
      daily_volume: z.number().optional(),
      price_change_24h: z.number().optional(),
      liquidity: z.number().optional(),
      extensions: z.object({
        website: z.string().optional(),
        twitter: z.string().optional(),
        telegram: z.string().optional(),
        discord: z.string().optional(),
      }).optional(),
      rank: z.number(),
    }).optional().describe('Analysis result to save (required for save action)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      last_analysis: z.string().optional(),
      best_token: z.object({
        mint: z.string(),
        symbol: z.string(),
        name: z.string(),
        score: z.number(),
        sentiment: z.string(),
        analysis_reason: z.string(),
        market_cap: z.number().optional(),
        daily_volume: z.number().optional(),
        price_change_24h: z.number().optional(),
        liquidity: z.number().optional(),
        extensions: z.object({
          website: z.string().optional(),
          twitter: z.string().optional(),
          telegram: z.string().optional(),
          discord: z.string().optional(),
        }).optional(),
        analyzed_at: z.string(),
        rank: z.number(),
      }).optional(),
      previous_analyses: z.array(z.any()).optional(),
      is_different_token: z.boolean().optional(),
    }).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(ANALYSIS_FILE_PATH);
      await fs.mkdir(dataDir, { recursive: true });

      if (context.action === 'load') {
        try {
          const fileContent = await fs.readFile(ANALYSIS_FILE_PATH, 'utf-8');
          const analysisHistory: AnalysisHistory = JSON.parse(fileContent);
          
          return {
            success: true,
            data: {
              last_analysis: analysisHistory.last_analysis,
              best_token: analysisHistory.best_token,
              previous_analyses: analysisHistory.previous_analyses,
            },
          };
        } catch (error) {
          // File doesn't exist or is corrupted, return empty state
          return {
            success: true,
            data: {
              last_analysis: undefined,
              best_token: undefined,
              previous_analyses: [],
            },
          };
        }
      } else if (context.action === 'save') {
        if (!context.analysisResult) {
          return {
            success: false,
            error: 'Analysis result is required for save action',
          };
        }

        // Load existing data
        let existingData: AnalysisHistory;
        try {
          const fileContent = await fs.readFile(ANALYSIS_FILE_PATH, 'utf-8');
          existingData = JSON.parse(fileContent);
        } catch (error) {
          // File doesn't exist, create new structure
          existingData = {
            last_analysis: '',
            best_token: {} as TokenAnalysisResult,
            previous_analyses: [],
          };
        }

        // Check if this is a different token
        const isDifferentToken = existingData.best_token?.mint !== context.analysisResult.mint;

        // Create new analysis result
        const newAnalysisResult: TokenAnalysisResult = {
          ...context.analysisResult,
          analyzed_at: new Date().toISOString(),
        };

        // Update history
        if (isDifferentToken && existingData.best_token?.mint) {
          // Add previous best token to history
          existingData.previous_analyses.unshift(existingData.best_token);
          
          // Keep only last 20 analyses
          existingData.previous_analyses = existingData.previous_analyses.slice(0, 20);
        }

        // Update current best token and timestamp
        existingData.best_token = newAnalysisResult;
        existingData.last_analysis = new Date().toISOString();

        // Save to file
        await fs.writeFile(ANALYSIS_FILE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');

        return {
          success: true,
          data: {
            last_analysis: existingData.last_analysis,
            best_token: existingData.best_token,
            previous_analyses: existingData.previous_analyses,
            is_different_token: isDifferentToken,
          },
        };
      }

      return {
        success: false,
        error: 'Invalid action specified',
      };
    } catch (error) {
      console.error('Error in file storage operation:', error);
      return {
        success: false,
        error: 'Failed to perform file storage operation',
      };
    }
  },
});
