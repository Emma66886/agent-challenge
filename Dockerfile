FROM ollama/ollama:0.7.0

# Qwen2.5:1.5b - Docker
ENV API_BASE_URL=http://127.0.0.1:11434/api
ENV MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b

# Qwen2.5:32b = Docker
# ENV API_BASE_URL=http://127.0.0.1:11434/api
# ENV MODEL_NAME_AT_ENDPOINT=qwen2.5:32b

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
  curl \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY .env.docker package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build both the project and telegram bot
RUN pnpm run build && pnpm run build:telegram

# Create data directory for persistent storage
RUN mkdir -p data

# Expose ports
EXPOSE 8080

# Override the default entrypoint
ENTRYPOINT ["/bin/sh", "-c"]

# Start Ollama service and pull the model, then run the app
# Use APP_MODE environment variable to control which mode to run
# APP_MODE=web (default) - runs Mastra web interface
# APP_MODE=telegram - runs Telegram bot
CMD ["ollama serve & sleep 5 && ollama pull ${MODEL_NAME_AT_ENDPOINT} && if [ \"$APP_MODE\" = \"telegram\" ]; then node dist/telegram-bot.js; else node .mastra/output/index.mjs; fi"]
