# Nosana Builders Challenge: Agent-101 - Coin Chat Agent

![Agent-101](./assets/NosanaBuildersChallengeAgents.jpg)

## Overview

This project implements a sophisticated **Coin Chat Agent** built with the Mastra framework for the Nosana Builders Challenge. The agent provides advanced Solana token analysis capabilities with memory-enabled conversations, making it perfect for discovering and analyzing cryptocurrency opportunities.

## 🤖 Current Agent: Coin Chat Agent

### Core Features
- 🤖 **Conversational AI**: Memory-enabled chat agent for natural token analysis discussions
- 🔍 **Token Analysis**: Comprehensive Solana token evaluation using Jupiter API
- 📊 **Enhanced Scoring**: 0-105 point scoring system with detailed breakdown
- 💾 **Persistent Memory**: LibSQLStore integration for conversation continuity
- 🎯 **Multi-Modal Interface**: Web-based chat interface accessible via Mastra playground
- 🔧 **Full TypeScript**: Complete type safety with Zod validation

### Agent Architecture

The Coin Chat Agent provides three specialized tools:

#### 1. `coinAnalysisTool`
- **Purpose**: Detailed token potential analysis with comprehensive scoring
- **Input**: Solana token mint address
- **Output**: 0-105 point score, sentiment (bullish/neutral/bearish), risk assessment, key factors
- **Features**: Organic score verification, holder analysis, suspicious token detection

#### 2. `bestCoinsTool`
- **Purpose**: Discovery of top-performing tokens from recent market data
- **Input**: Optional limit parameter
- **Output**: Ranked list of best-performing tokens with scores and metrics
- **Features**: Multi-factor scoring, performance analysis, volume assessment

#### 3. `coinChatTool`
- **Purpose**: Conversational token information and detailed Q&A
- **Input**: Token mint address
- **Output**: Comprehensive token information in conversational format
- **Features**: Technical details, market data, tokenomics analysis

### Memory System
- **Persistent Storage**: LibSQLStore with SQLite database
- **Conversation History**: Remembers previous token analyses
- **User Preferences**: Tracks risk tolerance and investment interests
- **Comparative Analysis**: Compares new tokens with previously analyzed ones
- **Session Continuity**: Maintains context across multiple conversations

## 🚀 Quick Start

### Prerequisites
- Node.js 20.9.0 or higher
- pnpm (recommended) or npm
- OpenAI API key
- Local Ollama installation (optional, for local LLM)

### 1. Installation

```bash
# Clone the repository
git clone <your-fork-url>
cd agent-challenge

# Install dependencies
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
```env
# OpenAI API (required for AI analysis)
OPENAI_API_KEY=your_openai_api_key

# LLM Configuration (required)
API_BASE_URL=http://127.0.0.1:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b

# Mastra Database (optional, uses default if not set)
MASTRA_DB_URL=file:../mastra.db
```

### 3. Local Development

```bash
# Start the Coin Chat Agent
pnpm run dev

# Access the agent at http://localhost:8080
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t coin-chat-agent .
docker run -p 8080:8080 --env-file .env coin-chat-agent
```

## 💬 Usage Examples

### Web Interface
Access the interactive chat at `http://localhost:8080` and try:

**Token Analysis:**
```
Analyze this token: So11111111111111111111111111111111111111112
```

**Best Coins Discovery:**
```
What are the best performing coins right now?
```

**Conversational Analysis:**
```
Tell me about the tokenomics of BONK token
```

### Example Response
```
🪙 Wrapped SOL ($WSOL) Analysis

📊 Potential Score: 85/105 (BULLISH)
🎯 Risk Level: LOW

Key Factors:
✅ High organic score (verified)
🌐 Strong social presence (website + Twitter)
📊 Good trading volume ($1.2M daily)
🔒 Mint authority disabled
⚠️ Freeze authority present

💡 Analysis: Strong fundamentals with good community 
backing and healthy trading activity. Consider for 
medium-term holding with proper risk management.

Mint Address: So11111111111111111111111111111111111111112
```

## 🛠 Development

### Project Structure
```
src/
├── mastra/
│   ├── index.ts                           # Mastra configuration
│   ├── config.ts                          # Model and API configuration
│   └── agents/
│       └── coin-chat-agent/
│           ├── coin-chat-agent.ts         # Main agent definition
│           └── coin-chat-tool.ts          # Specialized analysis tools
```

