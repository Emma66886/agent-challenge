# Token Discovery System

## Overview

The token discovery system automatically analyzes recent Solana tokens and identifies promising opportunities based on comprehensive scoring criteria.

## How It Works

1. **Data Collection**: Fetches recent tokens from Jupiter API
2. **Scoring**: Analyzes each token using multiple criteria
3. **Ranking**: Sorts tokens by score from best to worst
4. **Change Detection**: Compares with previous analysis
5. **Notifications**: Sends alerts for newly discovered top tokens

## Scoring Criteria

The system uses a 100-point scoring system:

### Verification Status (20 points)
- ✅ **Verified tokens**: Full 20 points
- ❌ **Unverified tokens**: 0 points

### Social Media Presence (15 points)
- 🌐 **Website**: 5 points
- 🐦 **Twitter**: 4 points
- 📱 **Telegram**: 3 points
- 💬 **Discord**: 3 points

### Trading Volume (20 points)
- 📊 **High volume (>$1M daily)**: 20 points
- 📈 **Medium volume ($100K-$1M)**: 15 points
- 📉 **Low volume (<$100K)**: 5 points

### Liquidity (15 points)
- 💧 **High liquidity**: 15 points
- 🌊 **Medium liquidity**: 10 points
- 🏊 **Low liquidity**: 5 points

### Token Authority Status (15 points)
- 🟢 **No mint authority**: 8 points (limited supply)
- 🟢 **No freeze authority**: 7 points (can't freeze tokens)
- 🟡 **Authorities present**: Reduced points

### Market Cap (10 points)
- 💰 **Reasonable market cap**: 10 points
- 📊 **Growth potential assessment**: Variable points

### Tags and Categorization (5 points)
- 🏷️ **Well-categorized**: 5 points
- 📝 **Proper metadata**: Bonus points

## Analysis Process

1. **Token Fetching**
   ```typescript
   jupiterRecentTokensTool.execute({ limit: 50 })
   ```

2. **Individual Scoring**
   - Each token analyzed against all criteria
   - Weighted scoring based on importance
   - Sentiment analysis (Bullish/Neutral/Bearish)

3. **Ranking and Comparison**
   - Tokens sorted by total score
   - Previous analysis loaded from storage
   - Change detection for #1 token

4. **Notification Logic**
   - Only notifies if top token changed
   - Includes detailed analysis reasoning
   - Formatted for Telegram with emojis

## Storage and Persistence

The system maintains analysis history in `/data/recent_analysis.json`:

```json
{
  "last_analysis": "2024-01-15T10:30:00Z",
  "best_token": {
    "mint": "token_address",
    "symbol": "TOKEN",
    "name": "Token Name",
    "score": 85,
    "sentiment": "Bullish",
    "analysis_reason": "Strong fundamentals...",
    "rank": 1
  },
  "previous_analyses": [...]
}
```

## Scheduling

- **Frequency**: Every 5 minutes
- **Auto-start**: Configurable via environment
- **Commands**: `/start_discovery`, `/stop_discovery`, `/discovery_status`

## Customization

### Adjusting Scoring Weights
Modify scoring logic in:
- `src/mastra/agents/token-discovery-agent.ts`

### Changing Frequency
Update interval in:
- `src/services/token-discovery-scheduler.ts`

### Custom Criteria
Add new scoring criteria:
1. Update the scoring instructions in the agent
2. Modify the analysis reasoning logic
3. Test with real token data

## Notification Format

```
🚨 NEW TOP TOKEN DISCOVERED 🚨

🪙 TokenName ($SYMBOL)
📊 Score: 85/100
😊 Sentiment: Bullish
🏆 Rank: #1

💰 Market Cap: $1,234,567
📈 24h Volume: $987,654
📈 24h Change: +12.3%
💧 Liquidity: $456,789

🔍 Analysis:
Strong fundamentals with verified status, complete social media presence, high trading volume, and secure tokenomics. No mint authority ensures limited supply, while active community engagement suggests sustained interest.

🔗 Links: Website • Twitter • Telegram

📋 Contract: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
⏰ Analyzed: 1/15/2024, 10:30:00 AM
```

## Troubleshooting

### No Notifications
- Check `TELEGRAM_ALERTS_GROUP_ID` environment variable
- Verify bot has admin permissions in group
- Ensure discovery scheduler is running

### Scoring Issues
- Review Jupiter API data quality
- Check token data completeness
- Verify scoring criteria logic

### Performance
- Consider reducing analysis frequency
- Optimize token data fetching
- Monitor API rate limits
