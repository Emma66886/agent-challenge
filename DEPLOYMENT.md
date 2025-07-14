# Deployment Guide

## Quick Start

### 1. Local Development

```bash
# Install dependencies
pnpm install

# Run web interface
pnpm run dev

# Run Telegram bot
pnpm run dev:telegram
```

### 2. Docker Deployment

#### Web Interface Only
```bash
docker-compose --profile web up -d
```

#### Telegram Bot Only
```bash
docker-compose --profile telegram up -d
```

#### Both Web and Telegram
```bash
docker-compose --profile combined up -d
```

### 3. Manual Docker Build

```bash
# Build the image
docker build -t solhype-bot .

# Run web interface
docker run -p 8080:8080 --env-file .env solhype-bot

# Run Telegram bot
docker run --env-file .env -e APP_MODE=telegram solhype-bot
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Required
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Optional
TELEGRAM_ALERTS_GROUP_ID=your_group_chat_id
TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# Ollama Settings (optional)
API_BASE_URL=http://127.0.0.1:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
```

## Deployment Modes

### Web Interface Mode
- Runs Mastra web interface on port 8080
- Provides chat interface for direct interaction
- Access at `http://localhost:8080`

### Telegram Bot Mode
- Runs Telegram bot listener
- Responds to group mentions
- Includes automated discovery and Twitter posting

### Combined Mode
- Runs both web interface and Telegram bot
- Maximum functionality
- Recommended for production

## Nosana Deployment

### Update Job Definition

Edit `nos_job_def/nosana_mastra.json`:

```json
{
  "image": "docker.io/yourusername/solhype-bot:latest",
  "env": {
    "OPENAI_API_KEY": "your_key",
    "TELEGRAM_BOT_TOKEN": "your_token",
    "APP_MODE": "telegram"
  }
}
```

### Deploy with Nosana CLI

```bash
# Deploy web interface
nosana job post --file nos_job_def/nosana_mastra.json --market nvidia-3090 --timeout 30

# Deploy Telegram bot
nosana job post --file nos_job_def/nosana_mastra.json --market nvidia-3090 --timeout 30 --env APP_MODE=telegram
```

## Production Considerations

### Resource Requirements
- **CPU**: 2 cores minimum
- **RAM**: 4GB minimum (8GB for qwen2.5:1.5b)
- **Storage**: 2GB for model + data
- **Network**: Stable internet for API calls

### Scaling
- Use load balancers for multiple instances
- Separate web and bot services
- Consider using Redis for shared storage

### Security
- Use environment variables for secrets
- Implement rate limiting
- Monitor API usage
- Set up logging and monitoring

### Monitoring
- Check console logs for errors
- Monitor API response times
- Set up alerts for service downtime
- Track token analysis accuracy

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (20+)
   - Verify all dependencies installed
   - Clear node_modules and rebuild

2. **API Errors**
   - Verify API keys are correct
   - Check network connectivity
   - Monitor rate limits

3. **Memory Issues**
   - Increase container memory limit
   - Use smaller LLM model
   - Optimize token processing

4. **Telegram Bot Issues**
   - Verify bot token is correct
   - Check group permissions
   - Ensure bot is added to groups

### Logs and Debugging

```bash
# View container logs
docker logs solhype-bot

# Follow real-time logs
docker logs -f solhype-bot

# Check specific service logs
docker-compose logs solhype-web
docker-compose logs solhype-telegram
```

## Maintenance

### Updates
1. Pull latest code changes
2. Rebuild Docker image
3. Update environment variables if needed
4. Restart services

### Backup
- Back up the `/data` directory
- Export environment variables
- Save deployment configurations

### Health Checks
- Implement health check endpoints
- Monitor service availability
- Set up automatic restart policies
