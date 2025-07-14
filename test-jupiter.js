// Test file to verify Jupiter API integration
import { jupiterTokenTool } from './src/mastra/tools/jupiter-tool';
import { jupiterRecentTokensTool } from './src/mastra/tools/jupiter-recent-tool';

async function testJupiterIntegration() {
  console.log('Testing Jupiter API integration...');
  
  // Test specific token search
  console.log('\n1. Testing specific token search...');
  const tokenResult = await jupiterTokenTool.execute({
    context: {
      tokenMintAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' // Example SOL token
    }
  });
  
  console.log('Token search result:', JSON.stringify(tokenResult, null, 2));
  
  // Test recent tokens
  console.log('\n2. Testing recent tokens fetch...');
  const recentResult = await jupiterRecentTokensTool.execute({
    context: {
      limit: 5
    }
  });
  
  console.log('Recent tokens result:', JSON.stringify(recentResult, null, 2));
}

// Only run if executed directly
if (require.main === module) {
  testJupiterIntegration().catch(console.error);
}

export { testJupiterIntegration };
