import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { coinChatAgent } from "./agents/coin-chat-agent/coin-chat-agent";

export const mastra = new Mastra({
	agents: { 
		coinChatAgent
	},
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
