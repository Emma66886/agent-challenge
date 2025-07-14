# Telegram Bot Setup Guide

## Getting a Telegram Bot Token

1. **Start a conversation with [@BotFather](https://t.me/botfather)**
2. **Send `/newbot` command**
3. **Follow the prompts to create your bot:**
   - Choose a name for your bot (e.g., "SolHype Analysis Bot")
   - Choose a username (must end with "bot", e.g., "solhype_analysis_bot")
4. **Save the bot token** - you'll need this for the `TELEGRAM_BOT_TOKEN` environment variable

## Adding Bot to Groups

1. **Add your bot to a Telegram group**
2. **Make the bot an admin** (optional, but recommended for reliability)
3. **Get the group chat ID:**
   - Send a message mentioning your bot in the group
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for the `"chat":{"id":` field in the response
   - This negative number is your group chat ID

## Environment Variables

Add these to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ALERTS_GROUP_ID=your_group_chat_id_here
```

## Bot Commands

### User Commands
- Users can mention your bot with a Solana token address for analysis
- Example: `@your_bot_username What do you think about this token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

### Admin Commands
- `/start_discovery` - Start automated token discovery
- `/stop_discovery` - Stop automated token discovery  
- `/discovery_status` - Check discovery status
- `/start_twitter` - Start Twitter posting
- `/stop_twitter` - Stop Twitter posting
- `/twitter_status` - Check Twitter status

## Testing

1. **Start the bot**: `pnpm run dev:telegram`
2. **Send a test message** in your group mentioning the bot
3. **Check console logs** for any errors
4. **Bot should respond** with token analysis

## Troubleshooting

### Bot doesn't respond
- Check that `TELEGRAM_BOT_TOKEN` is correct
- Ensure bot is added to the group
- Verify bot has necessary permissions

### Group notifications not working
- Check that `TELEGRAM_ALERTS_GROUP_ID` is correct (should be negative number)
- Ensure bot is admin in the group
- Check console logs for errors

### Rate limiting
- Telegram has rate limits for bots
- If you hit limits, the bot will automatically retry
- Consider adding delays between requests for high-volume usage
