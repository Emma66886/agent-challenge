import * as dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { mastra } from './mastra';
import { TokenDiscoveryScheduler } from './services/token-discovery-scheduler';
import { TwitterPostingScheduler } from './services/twitter-posting-scheduler';

dotenv.config();

// Load environment variables
const {
  TELEGRAM_BOT_TOKEN,
  OPENAI_API_KEY,
  TELEGRAM_ALERTS_GROUP_ID,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET
} = process.env;

// Validate required environment variables
if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY) {
  throw new Error('Missing required environment variables: TELEGRAM_BOT_TOKEN and OPENAI_API_KEY');
}

// Create Telegram bot instance
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Initialize token discovery scheduler if group ID is provided
let tokenScheduler: TokenDiscoveryScheduler | null = null;
if (TELEGRAM_ALERTS_GROUP_ID) {
  tokenScheduler = new TokenDiscoveryScheduler(TELEGRAM_ALERTS_GROUP_ID);
}

// Initialize Twitter posting scheduler if Twitter credentials are provided
let twitterScheduler: TwitterPostingScheduler | null = null;
if (TWITTER_CONSUMER_KEY && TWITTER_CONSUMER_SECRET && TWITTER_ACCESS_TOKEN && TWITTER_ACCESS_TOKEN_SECRET) {
  twitterScheduler = new TwitterPostingScheduler();
}

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
  };
  date: number;
  text?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
    user?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
  }>;
}

// Function to check if the bot is mentioned in the message
function isBotMentioned(msg: TelegramMessage, botUsername: string): boolean {
  if (!msg.entities || !msg.text) return false;
  
  return msg.entities.some(entity => {
    if (entity.type === 'mention') {
      const mention = msg.text!.substring(entity.offset, entity.offset + entity.length);
      return mention.toLowerCase() === `@${botUsername.toLowerCase()}`;
    }
    return false;
  });
}

