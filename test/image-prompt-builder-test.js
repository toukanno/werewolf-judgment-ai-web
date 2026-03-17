const ImagePromptBuilder = require('../src/ai/image-prompt-builder');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(function run() {
  const input = '可愛い雰囲気の女性キャラ、夕景、上品なアニメイラスト';
  const out = ImagePromptBuilder.build(input);

  assert(out.includes('Main Prompt (EN):'), 'Main Prompt header missing');
  assert(out.includes('Negative Prompt (EN):'), 'Negative Prompt header missing');
  assert(out.includes('Intent Summary (JP):'), 'Intent Summary header missing');
  assert(out.includes('Variations:'), 'Variations header missing');
  assert(out.includes('adult woman character (21+)'), 'Adult guardrail missing');
  assert(out.includes('non-explicit'), 'Non-explicit constraint missing');

  console.log('image-prompt-builder test: passed');
})();
