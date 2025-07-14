import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import TelegramBot from 'node-telegram-bot-api';

// Initialize Telegram bot
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });

export const telegramReplyTool = createTool({
  id: 'telegram_reply',
  description: 'Reply to a Telegram message with formatted content',
  inputSchema: z.object({
    chatId: z.union([z.string(), z.number()]).describe('The chat ID where the message should be sent'),
    replyToMessageId: z.number().optional().describe('The message ID to reply to'),
    message: z.string().describe('The reply message content'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const options: any = {
        parse_mode: 'Markdown' as const,
      };
      
      if (context.replyToMessageId) {
        options.reply_to_message_id = context.replyToMessageId;
      }
      
      const response = await telegramBot.sendMessage(
        context.chatId,
        context.message,
        options
      );
      
      return {
        success: true,
        messageId: response.message_id,
      };
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return {
        success: false,
        error: 'Failed to send Telegram message',
      };
    }
  },
});

export const extractSolanaAddressTool = createTool({
  id: 'extract_solana_address',
  description: 'Extract Solana addresses from text using regex pattern',
  inputSchema: z.object({
    text: z.string().describe('The text to extract Solana addresses from'),
  }),
  outputSchema: z.object({
    addresses: z.array(z.string()),
    found: z.boolean(),
  }),
  execute: async ({ context }) => {
    // Solana addresses are base58 encoded and typically 32-44 characters
    const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const matches = context.text.match(regex) || [];
    
    // Filter out common false positives
    const validAddresses = matches.filter(addr => {
      // Basic validation - Solana addresses don't start with certain characters
      return !addr.startsWith('0') && addr.length >= 32;
    });
    
    return {
      addresses: validAddresses,
      found: validAddresses.length > 0,
    };
  },
});

export const telegramNotificationTool = createTool({
  id: 'telegram_notification',
  description: 'Send automated token analysis notifications to a specific Telegram group',
  inputSchema: z.object({
    groupChatId: z.string().describe('The Telegram group chat ID to send the notification to'),
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
    }).describe('Token analysis data to include in the notification'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const { tokenData } = context;
      
      // Format the notification message
      let message = `🚨 *NEW TOP TOKEN DISCOVERED* 🚨\n\n`;
      message += `🪙 *${tokenData.name}* (\`$${tokenData.symbol}\`)\n`;
      message += `📊 *Score:* ${tokenData.score}/100\n`;
      message += `😊 *Sentiment:* ${tokenData.sentiment}\n`;
      message += `🏆 *Rank:* #${tokenData.rank}\n\n`;
      
      if (tokenData.market_cap) {
        message += `💰 *Market Cap:* $${tokenData.market_cap.toLocaleString()}\n`;
      }
      
      if (tokenData.daily_volume) {
        message += `📈 *24h Volume:* $${tokenData.daily_volume.toLocaleString()}\n`;
      }
      
      if (tokenData.price_change_24h !== undefined) {
        const changeEmoji = tokenData.price_change_24h >= 0 ? '📈' : '📉';
        message += `${changeEmoji} *24h Change:* ${tokenData.price_change_24h.toFixed(2)}%\n`;
      }
      
      if (tokenData.liquidity) {
        message += `💧 *Liquidity:* $${tokenData.liquidity.toLocaleString()}\n`;
      }
      
      message += `\n🔍 *Analysis:*\n${tokenData.analysis_reason}\n\n`;
      
      // Add social links if available
      if (tokenData.extensions) {
        const socials = [];
        if (tokenData.extensions.website) socials.push(`[Website](${tokenData.extensions.website})`);
        if (tokenData.extensions.twitter) socials.push(`[Twitter](${tokenData.extensions.twitter})`);
        if (tokenData.extensions.telegram) socials.push(`[Telegram](${tokenData.extensions.telegram})`);
        if (tokenData.extensions.discord) socials.push(`[Discord](${tokenData.extensions.discord})`);
        
        if (socials.length > 0) {
          message += `🔗 *Links:* ${socials.join(' • ')}\n\n`;
        }
      }
      
      message += `📋 *Contract:* \`${tokenData.mint}\`\n`;
      message += `⏰ *Analyzed:* ${new Date().toLocaleString()}`;
      
      const response = await telegramBot.sendMessage(
        context.groupChatId,
        message,
        {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }
      );
      
      return {
        success: true,
        messageId: response.message_id,
      };
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return {
        success: false,
        error: 'Failed to send Telegram notification',
      };
    }
  },
});