// Function to handle incoming messages
async function handleMessage(msg: TelegramMessage) {
  try {
    // Get bot info to check for mentions
    const botInfo = await bot.getMe();
    const botUsername = botInfo.username!;
    
    // Check for scheduler commands (only from admin users)
    if (msg.text && tokenScheduler) {
      const text = msg.text.toLowerCase().trim();
      
      if (text === '/start_discovery' || text === `/start_discovery@${botUsername.toLowerCase()}`) {
        if (!tokenScheduler.isActive()) {
          tokenScheduler.start();
          await bot.sendMessage(
            msg.chat.id,
            '🤖 Token discovery scheduler started! I will analyze new tokens every 5 minutes.',
            { reply_to_message_id: msg.message_id }
          );
        } else {
          await bot.sendMessage(
            msg.chat.id,
            '✅ Token discovery scheduler is already running.',
            { reply_to_message_id: msg.message_id }
          );
        }
        return;
      }
      
      if (text === '/stop_discovery' || text === `/stop_discovery@${botUsername.toLowerCase()}`) {
        if (tokenScheduler.isActive()) {
          tokenScheduler.stop();
          await bot.sendMessage(
            msg.chat.id,
            '⏹️ Token discovery scheduler stopped.',
            { reply_to_message_id: msg.message_id }
          );
        } else {
          await bot.sendMessage(
            msg.chat.id,
            '❌ Token discovery scheduler is not running.',
            { reply_to_message_id: msg.message_id }
          );
        }
        return;
      }
      
      if (text === '/discovery_status' || text === `/discovery_status@${botUsername.toLowerCase()}`) {
        const status = tokenScheduler.getStatus();
        const statusMessage = `
🤖 *Token Discovery Status*

Status: ${status.active ? '🟢 Active' : '🔴 Inactive'}
Currently Running: ${status.running ? '⚡ Yes' : '💤 No'}
Alert Group: \`${status.groupChatId || 'Not configured'}\`
Next Run: ${status.nextRun || 'N/A'}

Use /start_discovery to start or /stop_discovery to stop.
        `;
        
        await bot.sendMessage(
          msg.chat.id,
          statusMessage.trim(),
          { 
            reply_to_message_id: msg.message_id,
            parse_mode: 'Markdown'
          }
        );
        return;
      }

      // Twitter posting commands
      if (text === '/start_twitter' || text === `/start_twitter@${botUsername.toLowerCase()}`) {
        if (twitterScheduler) {
          if (!twitterScheduler.isActive()) {
            twitterScheduler.start();
            await bot.sendMessage(
              msg.chat.id,
              '🐦 Twitter posting scheduler started! I will post token analyses every 30 minutes.',
              { reply_to_message_id: msg.message_id }
            );
          } else {
            await bot.sendMessage(
              msg.chat.id,
              '✅ Twitter posting scheduler is already running.',
              { reply_to_message_id: msg.message_id }
            );
          }
        } else {
          await bot.sendMessage(
            msg.chat.id,
            '❌ Twitter posting not configured. Please set up Twitter API credentials.',
            { reply_to_message_id: msg.message_id }
          );
        }
        return;
      }

      if (text === '/stop_twitter' || text === `/stop_twitter@${botUsername.toLowerCase()}`) {
        if (twitterScheduler) {
          if (twitterScheduler.isActive()) {
            twitterScheduler.stop();
            await bot.sendMessage(
              msg.chat.id,
              '⏹️ Twitter posting scheduler stopped.',
              { reply_to_message_id: msg.message_id }
            );
          } else {
            await bot.sendMessage(
              msg.chat.id,
              '❌ Twitter posting scheduler is not running.',
              { reply_to_message_id: msg.message_id }
            );
          }
        } else {
          await bot.sendMessage(
            msg.chat.id,
            '❌ Twitter posting not configured.',
            { reply_to_message_id: msg.message_id }
          );
        }
        return;
      }

      if (text === '/twitter_status' || text === `/twitter_status@${botUsername.toLowerCase()}`) {
        if (twitterScheduler) {
          const status = twitterScheduler.getStatus();
          const statusMessage = `
🐦 *Twitter Posting Status*

Status: ${status.active ? '🟢 Active' : '🔴 Inactive'}
Currently Running: ${status.running ? '⚡ Yes' : '💤 No'}
Next Run: ${status.nextRun || 'N/A'}

Use /start_twitter to start or /stop_twitter to stop.
          `;
          
          await bot.sendMessage(
            msg.chat.id,
            statusMessage.trim(),
            { 
              reply_to_message_id: msg.message_id,
              parse_mode: 'Markdown'
            }
          );
        } else {
          await bot.sendMessage(
            msg.chat.id,
            '❌ Twitter posting not configured. Please set up Twitter API credentials.',
            { reply_to_message_id: msg.message_id }
          );
        }
        return;
      }
    }
    
    // Only respond in groups when mentioned, or in private chats
    const isPrivateChat = msg.chat.type === 'private';
    const isMentioned = isBotMentioned(msg, botUsername);
    
    if (!isPrivateChat && !isMentioned) {
      return; // Ignore group messages without mentions
    }
    
    console.log(`Processing message from ${msg.from?.username || msg.from?.first_name} in ${msg.chat.type} chat: ${msg.text}`);
    
    // Use Mastra agent to process the message
    const agent = mastra.getAgent('solHypeBotAgent');
    
    if (agent && msg.text) {
      // Run the agent with the message data
      const result = await agent.generate([
        {
          role: 'user',
          content: `Process this Telegram message and analyze any Solana token mint addresses found:
          
          Chat ID: ${msg.chat.id}
          Message ID: ${msg.message_id}
          Message Text: ${msg.text}
          From: ${msg.from?.username || msg.from?.first_name}
          Chat Type: ${msg.chat.type}
          
          Please:
          1. Extract any Solana token mint addresses from the message
          2. Use the Jupiter API to get token information
          3. Analyze the token data and provide insights
          4. Reply to the message with your analysis using Telegram formatting`
        }
      ]);
      
      console.log('Agent response:', result.text);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    
    // Send error message to user
    try {
      await bot.sendMessage(
        msg.chat.id,
        '❌ Sorry, I encountered an error processing your request. Please try again later.',
        { reply_to_message_id: msg.message_id }
      );
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
}

// Set up message handlers
bot.on('message', handleMessage);

// Handle bot errors
bot.on('error', (error) => {
  console.error('Telegram bot error:', error);
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Telegram polling error:', error);
});

// Start the bot
async function startBot() {
  try {
    console.log('Starting SolHypeBot for Telegram...');
    
    const botInfo = await bot.getMe();
    console.log(`Bot started successfully: @${botInfo.username}`);
    console.log('SolHypeBot is running and listening for mentions in Telegram groups!');
    console.log('Users can mention the bot with Solana token addresses for analysis.');
    
    // Start token discovery scheduler if configured
    if (tokenScheduler && TELEGRAM_ALERTS_GROUP_ID) {
      console.log(`Starting automated token discovery for group: ${TELEGRAM_ALERTS_GROUP_ID}`);
      tokenScheduler.start();
      console.log('Token discovery scheduler started - analyzing tokens every 5 minutes');
    } else {
      console.log('Token discovery not configured - add TELEGRAM_ALERTS_GROUP_ID to enable');
    }

    // Start Twitter posting scheduler if configured
    if (twitterScheduler) {
      console.log('Starting automated Twitter posting...');
      twitterScheduler.start();
      console.log('Twitter posting scheduler started - posting every 30 minutes');
    } else {
      console.log('Twitter posting not configured - add Twitter API credentials to enable');
    }
    
  } catch (error) {
    console.error('Error starting bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (tokenScheduler) {
    tokenScheduler.stop();
  }
  if (twitterScheduler) {
    twitterScheduler.stop();
  }
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (tokenScheduler) {
    tokenScheduler.stop();
  }
  if (twitterScheduler) {
    twitterScheduler.stop();
  }
  bot.stopPolling();
  process.exit(0);
});

// Start the bot
startBot().catch(console.error);
