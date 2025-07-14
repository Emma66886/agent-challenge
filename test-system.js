// Test suite to verify the merged functionality
import { jupiterTokenTool } from './src/mastra/tools/jupiter-tool';
import { extractSolanaAddressTool } from './src/mastra/tools/telegram-tool';
import { fileStorageTool } from './src/mastra/tools/file-storage-tool';

async function runTests() {
  console.log('🧪 Running SolHype Bot Integration Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Solana address extraction
  console.log('Test 1: Solana Address Extraction');
  console.log('=====================================');
  totalTests++;
  
  try {
    const testText = "Check out this token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU and this one: So11111111111111111111111111111111111111112";
    const result = await extractSolanaAddressTool.execute({
      context: { text: testText }
    });
    
    console.log('Input:', testText);
    console.log('Result:', result);
    
    if (result.found && result.addresses.length >= 2) {
      console.log('✅ PASSED: Found', result.addresses.length, 'addresses');
      passedTests++;
    } else {
      console.log('❌ FAILED: Expected to find 2 addresses');
    }
  } catch (error) {
    console.log('❌ ERROR:', error);
  }
  
  console.log('\n');
  
  // Test 2: Jupiter API integration
  console.log('Test 2: Jupiter API Integration');
  console.log('===============================');
  totalTests++;
  
  try {
    // Test with a known Solana token (SOL)
    const result = await jupiterTokenTool.execute({
      context: { tokenMintAddress: 'So11111111111111111111111111111111111111112' }
    });
    
    console.log('Token searched: So11111111111111111111111111111111111111112 (SOL)');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data && result.data.length > 0) {
      console.log('✅ PASSED: Successfully fetched token data');
      console.log('Token name:', result.data[0].name);
      console.log('Token symbol:', result.data[0].symbol);
      passedTests++;
    } else {
      console.log('❌ FAILED: Could not fetch token data');
    }
  } catch (error) {
    console.log('❌ ERROR:', error);
  }
  
  console.log('\n');
  
  // Test 3: File storage system
  console.log('Test 3: File Storage System');
  console.log('============================');
  totalTests++;
  
  try {
    // Test saving analysis result
    const testAnalysis = {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      score: 95,
      sentiment: 'Bullish',
      analysis_reason: 'Test analysis for SOL token',
      daily_volume: 1000000,
      market_cap: 50000000000,
      rank: 1
    };
    
    const saveResult = await fileStorageTool.execute({
      context: {
        action: 'save',
        analysisResult: testAnalysis
      }
    });
    
    console.log('Save result:', JSON.stringify(saveResult, null, 2));
    
    if (saveResult.success) {
      // Test loading analysis result
      const loadResult = await fileStorageTool.execute({
        context: { action: 'load' }
      });
      
      console.log('Load result:', JSON.stringify(loadResult, null, 2));
      
      if (loadResult.success && loadResult.data?.best_token?.mint === testAnalysis.mint) {
        console.log('✅ PASSED: File storage save/load works correctly');
        passedTests++;
      } else {
        console.log('❌ FAILED: Could not load saved data correctly');
      }
    } else {
      console.log('❌ FAILED: Could not save analysis data');
    }
  } catch (error) {
    console.log('❌ ERROR:', error);
  }
  
  console.log('\n');
  
  // Test 4: Environment variables check
  console.log('Test 4: Environment Variables Check');
  console.log('===================================');
  totalTests++;
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'TELEGRAM_BOT_TOKEN'
  ];
  
  const optionalEnvVars = [
    'TELEGRAM_ALERTS_GROUP_ID',
    'TWITTER_CONSUMER_KEY',
    'TWITTER_CONSUMER_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
  ];
  
  let envVarsPresent = 0;
  let requiredPresent = 0;
  
  console.log('Required environment variables:');
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Present`);
      requiredPresent++;
    } else {
      console.log(`❌ ${varName}: Missing`);
    }
  });
  
  console.log('\nOptional environment variables:');
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Present`);
      envVarsPresent++;
    } else {
      console.log(`⚠️  ${varName}: Not configured`);
    }
  });
  
  if (requiredPresent === requiredEnvVars.length) {
    console.log('✅ PASSED: All required environment variables are present');
    passedTests++;
  } else {
    console.log('❌ FAILED: Missing required environment variables');
  }
  
  console.log('\n');
  
  // Test Results Summary
  console.log('📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${(passedTests / totalTests * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The system is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above before deployment.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Configure missing environment variables');
  console.log('2. Test Telegram bot functionality');
  console.log('3. Test Twitter integration (if configured)');
  console.log('4. Deploy to production');
  console.log('5. Monitor logs for any issues');
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
