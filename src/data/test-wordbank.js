/**
 * Test script for WordBankManager
 * Run with: node src/data/test-wordbank.js
 */

import { WordBankManager } from './index.js';

async function testWordBankManager() {
  console.log('🧪 Testing WordBankManager...\n');

  try {
    // Test AI word bank
    console.log('📚 Testing AI word bank:');
    const aiStats = await WordBankManager.getStats('ai');
    console.log(`   Words: ${aiStats.wordCount}`);
    console.log(`   Has validation: ${aiStats.hasValidation}`);
    console.log(`   Has definitions: ${aiStats.hasDefinitions}\n`);

    // Test main word bank
    console.log('📖 Testing main word bank:');
    const mainStats = await WordBankManager.getStats('main');
    console.log(`   Words: ${mainStats.wordCount}`);
    console.log(`   Has validation: ${mainStats.hasValidation}`);
    console.log(`   Has definitions: ${mainStats.hasDefinitions}\n`);

    // Test word validation
    console.log('✅ Testing word validation:');
    const testWords = ['HELLO', 'WORLD', 'ZZZZZ', 'TESTS'];
    
    for (const word of testWords) {
      const isValidAI = await WordBankManager.isValidWord(word, 'ai');
      const isValidMain = await WordBankManager.isValidWord(word, 'main');
      console.log(`   "${word}": AI=${isValidAI}, Main=${isValidMain}`);
    }

    // Test random word generation
    console.log('\n🎲 Testing random word generation:');
    const aiWord = await WordBankManager.getRandomWord('ai');
    const mainWord = await WordBankManager.getRandomWord('main');
    console.log(`   AI random word: ${typeof aiWord === 'string' ? aiWord : aiWord.word}`);
    console.log(`   Main random word: ${typeof mainWord === 'string' ? mainWord : mainWord.word}`);

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWordBankManager();
}

export { testWordBankManager };