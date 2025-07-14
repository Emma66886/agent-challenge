import { mastra } from '../mastra';

export class TokenDiscoveryScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private telegramGroupChatId: string;

  constructor(telegramGroupChatId: string) {
    this.telegramGroupChatId = telegramGroupChatId;
  }

  async runTokenDiscovery() {
    if (this.isRunning) {
      console.log('Token discovery already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Starting automated token discovery...`);

    try {
      const discoveryAgent = mastra.getAgent('tokenDiscoveryAgent');
      
      if (!discoveryAgent) {
        throw new Error('Token discovery agent not found');
      }

      // Run the discovery and analysis process
      const result = await discoveryAgent.generate([
        {
          role: 'user',
          content: `Perform automated token discovery and analysis:

          1. Fetch the latest 50 recent tokens from Jupiter API
          2. Analyze each token using the comprehensive scoring criteria
          3. Rank all tokens from best to worst performing
          4. Load the previous analysis from storage
          5. Compare the current #1 token with the previous best token
          6. If the top token is different from the previous one:
             - Save the new analysis to storage
             - Send a notification to Telegram group: ${this.telegramGroupChatId}
          7. If the top token is the same:
             - Update the analysis in storage
             - Do not send notification

          Provide detailed analysis reasoning for the top 3 tokens and summary statistics.`
        }
      ]);

      console.log(`[${new Date().toISOString()}] Token discovery completed successfully`);
      console.log('Discovery result summary:', result.text?.substring(0, 200) + '...');

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in token discovery:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    if (this.intervalId) {
      console.log('Token discovery scheduler is already running');
      return;
    }

    console.log('Starting token discovery scheduler (every 5 minutes)...');
    
    // Run immediately on start
    this.runTokenDiscovery();

    // Schedule to run every 5 minutes (300,000 milliseconds)
    this.intervalId = setInterval(() => {
      this.runTokenDiscovery();
    }, 5 * 60 * 1000);

    console.log('Token discovery scheduler started successfully');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Token discovery scheduler stopped');
    }
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }

  getStatus() {
    return {
      active: this.isActive(),
      running: this.isRunning,
      groupChatId: this.telegramGroupChatId,
      nextRun: this.intervalId ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : null,
    };
  }
}
