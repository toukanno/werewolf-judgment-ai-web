// 画像生成向けプロンプトビルダー
const ImagePromptBuilder = {
  _clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  },

  _inferSubject(text) {
    const lower = text.toLowerCase();
    const hasPerson = /(girl|woman|female|lady|character|少女|女性|女の子|キャラ|人物)/i.test(text);
    const isMale = /(male|man|boy|男性|男の子)/i.test(text);

    if (hasPerson && !isMale) {
      return "an original adult woman character (21+), elegant and expressive";
    }
    if (hasPerson && isMale) {
      return "an original adult character (21+), expressive and cinematic";
    }
    return "a cinematic original illustration with a clear visual focal point";
  },

  _buildMainPrompt(request) {
    const subject = this._inferSubject(request);
    const requestLine = this._clean(request) || "cute anime-style portrait with premium rendering";

    return [
      "masterpiece, best quality, ultra-detailed, commercial-grade anime illustration, cinematic art direction,",
      `${subject},`,
      `${requestLine},`,
      "original design inspired by mood only (not a direct copy), balanced composition,",
      "3/4 portrait framing, graceful pose, natural anatomy, accurate hands and fingers, symmetrical eyes,",
      "polished hair strands, refined eyelashes, subtle blush, glossy yet realistic skin shading,",
      "premium costume design with tasteful details, layered fabrics, realistic folds, clean accessories,",
      "golden-hour key light + soft rim light + ambient bounce light, volumetric light, depth haze,",
      "harmonized palette (warm highlights, cool shadows), rich contrast, cinematic depth of field,",
      "clean background storytelling with elegant bokeh and environmental context,",
      "high clarity linework, crisp focus on face and eyes, physically plausible shadows,",
      "tasteful and beautiful mood, non-explicit, sophisticated"
    ].join(" ");
  },

  _buildNegativePrompt() {
    return [
      "lowres, blurry, noisy, jpeg artifacts, bad anatomy, deformed body, mutated hands, extra fingers, missing fingers, fused fingers,",
      "cross-eye, asymmetrical eyes, malformed face, bad mouth, duplicate limbs, disconnected limbs, broken wrist,",
      "messy hair clumps, warped accessories, broken jewelry, distorted fabric, floating objects,",
      "flat lighting, overexposed highlights, crushed shadows, muddy colors, poor contrast,",
      "background glitches, text, watermark, logo, signature, frame,",
      "explicit nudity, pornographic, fetish focus, sexually explicit pose"
    ].join(" ");
  },

  _variation(base, mood) {
    return `${base} ${mood}`;
  },

  build(userRequest) {
    const main = this._buildMainPrompt(userRequest);
    const negative = this._buildNegativePrompt();

    const mystical = this._variation(main, "moonlit aura, iridescent particles, ethereal atmosphere, sacred glow");
    const dark = this._variation(main, "nocturnal noir mood, deep indigo shadows, dramatic backlight, tense atmosphere");
    const luxury = this._variation(main, "high-fashion editorial styling, luxurious materials, jewel-toned highlights, refined opulence");

    return [
      "Main Prompt (EN):",
      main,
      "",
      "Negative Prompt (EN):",
      negative,
      "",
      "Intent Summary (JP):",
      "成人キャラクターを主題に、映画的な光と高精細な質感で上品かつ可憐な雰囲気へ最適化。破綻しやすい部位を補強し、商用レベルの完成度を狙う構成。",
      "",
      "Variations:",
      `1. ${mystical}`,
      `2. ${dark}`,
      `3. ${luxury}`
    ].join("\n");
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ImagePromptBuilder;
}
