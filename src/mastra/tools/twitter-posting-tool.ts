import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import * as crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import axios from 'axios';

// Twitter API configuration
const TWITTER_API_BASE_URL = 'https://api.twitter.com/2';

// OAuth configuration
const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY!,
    secret: process.env.TWITTER_CONSUMER_SECRET!,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string: string, key: string) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN!,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
};

export const twitterPostingTool = createTool({
  id: 'twitter_posting',
  description: 'Post tweets to Twitter using OAuth 1.0a authentication',
  inputSchema: z.object({
    tweetContent: z.string().max(280).describe('The tweet content to post (max 280 characters)'),
    tokenData: z.object({
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
    }).optional().describe('Token data to include in the tweet'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    tweetId: z.string().optional(),
    tweetUrl: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      // Validate required environment variables
      if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET || 
          !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
        return {
          success: false,
          error: 'Missing required Twitter API credentials',
        };
      }

      // Prepare tweet data
      const tweetData = {
        text: context.tweetContent,
      };

      // Create request data
      const requestData = {
        url: `${TWITTER_API_BASE_URL}/tweets`,
        method: 'POST',
        data: tweetData,
      };

      // Generate OAuth authorization header
      const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

      // Make the API request
      const response = await axios.post(
        requestData.url,
        requestData.data,
        {
          headers: {
            'Authorization': authHeader['Authorization'],
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.data) {
        const tweetId = response.data.data.id;
        const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;
        
        return {
          success: true,
          tweetId,
          tweetUrl,
        };
      } else {
        return {
          success: false,
          error: 'Unexpected response from Twitter API',
        };
      }
    } catch (error: any) {
      console.error('Error posting to Twitter:', error);
      
      let errorMessage = 'Failed to post tweet';
      
      if (error.response) {
        // Twitter API error
        errorMessage = `Twitter API error: ${error.response.status} - ${error.response.data?.title || error.response.data?.detail || 'Unknown error'}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error: Unable to reach Twitter API';
      } else {
        // Other error
        errorMessage = `Error: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

// Additional tool for creating optimized tweet content
export const tweetContentGeneratorTool = createTool({
  id: 'tweet_content_generator',
  description: 'Generate optimized tweet content for token analysis',
  inputSchema: z.object({
    tokenData: z.object({
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
      verified: z.boolean().optional(),
      rank: z.number(),
    }).describe('Token data to create tweet content for'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    tweetContent: z.string().optional(),
    characterCount: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenData } = context;
      
      // Generate tweet content based on token data
      let tweet = `🚀 $${tokenData.symbol} - ${tokenData.name}\n`;
      
      // Add verification status
      if (tokenData.verified) {
        tweet += `✅ Verified • `;
      }
      
      // Add score
      tweet += `📊 Score: ${tokenData.score}/100\n`;
      
      // Add sentiment
      const sentimentEmoji = tokenData.sentiment.toLowerCase() === 'bullish' ? '📈' : 
                           tokenData.sentiment.toLowerCase() === 'bearish' ? '📉' : '➡️';
      tweet += `${sentimentEmoji} ${tokenData.sentiment}\n`;
      
      // Add key metrics if available
      if (tokenData.daily_volume) {
        tweet += `💰 Volume: $${(tokenData.daily_volume / 1000000).toFixed(1)}M\n`;
      }
      
      if (tokenData.price_change_24h !== undefined) {
        const changeEmoji = tokenData.price_change_24h >= 0 ? '📈' : '📉';
        tweet += `${changeEmoji} 24h: ${tokenData.price_change_24h.toFixed(1)}%\n`;
      }
      
      // Add hashtags
      tweet += `\n#Solana #DeFi #Crypto #TokenAnalysis`;
      
      // Check character limit
      if (tweet.length > 280) {
        // Truncate and optimize
        tweet = `🚀 $${tokenData.symbol} - ${tokenData.name}\n`;
        tweet += `📊 Score: ${tokenData.score}/100 • ${sentimentEmoji} ${tokenData.sentiment}\n`;
        if (tokenData.daily_volume) {
          tweet += `💰 Vol: $${(tokenData.daily_volume / 1000000).toFixed(1)}M `;
        }
        if (tokenData.price_change_24h !== undefined) {
          tweet += `${tokenData.price_change_24h >= 0 ? '📈' : '📉'} ${tokenData.price_change_24h.toFixed(1)}%\n`;
        }
        tweet += `#Solana #DeFi #Crypto`;
      }
      
      return {
        success: true,
        tweetContent: tweet,
        characterCount: tweet.length,
      };
    } catch (error) {
      console.error('Error generating tweet content:', error);
      return {
        success: false,
        error: 'Failed to generate tweet content',
      };
    }
  },
});