### Available Scripts
```bash
# Development
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm start                # Start production server

# Testing
pnpm test                 # Run test suite
pnpm test:jupiter         # Test Jupiter API integration
pnpm test:coin-chat       # Test Coin Chat Agent specifically

# Deployment
pnpm run deploy:agent     # Deploy to Nosana
pnpm run deploy:qwen      # Deploy with Qwen model

# Code Quality
pnpm run lint             # Lint code
pnpm run format           # Format code
pnpm run check            # Run all checks
```

### Adding New Features

1. **Extend Agent Tools**: Add new functions to `coin-chat-tool.ts`
2. **Update Instructions**: Modify agent behavior in `coin-chat-agent.ts`
3. **Test Locally**: Use `pnpm run dev` to test changes
4. **Deploy**: Build and deploy updated version

## 🚀 Nosana Deployment

### Docker Container

```bash
# Build and tag for deployment
docker build -t yourusername/coin-chat-agent:latest .

# Push to registry
docker push yourusername/coin-chat-agent:latest
```

### Job Definition

Update `nos_job_def/nosana_mastra.json`:

```json
{
  "image": "docker.io/yourusername/coin-chat-agent:latest",
  "env": {
    "OPENAI_API_KEY": "your_openai_key",
    "API_BASE_URL": "http://127.0.0.1:11434/api",
    "MODEL_NAME_AT_ENDPOINT": "qwen2.5:1.5b",
    "NODE_ENV": "production"
  }
}
```

### Deploy with Nosana CLI

```bash
# Deploy to Nosana
nosana job post --file nos_job_def/nosana_mastra.json --market nvidia-3090 --timeout 30
```

## 🏗️ Technical Implementation

### Agent Design Pattern
- **Memory-First Architecture**: Persistent conversation history for personalized analysis
- **Tool-Based Approach**: Modular tools for different analysis types
- **Jupiter API Integration**: Real-time Solana token data
- **Comprehensive Scoring**: Multi-factor analysis with 0-105 point system

### Key Technologies
- **Mastra Framework**: Agent orchestration and memory management
- **Jupiter API**: Solana token data and market information
- **LibSQLStore**: Persistent memory storage
- **OpenAI GPT-4**: Natural language processing and analysis
- **TypeScript + Zod**: Type safety and validation

### Performance Features
- **Memory Caching**: Persistent conversation context
- **API Optimization**: Efficient Jupiter API calls
- **Error Handling**: Robust error recovery and user feedback
- **Health Checks**: Service monitoring and reliability

## 📊 Agent Capabilities

### Analysis Metrics
- **Potential Score**: 0-105 point comprehensive rating
- **Risk Assessment**: Low/Medium/High risk categorization
- **Sentiment Analysis**: Bullish/Neutral/Bearish outlook
- **Factor Analysis**: Detailed breakdown of positive/negative elements

### Data Sources
- **Jupiter API**: Real-time market data, price, volume
- **Token Metadata**: Name, symbol, social links
- **Holder Analysis**: Distribution and concentration metrics
- **Authority Analysis**: Mint and freeze authority status

## 🔧 Troubleshooting

### Common Issues

1. **Agent Not Responding**
   ```bash
   # Check agent registration
   grep -r "coinChatAgent" src/mastra/
   
   # Verify memory database
   ls -la mastra.db
   ```

2. **API Errors**
   ```bash
   # Test Jupiter API connectivity
   pnpm test:jupiter
   
   # Verify OpenAI API key
   echo $OPENAI_API_KEY
   ```

3. **Memory Issues**
   ```bash
   # Check database permissions
   chmod 664 mastra.db
   
   # Clear and rebuild
   rm -rf .mastra node_modules && pnpm install
   ```

## 📈 Future Enhancements

### Planned Features
- **Portfolio Tracking**: Multi-token portfolio analysis
- **Alert System**: Price and score change notifications
- **Social Sentiment**: Twitter and community sentiment analysis
- **Historical Analysis**: Token performance over time
- **Risk Management**: Advanced risk assessment tools

### Extension Ideas
- **DeFi Integration**: Liquidity pool and farming analysis
- **NFT Analysis**: NFT collection evaluation tools
- **Cross-Chain**: Multi-blockchain token analysis
- **AI Trading**: Automated trading strategy suggestions

## 📋 Challenge Requirements

