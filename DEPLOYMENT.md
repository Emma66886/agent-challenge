# Deployment Guide - Coin Chat Agent

## Overview

This project contains a **Coin Chat Agent** built with the Mastra framework. The agent provides sophisticated Solana token analysis capabilities using Jupiter API data, featuring memory-enabled conversations and comprehensive scoring systems.

## Current Agent: Coin Chat Agent

### Features
- 🤖 **Conversational AI**: Memory-enabled chat for natural token analysis discussions
- 🔍 **Token Analysis**: Comprehensive Solana token evaluation using Jupiter API
- 📊 **Enhanced Scoring**: 0-105 point scoring system with detailed breakdown
- 💾 **Persistent Memory**: LibSQLStore integration for conversation continuity
- 🎯 **Three Specialized Tools**:
  - `coinAnalysisTool`: Detailed token potential analysis with scoring
  - `bestCoinsTool`: Discovery of top-performing tokens from recent data
  - `coinChatTool`: Conversational token information and Q&A

## Quick Start

### 1. Local Development

```bash
# Install dependencies
pnpm install

# Run Coin Chat Agent (Mastra web interface)
pnpm run dev

# Access the agent at http://localhost:8080
```

### 2. Docker Deployment

#### Coin Chat Agent (Web Interface)
```bash
# Default deployment
docker-compose up -d

# Or using specific profile
docker-compose --profile web up -d
```

#### With Local Ollama LLM
```bash
# Run with local Ollama service
docker-compose --profile ollama up -d
```

### 3. Manual Docker Build

```bash
# Build the image
docker build -t coin-chat-agent .

# Run the container
docker run -p 8080:8080 --env-file .env coin-chat-agent
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Required for Coin Chat Agent
OPENAI_API_KEY=your_openai_api_key

# Ollama/LLM Settings (required)
API_BASE_URL=http://127.0.0.1:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b

# Mastra Configuration
MASTRA_DB_URL=file:../mastra.db

# Optional: Node Environment
NODE_ENV=development
```

## Available Services

### Coin Chat Agent Service
- **Service**: `coin-chat-agent`
- **Port**: 8080
- **URL**: `http://localhost:8080`
- **Description**: Interactive web interface for the Coin Chat Agent
- **Profiles**: `web`, `mastra`, `default`

### Ollama Service (Optional)
- **Service**: `ollama`
- **Port**: 11434
- **Description**: Local LLM service for offline development
- **Profiles**: `ollama`, `local-llm`

## Agent Capabilities

### 1. Token Analysis
```
User: "Analyze this token: So11111111111111111111111111111111111111112"

Agent: 🪙 Wrapped SOL ($WSOL) Analysis
📊 Potential Score: 85/105 (BULLISH)
🎯 Risk Level: LOW
...
```

### 2. Best Coins Discovery
```
User: "What are the best performing coins right now?"

Agent: 🏆 Top Performing Coins (Last 24h)
1. TokenA - Score: 92/105 (+15.2%)
2. TokenB - Score: 88/105 (+12.8%)
...
```

### 3. Conversational Analysis
```
User: "Tell me about the tokenomics of BONK"

Agent: 🐕 BONK Token Analysis
The tokenomics structure shows...
```

## Nosana Deployment

### Update Job Definition

Edit `nos_job_def/nosana_mastra.json`:

```json
{
  "image": "docker.io/yourusername/coin-chat-agent:latest",
  "env": {
    "OPENAI_API_KEY": "your_openai_key",
    "API_BASE_URL": "http://127.0.0.1:11434/api",
    "MODEL_NAME_AT_ENDPOINT": "qwen2.5:1.5b",
    "NODE_ENV": "production"
  },
  "resources": {
    "cpu": "2000m",
    "memory": "4Gi"
  },
  "ports": [
    {
      "containerPort": 8080,
      "protocol": "TCP"
    }
  ]
}
```

### Deploy with Nosana CLI

```bash
# Deploy Coin Chat Agent
nosana job post --file nos_job_def/nosana_mastra.json --market nvidia-3090 --timeout 30

# Or deploy with Qwen model
nosana job post --file nos_job_def/qwen_nos_jb.json --market nvidia-3090 --timeout 30
```

## Production Considerations

### Resource Requirements
- **CPU**: 2 cores minimum
- **RAM**: 4GB minimum (8GB recommended for qwen2.5:1.5b)
- **Storage**: 2GB for model + database
- **Network**: Stable internet for Jupiter API calls

### Security
- Use environment variables for API keys
- Implement rate limiting for Jupiter API
- Monitor OpenAI API usage and costs
- Set up proper logging and monitoring

### Performance
- Memory system provides conversation continuity
- Jupiter API caching for better response times
- Health checks for service reliability
- Automatic restart policies for stability

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear and reinstall dependencies
   rm -rf node_modules .mastra && pnpm install
   ```

2. **API Errors**
   - Verify OpenAI API key is valid and has credits
   - Check Jupiter API connectivity for Solana data
   - Monitor rate limits on API endpoints

3. **Memory Issues**
   - Ensure database file has write permissions
   - Check available disk space for SQLite storage
   - Verify memory configuration in LibSQLStore

4. **Agent Not Responding**
   - Check that coinChatAgent is properly registered
   - Verify tool execution parameters format
   - Review console logs for tool execution errors

### Logs and Debugging

```bash
# View container logs
docker logs coin-chat-agent

# Follow real-time logs
docker logs -f coin-chat-agent

# Check specific service logs
docker-compose logs coin-chat-agent

# Check health status
curl http://localhost:8080/api/health
```

## Development

### Available Scripts
```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run test suite
pnpm test:jupiter     # Test Jupiter API integration
pnpm test:coin-chat   # Test Coin Chat Agent

# Deployment
pnpm run deploy:agent # Deploy to Nosana
pnpm run deploy:qwen  # Deploy with Qwen model
```

### Adding New Features
The Coin Chat Agent is designed to be extensible. To add new functionality:

1. Create new tools in `src/mastra/agents/coin-chat-agent/coin-chat-tool.ts`
2. Update agent instructions in `coin-chat-agent.ts`
3. Test locally with `pnpm run dev`
4. Deploy updated version

## Maintenance

### Updates
1. Pull latest code changes
2. Update dependencies with `pnpm update`
3. Rebuild Docker image
4. Restart services

### Backup
- Back up the `/data` directory
- Export environment variables
- Save Mastra database (`mastra.db`)

### Monitoring
- Monitor Jupiter API response times
- Track OpenAI API usage and costs
- Check memory database size and performance
- Set up alerts for service downtime
