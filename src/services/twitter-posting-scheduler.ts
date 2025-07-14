import { mastra } from '../mastra';

export class TwitterPostingScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {}

  async runTwitterPosting() {
    if (this.isRunning) {
      console.log('Twitter posting already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Starting automated Twitter posting...`);

    try {
      const twitterAgent = mastra.getAgent('twitterPostingAgent');
      
      if (!twitterAgent) {
        throw new Error('Twitter posting agent not found');
      }

      // Run the Twitter posting process
      const result = await twitterAgent.generate([
        {
          role: 'user',
          content: `Perform automated Twitter posting:

          1. Fetch the latest 50 recent tokens from Jupiter API
          2. Analyze each token using the comprehensive scoring criteria
          3. Rank all tokens from best to worst performing
          4. Select the top 3 tokens with the highest scores
          5. Create an engaging tweet about the best performing token
          6. Post the tweet to Twitter using the Twitter API
          7. Include relevant hashtags and token information
          8. Make sure the tweet is engaging and follows Twitter best practices

          Provide a summary of the tweet posted and the token analysis.`
        }
      ]);

      console.log(`[${new Date().toISOString()}] Twitter posting completed successfully`);
      console.log('Twitter posting result summary:', result.text?.substring(0, 200) + '...');

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in Twitter posting:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    if (this.intervalId) {
      console.log('Twitter posting scheduler is already running');
      return;
    }

    console.log('Starting Twitter posting scheduler (every 30 minutes)...');
    
    // Run immediately on start
    this.runTwitterPosting();

    // Schedule to run every 30 minutes (1,800,000 milliseconds)
    this.intervalId = setInterval(() => {
      this.runTwitterPosting();
    }, 30 * 60 * 1000);

    console.log('Twitter posting scheduler started successfully');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Twitter posting scheduler stopped');
    }
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }

  getStatus() {
    return {
      active: this.isActive(),
      running: this.isRunning,
      nextRun: this.intervalId ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
    };
  }
}