### ✅ Completed Requirements
- [x] **Custom Agent**: Coin Chat Agent with memory capabilities
- [x] **Tool Implementation**: Three specialized analysis tools
- [x] **Docker Container**: Production-ready containerization
- [x] **Documentation**: Comprehensive setup and usage guides
- [x] **Nosana Deployment**: Ready for network deployment
- [x] **Memory Integration**: Persistent conversation history
- [x] **Real-world Application**: Practical cryptocurrency analysis tool

### 🎯 Innovation Highlights
- **Memory-Enhanced Analysis**: First agent to remember user preferences and analysis history
- **Comprehensive Scoring**: Advanced 0-105 point evaluation system
- **Multi-Tool Architecture**: Specialized tools for different analysis needs
- **Real-time Data**: Live market data integration with Jupiter API
- **User Experience**: Conversational interface with emoji-rich responses

## 📞 Support & Resources

- **Nosana Discord**: [Join for technical support](https://nosana.com/discord)
- **Mastra Documentation**: [mastra.ai/docs](https://mastra.ai/docs)
- **Jupiter API**: [station.jup.ag/docs/apis](https://station.jup.ag/docs/apis)
- **Project Repository**: [GitHub Repository](https://github.com/nosana-ai/agent-challenge)

## 📄 License

This project is part of the Nosana Builders Challenge and follows the challenge guidelines and terms.

---

**Built for the Nosana Builders Challenge 2025**  
*Demonstrating advanced AI agent capabilities with real-world cryptocurrency analysis applications*

## Original Challenge Information

## Topic

Nosana Builders Challenge, 2nd edition
Agent-101: Build your first agent

## Description

The main goal of this `Nosana Builders Challenge` to teach participants to build and deploy agents. This first step will be in running a basic AI agent and giving it some basic functionality. Participants will add a tool, for the tool calling capabilities of the agent. These are basically some TypeScript functions, that will, for example, retrieve some data from a weather API, post a tweet via an API call, etc.

## [Mastra](https://github.com/mastra-ai/mastra)

For this challenge we will be using Mastra to build our tool.

> Mastra is an opinionated TypeScript framework that helps you build AI applications and features quickly. It gives you the set of primitives you need: workflows, agents, RAG, integrations, and evals. You can run Mastra on your local machine, or deploy to a serverless cloud.

### Required Reading

We recommend reading the following sections to get started with how to create an Agent and how to implement Tool Calling.

- <https://mastra.ai/en/docs/agents/overview>
- [Mastra Guide: Build an AI stock agent](https://mastra.ai/en/guides/guide/stock-agent)

## Get Started

To get started run the following command to start developing:
We recommend using [pnpm](https://pnpm.io/installation), but you can try npm, or bun if you prefer.

```sh
pnpm install
pnpm run dev
```

## Assignment

### Challenge Overview

Welcome to the Nosana AI Agent Hackathon! Your mission is to build and deploy an AI agent on Nosana.
While we provide a weather agent as an example, your creativity is the limit. Build agents that:

**Beginner Level:**

- **Simple Calculator**: Perform basic math operations with explanations
- **Todo List Manager**: Help users track their daily tasks

**Intermediate Level:**

- **News Summarizer**: Fetch and summarize latest news articles
- **Crypto Price Checker**: Monitor cryptocurrency prices and changes
- **GitHub Stats Reporter**: Fetch repository statistics and insights

**Advanced Level:**

- **Blockchain Monitor**: Track and alert on blockchain activities
- **Trading Strategy Bot**: Automate simple trading strategies
- **Deploy Manager**: Deploy and manage applications on Nosana

Or any other innovative AI agent idea at your skill level!

### Getting Started

1. **Fork the [Nosana Agent Challenge](https://github.com/nosana-ai/agent-challenge)** to your GitHub account
2. **Clone your fork** locally
3. **Install dependencies** with `pnpm install`
4. **Run the development server** with `pnpm run dev`
5. **Build your agent** using the Mastra framework

### How to build your Agent

Here we will describe the steps needed to build an agent.

#### Folder Structure

Provided in this repo, there is the `Weather Agent`.
This is a fully working agent that allows a user to chat with an LLM, and fetches real time weather data for the provided location.

There are two main folders we need to pay attention to:

- [src/mastra/agents/weather-agent/](./src/mastra/agents/weather-agent/)
- [src/mastra/agents/your-agents/](./src/mastra/agents/your-agent/)

In `src/mastra/agents/weather-agent/` you will find a complete example of a working agent. Complete with Agent definition, API calls, interface definition, basically everything needed to get a full fledged working agent up and running.
In `src/mastra/agents/your-agents/` you will find a bare bones example of the needed components, and imports to get started building your agent, we recommend you rename this folder, and it's files to get started.

Rename these files to represent the purpose of your agent and tools. You can use the [Weather Agent Example](#example:_weather_agent) as a guide until you are done with it, and then you can delete these files before submitting your final submission.

As a bonus, for the ambitious ones, we have also provided the [src/mastra/agents/weather-agent/weather-workflow.ts](./src/mastra/agents/weather-agent/weather-workflow.ts) file as an example. This file contains an example of how you can chain agents and tools to create a workflow, in this case, the user provides their location, and the agent retrieves the weather for the specified location, and suggests an itinerary.

### LLM-Endpoint

Agents depend on an LLM to be able to do their work.

#### Nosana Endpoint

You can use the following endpoint and model for testing, if you wish:

```
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
API_BASE_URL= https://dashboard.nosana.com/jobs/GPVMUckqjKR6FwqnxDeDRqbn34BH7gAa5xWnWuNH1drf
```

#### Running Your Own LLM with Ollama

The default configuration uses a local [Ollama](https://ollama.com) LLM.
For local development or if you prefer to use your own LLM, you can use [Ollama](https://ollama.ai) to serve the lightweight `qwen2.5:1.5b` mode.

**Installation & Setup:**

1. **[ Install Ollama ](https://ollama.com/download)**:

2. **Start Ollama service**:

```bash
ollama serve
```

3. **Pull and run the `qwen2.5:1.5b` model**:

```bash
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b
```

4. **Update your `.env` file**

There are two predefined environments defined in the `.env` file. One for local development and another, with a larger model, `qwen2.5:32b`, for more complex use cases.

**Why `qwen2.5:1.5b`?**

- Lightweight (only ~1GB)
- Fast inference on CPU
- Supports tool calling
- Great for development and testing

Do note `qwen2.5:1.5b` is not suited for complex tasks.

The Ollama server will run on `http://localhost:11434` by default and is compatible with the OpenAI API format that Mastra expects.

### Testing your Agent

You can read the [Mastra Documentation: Playground](https://mastra.ai/en/docs/local-dev/mastra-dev) to learn more on how to test your agent locally.
Before deploying your agent to Nosana, it's crucial to thoroughly test it locally to ensure everything works as expected. Follow these steps to validate your agent:

**Local Testing:**

1. **Start the development server** with `pnpm run dev` and navigate to `http://localhost:8080` in your browser
2. **Test your agent's conversation flow** by interacting with it through the chat interface
3. **Verify tool functionality** by triggering scenarios that call your custom tools
4. **Check error handling** by providing invalid inputs or testing edge cases
5. **Monitor the console logs** to ensure there are no runtime errors or warnings

**Docker Testing:**
After building your Docker container, test it locally before pushing to the registry:

```bash
# Build your container
docker build -t yourusername/agent-challenge:latest .

# Run it locally with environment variables
docker run -p 8080:8080 --env-file .env yourusername/agent-challenge:latest

# Test the containerized agent at http://localhost:8080
```

Ensure your agent responds correctly and all tools function properly within the containerized environment. This step is critical as the Nosana deployment will use this exact container.

### Submission Requirements

#### 1. Code Development

- Fork this repository and develop your AI agent
- Your agent must include at least one custom tool (function)
- Code must be well-documented and include clear setup instructions
- Include environment variable examples in a `.env.example` file

#### 2. Docker Container

- Create a `Dockerfile` for your agent
- Build and push your container to Docker Hub or GitHub Container Registry
- Container must be publicly accessible
- Include the container URL in your submission

##### Build, Run, Publish

Note: You'll need an account on [Dockerhub](https://hub.docker.com/)

```sh

# Build and tag
docker build -t yourusername/agent-challenge:latest .

# Run the container locally
docker run -p 8080:8080 yourusername/agent-challenge:latest

# Login
docker login

# Push
docker push yourusername/agent-challenge:latest
```

#### 3. Nosana Deployment

- Deploy your Docker container on Nosana
- Your agent must successfully run on the Nosana network
- Include the Nosana job ID or deployment link

##### Nosana Job Definition

We have included a Nosana job definition at <./nos_job_def/nosana_mastra.json>, that you can use to publish your agent to the Nosana network.

**A. Deploying using [@nosana/cli](https://github.com/nosana-ci/nosana-cli/)**

- Edit the file and add in your published docker image to the `image` property. `"image": "docker.io/yourusername/agent-challenge:latest"`
- Download and install the [@nosana/cli](https://github.com/nosana-ci/nosana-cli/)
- Load your wallet with some funds
  - Retrieve your address with: `nosana address`
  - Go to our [Discord](https://nosana.com/discord) and ask for some NOS and SOL to publish your job.
- Run: `nosana job post --file nosana_mastra.json --market nvidia-3060 --timeout 30`
- Go to the [Nosana Dashboard](https://dashboard.nosana.com/deploy) to see your job

**B. Deploying using the [Nosana Dashboard](https://dashboard.nosana.com/deploy)**

- Make sure you have https://phantom.com/, installed for your browser.
- Go to our [Discord](https://nosana.com/discord) and ask for some NOS and SOL to publish your job.
- Click the `Expand` button, on the [Nosana Dashboard](https://dashboard.nosana.com/deploy)
- Copy and Paste your edited Nosana Job Definition file into the Textarea
- Choose an appropriate GPU for the AI model that you are using
- Click `Deploy`

#### 4. Video Demo

- Record a 1-3 minute video demonstrating:
  - Your agent running on Nosana
  - Key features and functionality
  - Real-world use case demonstration
- Upload to YouTube, Loom, or similar platform

#### 5. Documentation

- Update this README with:
  - Agent description and purpose
  - Setup instructions
  - Environment variables required
  - Docker build and run commands
  - Example usage

### Submission Process

1. **Complete all requirements** listed above
2. **Commit all of your changes to the `main` branch of your forked repository**
   - All your code changes
   - Updated README
   - Link to your Docker container
   - Link to your video demo
   - Nosana deployment proof
3. **Social Media Post**: Share your submission on X (Twitter)
   - Tag @nosana_ai
   - Include a brief description of your agent
   - Add hashtag #NosanaAgentChallenge
4. **Finalize your submission on the <https://earn.superteam.fun/agent-challenge> page**

- Remember to add your forked GitHub repository link
- Remember to add a link to your X post.

### Judging Criteria

Submissions will be evaluated based on:

1. **Innovation** (25%)

   - Originality of the agent concept
   - Creative use of AI capabilities

2. **Technical Implementation** (25%)

   - Code quality and organization
   - Proper use of the Mastra framework
   - Efficient tool implementation

3. **Nosana Integration** (25%)

   - Successful deployment on Nosana
   - Resource efficiency
   - Stability and performance

4. **Real-World Impact** (25%)
   - Practical use cases
   - Potential for adoption
   - Value proposition

### Prizes

We’re awarding the **top 10 submissions**:

- 🥇 1st: $1,000 USDC
- 🥈 2nd: $750 USDC
- 🥉 3rd: $450 USDC
- 🏅 4th: $200 USDC
- 🔟 5th–10th: $100 USDC

All prizes are paid out directly to participants on [SuperTeam](https://superteam.fun)

### Resources

- [Nosana Documentation](https://docs.nosana.io)
- [Mastra Documentation](https://mastra.ai/docs)
- [Mastra Guide: Build an AI stock agent](https://mastra.ai/en/guides/guide/stock-agent)
- [Nosana CLI](https://github.com/nosana-ci/nosana-cli)
- [Docker Documentation](https://docs.docker.com)

### Support

- Join [Nosana Discord](https://nosana.com/discord) for technical support where we have dedicated [Builders Challenge Dev chat](https://discord.com/channels/236263424676331521/1354391113028337664) channel.
- Follow [@nosana_ai](https://x.com/nosana_ai) for updates.

### Important Notes

- Ensure your agent doesn't expose sensitive data
- Test thoroughly before submission
- Keep your Docker images lightweight
- Document all dependencies clearly
- Make your code reproducible
- You can vibe code it if you want 😉
- **Only one submission per participant**
- **Submissions that do not compile, and do not meet the specified requirements, will not be considered**
- **Deadline is: 9 July 2025, 12.01 PM**
- **Announcement will be announced about one week later, stay tuned for our socials for exact date**
- **Finalize your submission at [SuperTeam](https://earn.superteam.fun/agent-challenge)**

### Don’t Miss Nosana Builder Challenge Updates

Good luck, builders! We can't wait to see the innovative AI agents you create for the Nosana ecosystem.
**Happy Building!**
