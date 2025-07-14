# Twitter Integration Setup Guide

## Getting Twitter API Credentials

1. **Create a Twitter Developer Account**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Apply for a developer account
   - Create a new app/project

2. **Generate API Keys**
   - Go to your app settings
   - Generate the following credentials:
     - Consumer Key (API Key)
     - Consumer Secret (API Secret)
     - Access Token
     - Access Token Secret

3. **Set App Permissions**
   - Ensure your app has "Read and Write" permissions
   - This is required for posting tweets

## Environment Variables

Add these to your `.env` file:

```env
TWITTER_CONSUMER_KEY=your_consumer_key_here
TWITTER_CONSUMER_SECRET=your_consumer_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

## How Twitter Posting Works

1. **Automated Posting**: Every 30 minutes, the bot analyzes recent tokens
2. **Token Analysis**: Scores tokens based on multiple criteria
3. **Tweet Generation**: Creates engaging tweets about top-performing tokens
4. **Content Optimization**: Ensures tweets are under 280 characters with relevant hashtags

## Tweet Format

The bot generates tweets like:
```
🚀 $TOKEN - TokenName
✅ Verified • 📊 Score: 85/100
📈 Bullish
💰 Volume: $1.2M
📈 24h: +15.2%

#Solana #DeFi #Crypto #TokenAnalysis
```

## Admin Commands

- `/start_twitter` - Start automated Twitter posting
- `/stop_twitter` - Stop automated Twitter posting
- `/twitter_status` - Check Twitter posting status

## Testing

1. **Start the bot**: `pnpm run dev:telegram`
2. **Send `/start_twitter`** command in your Telegram group
3. **Check console logs** for posting activity
4. **Visit your Twitter profile** to see posted tweets

## Troubleshooting

### Authentication Errors
- Verify all four Twitter credentials are correct
- Check that your app has "Read and Write" permissions
- Ensure your developer account is approved

### Rate Limiting
- Twitter has rate limits for posting
- Bot automatically handles retries
- Consider adjusting posting frequency if needed

### Tweet Content Issues
- Tweets are automatically truncated to 280 characters
- Special characters may cause encoding issues
- Check console logs for specific error messages

## Content Guidelines

The bot follows these guidelines:
- Informative and engaging content
- Relevant hashtags for discoverability
- No financial advice language
- Focus on technical analysis and metrics
- Compliance with Twitter's terms of service

## Customization

You can modify the tweet generation logic in:
- `src/mastra/tools/twitter-posting-tool.ts`
- `src/mastra/agents/twitter-posting-agent.ts`

Adjust the posting frequency in:
- `src/services/twitter-posting-scheduler.ts`
