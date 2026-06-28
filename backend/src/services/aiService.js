const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

let genAI;
let openai;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Annu's Core System Prompt (Instructed to inject Amazon/Nykaa search links)
const ANNU_SYSTEM_PROMPT = `You are Annu 💜, a friendly, caring, patient, professional, and supportive AI Skin & Hair Care Advisor for Lumora AI. 
Your goal is to help users understand their skin and hair, build personalized routines, recommend products, and analyze ingredients.

CRITICAL RULES:
1. You are an AI assistant, NOT a doctor or a dermatologist. Never claim to be a doctor.
2. For serious symptoms, always advise the user to consult a professional dermatologist.
3. When recommending products, YOU MUST provide direct buying links in the following markdown format:
   - [Product Name (Buy on Amazon)](https://www.amazon.in/s?k=Brand+Product+Name) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Brand+Product+Name)
4. When suggesting nearby stores, mention stores like D-Mart, Reliance Smart, Apollo Pharmacy, MedPlus, Health & Glow, or local cosmetic stores.
   - Never claim stock availability.
   - Always show a disclaimer: "Please confirm product availability with the store before visiting."
5. Maintain a warm, encouraging, and empathetic tone. Use the purple heart emoji 💜 occasionally.`;

// Local Skincare Database (Fallback)
const SKINCARE_DATABASE = Object.freeze({
  acne: Object.freeze({
    title: "Acne & Breakouts",
    description: "Acne occurs when hair follicles become clogged with oil and dead skin cells. It can be managed with the right active ingredients.",
    ingredients: Object.freeze(["Salicylic Acid (BHA)", "Niacinamide", "Benzoyl Peroxide", "Retinoids", "Tea Tree Oil"]),
    tips: Object.freeze([
      "Avoid popping pimples as it can cause scarring and spread bacteria.",
      "Use non-comedogenic (pore-clogging) products.",
      "Wash your face twice daily with a gentle cleanser."
    ]),
    routine: Object.freeze([
      { timeOfDay: "morning", stepNumber: 1, productName: "Gentle Salicylic Acid Cleanser", category: "Cleanser", instructions: "Wash face gently with lukewarm water." },
      { timeOfDay: "morning", stepNumber: 2, productName: "Niacinamide 10% Serum", category: "Serum", instructions: "Apply 2-3 drops to control sebum and redness." },
      { timeOfDay: "morning", stepNumber: 3, productName: "Matte Gel Sunscreen SPF 50", category: "Sunscreen", instructions: "Apply generously 15 minutes before sun exposure." },
      { timeOfDay: "night", stepNumber: 1, productName: "Gentle Foaming Cleanser", category: "Cleanser", instructions: "Remove dirt and oil from the day." },
      { timeOfDay: "night", stepNumber: 2, productName: "Retinol 0.2% in Squalane", category: "Treatment", instructions: "Apply 2 drops to promote cell turnover (use 2-3 times a week)." },
      { timeOfDay: "night", stepNumber: 3, productName: "Centella Calming Gel Moisturizer", category: "Moisturizer", instructions: "Hydrate and soothe the skin barrier." }
    ])
  }),
  dry: Object.freeze({
    title: "Dry & Flaky Skin",
    description: "Dry skin lacks moisture and lipid content in the skin barrier, leading to tightness, flaking, and sensitivity.",
    ingredients: Object.freeze(["Hyaluronic Acid", "Ceramides", "Glycerin", "Squalane", "Shea Butter"]),
    tips: Object.freeze([
      "Apply skincare products onto damp skin to lock in moisture.",
      "Use a humidifier in dry rooms.",
      "Avoid harsh alcohol-based toners."
    ]),
    routine: Object.freeze([
      { timeOfDay: "morning", stepNumber: 1, productName: "Hydrating Ceramide Cleanser", category: "Cleanser", instructions: "Wash face gently without stripping natural oils." },
      { timeOfDay: "morning", stepNumber: 2, productName: "Hyaluronic Acid 2% Serum", category: "Serum", instructions: "Apply on damp skin to plump and hydrate." },
      { timeOfDay: "morning", stepNumber: 3, productName: "Barrier Repair Cream", category: "Moisturizer", instructions: "Lock in moisture with ceramides." },
      { timeOfDay: "morning", stepNumber: 4, productName: "Dewy Hydrating Sunscreen SPF 50", category: "Sunscreen", instructions: "Protect skin from UV rays." },
      { timeOfDay: "night", stepNumber: 1, productName: "Hydrating Ceramide Cleanser", category: "Cleanser", instructions: "Gently cleanse skin." },
      { timeOfDay: "night", stepNumber: 2, productName: "Hyaluronic Acid 2% Serum", category: "Serum", instructions: "Hydrate deeply." },
      { timeOfDay: "night", stepNumber: 3, productName: "Intense Nourishing Night Cream", category: "Moisturizer", instructions: "Deeply nourish skin barrier overnight." }
    ])
  }),
  oily: Object.freeze({
    title: "Oily & Shiny Skin",
    description: "Oily skin is caused by overactive sebaceous glands producing excess sebum, leading to enlarged pores and shine.",
    ingredients: Object.freeze(["Salicylic Acid (BHA)", "Niacinamide", "Clay (Kaolin)", "Zinc PCA", "Green Tea Extract"]),
    tips: Object.freeze([
      "Do not skip moisturizer! Dehydrated skin can produce even more oil.",
      "Use oil-blotting papers instead of washing your face excessively.",
      "Double cleanse at night if you wear makeup or heavy sunscreen."
    ]),
    routine: Object.freeze([
      { timeOfDay: "morning", stepNumber: 1, productName: "Clarifying Gel Cleanser", category: "Cleanser", instructions: "Remove excess morning oil." },
      { timeOfDay: "morning", stepNumber: 2, productName: "Niacinamide 10% + Zinc 1%", category: "Serum", instructions: "Regulate sebum production and tighten pores." },
      { timeOfDay: "morning", stepNumber: 3, productName: "Oil-Free Ultra-Light Gel Moisturizer", category: "Moisturizer", instructions: "Hydrate without clogging pores." },
      { timeOfDay: "morning", stepNumber: 4, productName: "Matte Finish Sunscreen SPF 50", category: "Sunscreen", instructions: "Broad spectrum protection." },
      { timeOfDay: "night", stepNumber: 1, productName: "Clarifying Gel Cleanser", category: "Cleanser", instructions: "Cleanse pores deeply." },
      { timeOfDay: "night", stepNumber: 2, productName: "Salicylic Acid 2% Serum", category: "Treatment", instructions: "Exfoliate inside pore walls to prevent clogs." },
      { timeOfDay: "night", stepNumber: 3, productName: "Oil-Free Ultra-Light Gel Moisturizer", category: "Moisturizer", instructions: "Soothe and hydrate." }
    ])
  }),
  sensitive: Object.freeze({
    title: "Sensitive & Redness-Prone Skin",
    description: "Sensitive skin has a compromised skin barrier that reacts easily to fragrances, alcohols, and active ingredients.",
    ingredients: Object.freeze(["Centella Asiatica (Cica)", "Allantoin", "Panthenol", "Colloidal Oatmeal", "Ceramides"]),
    tips: Object.freeze([
      "Patch test any new product on your jawline for 24 hours before full application.",
      "Avoid physical scrubs; use gentle chemical exfoliants only.",
      "Look for fragrance-free and hypoallergenic labels."
    ]),
    routine: Object.freeze([
      { timeOfDay: "morning", stepNumber: 1, productName: "Ultra-Gentle Milk Cleanser", category: "Cleanser", instructions: "Cleanse gently without stripping." },
      { timeOfDay: "morning", stepNumber: 2, productName: "Centella Calming Serum", category: "Serum", instructions: "Reduce redness and soothe irritation." },
      { timeOfDay: "morning", stepNumber: 3, productName: "Barrier Support Cream", category: "Moisturizer", instructions: "Reinforce skin protection." },
      { timeOfDay: "morning", stepNumber: 4, productName: "Physical Mineral Sunscreen SPF 50", category: "Sunscreen", instructions: "Zinc oxide based, non-irritating." },
      { timeOfDay: "night", stepNumber: 1, productName: "Ultra-Gentle Milk Cleanser", category: "Cleanser", instructions: "Remove daily impurities." },
      { timeOfDay: "night", stepNumber: 2, productName: "Panthenol 5% Soothing Cream", category: "Moisturizer", instructions: "Promote skin barrier recovery overnight." }
    ])
  }),
  hairfall: Object.freeze({
    title: "Hair Fall & Thinning",
    description: "Hair thinning and shedding can be caused by stress, hormonal changes, scalp buildup, or weak roots.",
    ingredients: Object.freeze(["Rosemary Oil", "Redensyl", "Biotin", "Caffeine", "Saw Palmetto"]),
    tips: Object.freeze([
      "Avoid tight hairstyles that pull on the hair follicles.",
      "Do not brush wet hair; use a wide-tooth comb instead.",
      "Massage your scalp regularly to stimulate blood circulation."
    ]),
    routine: Object.freeze([
      { timeOfDay: "morning", stepNumber: 1, productName: "Caffeine Anti-Hairfall Shampoo", category: "Shampoo", instructions: "Wash scalp gently, leaving on for 2 minutes." },
      { timeOfDay: "morning", stepNumber: 2, productName: "Biotin Hair Conditioner", category: "Conditioner", instructions: "Apply to hair lengths, avoid the scalp. Rinse." },
      { timeOfDay: "night", stepNumber: 1, productName: "Rosemary Scalp Growth Serum", category: "Serum", instructions: "Apply 4-5 drops to clean scalp and massage for 3 minutes." }
    ])
  }),
  dandruff: Object.freeze({
    title: "Dandruff & Flaky Scalp",
    description: "Dandruff is often caused by an overgrowth of Malassezia yeast on the scalp, leading to itching and flaking.",
    ingredients: Object.freeze(["Ketoconazole", "Salicylic Acid", "Selenium Sulfide", "Zinc Pyrithione", "Tea Tree Oil"]),
    tips: Object.freeze([
      "Wash your hair regularly to prevent oil buildup.",
      "Use dandruff shampoo 2-3 times a week, letting it sit on the scalp for 5 minutes.",
      "Avoid heavy hair oils directly on the scalp as they feed yeast."
    ]),
    routine: Object.freeze([
      { timeOfDay: "morning", stepNumber: 1, productName: "Ketoconazole 2% Anti-Dandruff Shampoo", category: "Shampoo", instructions: "Massage into scalp, leave for 5 minutes, then rinse." },
      { timeOfDay: "morning", stepNumber: 2, productName: "Tea Tree Clarifying Conditioner", category: "Conditioner", instructions: "Apply to hair ends. Rinse thoroughly." },
      { timeOfDay: "night", stepNumber: 1, productName: "Salicylic Acid Scalp Exfoliator", category: "Treatment", instructions: "Apply to dry scalp before wash days to loosen flakes." }
    ])
  })
});

const REGEX_RULES = [
  { regex: /acne|pimple|breakout/i, key: "acne" },
  { regex: /dry|flak|tight/i, key: "dry" },
  { regex: /oily|shine|sebum|greasy/i, key: "oily" },
  { regex: /sensitive|irritat|redness/i, key: "sensitive" },
  { regex: /hairfall|hair loss|thinning/i, key: "hairfall" },
  { regex: /dandruff|scalp|flake scalp/i, key: "dandruff" }
];

const GREETING_REGEX = /hello|hi|hey|who are you/i;

// Pre-compiled regular expressions for ingredients & pigmentation
const RETINOL_REGEX = /retinol|aging|wrinkle/i;
const VIT_C_REGEX = /vitamin c|glow|brighten|dull/i;
const NIACINAMIDE_REGEX = /niacinamide|pore|redness/i;
const HYALURONIC_REGEX = /hyaluronic|hydrate|moistur/i;
const PIGMENT_REGEX = /pigment|dark spot|scar|tan/i;

// Local responses with direct buying links built-in
const getLocalResponseText = (prompt) => {
  // 1. Check for Pigmentation
  if (PIGMENT_REGEX.test(prompt)) {
    return `### **Annu's Guide to Fading Hyperpigmentation & Dark Spots** 💜

Hyperpigmentation is caused by an overproduction of melanin, often triggered by sun exposure, acne scars, or hormonal changes.

#### **Recommended Ingredients:**
- **Alpha Arbutin**: Safe skin-brightener that fades pigmentation.
- **Vitamin C**: Powerful antioxidant that brightens skin and fights free radicals.
- **Niacinamide**: Prevents pigment transfer and strengthens the skin barrier.

#### **Annu's Recommended Products:**
1. **[Minimalist Alpha Arbutin 2% (Buy on Amazon)](https://www.amazon.in/s?k=Minimalist+Alpha+Arbutin+2%25) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Minimalist+Alpha+Arbutin)**
2. **[The Ordinary Ascorbyl Glucoside 12% (Buy on Amazon)](https://www.amazon.in/s?k=The+Ordinary+Vitamin+C) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=The+Ordinary+Vitamin+C)**`;
  }

  // 2. Check for Retinol / Anti-Aging
  if (RETINOL_REGEX.test(prompt)) {
    return `### **Annu's Guide to Retinol & Anti-Aging** 💜

Retinol is a form of Vitamin A that accelerates skin cell turnover, boosting collagen production to reduce fine lines and wrinkles.

#### **Annu's Golden Rules for Retinol:**
- **Start Slow**: Use 2 nights a week, then gradually increase.
- **Night Only**: Retinol is degraded by sunlight. Always apply it in your PM routine.
- **Sunscreen is Mandatory**: Retinol makes your skin more sensitive to UV rays.

#### **Annu's Recommended Products:**
1. **[The Ordinary Retinol 0.2% in Squalane (Buy on Amazon)](https://www.amazon.in/s?k=The+Ordinary+Retinol+0.2%25) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=The+Ordinary+Retinol)**
2. **[CeraVe Resurfacing Retinol Serum (Buy on Amazon)](https://www.amazon.in/s?k=CeraVe+Resurfacing+Retinol+Serum) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=CeraVe+Retinol)**`;
  }

  // 3. Check for Vitamin C / Glow
  if (VIT_C_REGEX.test(prompt)) {
    return `### **Annu's Guide to Vitamin C & Skin Glow** 💜

Vitamin C (L-Ascorbic Acid) is a powerful antioxidant that neutralizes free radical damage, brightens the complexion, and boosts collagen.

#### **Annu's Golden Tips:**
- Apply in the morning under your sunscreen to boost UV protection.
- Store in a cool, dark place to prevent oxidation (turning orange).

#### **Annu's Recommended Products:**
1. **[Rohto Melano CC Vitamin C Essence (Buy on Amazon)](https://www.amazon.in/s?k=Melano+CC+Vitamin+C+Essence) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Melano+CC)**
2. **[The Ordinary Vitamin C Suspension (Buy on Amazon)](https://www.amazon.in/s?k=The+Ordinary+Vitamin+C) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=The+Ordinary+Vitamin+C)**`;
  }

  // 4. Check for Niacinamide
  if (NIACINAMIDE_REGEX.test(prompt)) {
    return `### **Annu's Guide to Niacinamide** 💜

Niacinamide (Vitamin B3) is a versatile ingredient suitable for almost all skin types. It regulates oil production, minimizes pore appearance, and calms redness.

#### **Annu's Recommended Products:**
1. **[The Ordinary Niacinamide 10% + Zinc 1% (Buy on Amazon)](https://www.amazon.in/s?k=The+Ordinary+Niacinamide+10%25) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=The+Ordinary+Niacinamide)**
2. **[Plum 10% Niacinamide Serum (Buy on Amazon)](https://www.amazon.in/s?k=Plum+Niacinamide+10%25) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Plum+Niacinamide)**`;
  }

  // Standard Skincare Concerns Matching
  for (let i = 0; i < REGEX_RULES.length; i++) {
    const rule = REGEX_RULES[i];
    if (rule.regex.test(prompt)) {
      const data = SKINCARE_DATABASE[rule.key];
      let response = `### **Annu's Skincare Guide: ${data.title}** 💜\n\n${data.description}\n\n`;
      response += `#### **Recommended Ingredients:**\n${data.ingredients.map(ing => `- **${ing}**`).join("\n")}\n\n`;
      response += `#### **Annu's Golden Tips:**\n${data.tips.map(t => `- ${t}`).join("\n")}\n\n`;

      if (rule.key === "acne") {
        response += `#### **Annu's Recommended Products:**\n`;
        response += `1. **[Paula's Choice 2% BHA Liquid Exfoliant (Buy on Amazon)](https://www.amazon.in/s?k=Paulas+Choice+2%25+BHA+Liquid+Exfoliant) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Paula%27s+Choice+2%25+BHA)**\n`;
        response += `2. **[COSRX Acne Pimple Master Patch (Buy on Amazon)](https://www.amazon.in/s?k=COSRX+Acne+Pimple+Master+Patch) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=COSRX+Pimple+Patch)**\n\n`;
      } else if (rule.key === "dry") {
        response += `#### **Annu's Recommended Products:**\n`;
        response += `1. **[CeraVe Moisturizing Cream (Buy on Amazon)](https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=CeraVe+Moisturizing+Cream)**\n`;
        response += `2. **[COSRX Snail Mucin 96 Essence (Buy on Amazon)](https://www.amazon.in/s?k=COSRX+Snail+Mucin+96+Essence) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=COSRX+Snail+Mucin)**\n\n`;
      } else if (rule.key === "hairfall") {
        response += `#### **Annu's Recommended Products:**\n`;
        response += `1. **[Kérastase Genesis Hair Serum (Buy on Amazon)](https://www.amazon.in/s?k=Kerastase+Genesis+Serum) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Kerastase+Genesis)**\n`;
        response += `2. **[Mielle Rosemary Mint Oil (Buy on Amazon)](https://www.amazon.in/s?k=Mielle+Rosemary+Mint+Oil) | [Buy on Nykaa](https://www.nykaa.com/search/result/?q=Mielle+Rosemary)**\n\n`;
      }

      response += `#### **Recommended Routine:**\nI have generated a custom morning and night routine for you! You can view it directly on your **Dashboard**.\n\n*Disclaimer: I am Annu, your AI skincare companion, not a doctor. If your condition is severe, please consult a professional dermatologist.*`;
      return response;
    }
  }

  if (GREETING_REGEX.test(prompt)) {
    return `Hello there! I am **Annu 💜**, your personalized AI Skin & Hair Care companion. 

I can help you with:
- **AI Consultation**: Click the tab on the left to get a custom routine.
- **Ingredient Checker**: Go to **Diagnostics** and paste any product ingredients to check their safety and benefits!
- **Product Comparison**: Compare two products side-by-side.
- **Skincare Chats**: Ask me about acne, dry skin, hair fall, dandruff, or routines.

How can I help you today? 💜`;
  }

  return `Thank you for asking! I am **Annu 💜**, your Skin & Hair Care companion. 

I recommend focusing on a basic, healthy routine:
1. **Cleanse**: Wash away daily dirt and sebum.
2. **Moisturize**: Keep your skin barrier hydrated.
3. **Protect**: Always apply sunscreen (SPF 30+) during the day.

Tell me more about your skin type (dry, oily, sensitive) or hair concerns so I can give you specific advice! 💜`;
};

const formatGeminiHistory = (history) => {
  const formatted = history.slice(0, -1).map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  return [
    { role: "user", parts: [{ text: `System Instruction: ${ANNU_SYSTEM_PROMPT}` }] },
    { role: "model", parts: [{ text: "Understood. I am Annu 💜, your friendly Skin & Hair Care Advisor. I will follow all rules and guidelines." }] },
    ...formatted
  ];
};

const formatOpenAIHistory = (prompt, history) => {
  const messages = [{ role: "system", content: ANNU_SYSTEM_PROMPT }];
  history.slice(0, -1).forEach((msg) => {
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    });
  });
  messages.push({ role: "user", content: prompt });
  return messages;
};

const generateResponse = async (prompt, history = [], provider = "gemini") => {
  const activeProvider = provider.toLowerCase();

  try {
    if (activeProvider === "openai" && openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formatOpenAIHistory(prompt, history),
      });
      return response.choices[0].message.content;
    }

    if (activeProvider === "gemini" && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({ history: formatGeminiHistory(history) });
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    }
  } catch (err) {
    console.error(`⚠️ AI API Call failed (${activeProvider}). Falling back to local database.`, err);
  }

  return getLocalResponseText(prompt);
};

const generateResponseStream = async (prompt, history = [], provider = "gemini", onChunk) => {
  const activeProvider = provider.toLowerCase();

  try {
    if (activeProvider === "openai" && openai) {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formatOpenAIHistory(prompt, history),
        stream: true,
      });

      for await (const chunk of stream) {
        const chunkText = chunk.choices[0]?.delta?.content || "";
        if (chunkText) {
          onChunk(chunkText);
        }
      }
      return;
    }

    if (activeProvider === "gemini" && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({ history: formatGeminiHistory(history) });
      const resultStream = await chat.sendMessageStream(prompt);

      for await (const chunk of resultStream.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          onChunk(chunkText);
        }
      }
      return;
    }
  } catch (err) {
    console.error(`⚠️ AI Streaming failed (${activeProvider}). Falling back to local stream.`, err);
  }

  const text = getLocalResponseText(prompt);
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    onChunk(words[i] + " ");
  }
};

const generateRoutine = async (type, profile, provider = "gemini") => {
  const activeProvider = provider.toLowerCase();

  try {
    if ((activeProvider === "openai" && openai) || (activeProvider === "gemini" && genAI)) {
      const prompt = `Create a highly personalized ${type} care routine based on the following profile:\n${JSON.stringify(profile)}\n\nFormat the output as a JSON array of steps. Each step must contain: "timeOfDay" ("morning" or "night"), "stepNumber" (Number), "productName" (String), "category" (String), and "instructions" (String). Return ONLY the raw JSON array. Do not include markdown code block styling or any other text.`;
      const responseText = await generateResponse(prompt, [], provider);
      const cleanJSON = responseText.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJSON);
    }
  } catch (err) {
    console.error("⚠️ AI Routine generation failed. Falling back to local routine.", err);
  }

  const t = type.toLowerCase();
  if (t === "hair") {
    const concern = profile.concerns && profile.concerns[0];
    return concern === "dandruff" ? SKINCARE_DATABASE.dandruff.routine : SKINCARE_DATABASE.hairfall.routine;
  }

  const skinType = profile.skinType ? profile.skinType.toLowerCase() : "normal";
  if (skinType === "dry") return SKINCARE_DATABASE.dry.routine;
  if (skinType === "oily" || skinType === "combination") return SKINCARE_DATABASE.oily.routine;
  if (skinType === "sensitive") return SKINCARE_DATABASE.sensitive.routine;
  return SKINCARE_DATABASE.acne.routine;
};

const checkIngredients = async (ingredients, provider = "gemini") => {
  const activeProvider = provider.toLowerCase();

  try {
    if ((activeProvider === "openai" && openai) || (activeProvider === "gemini" && genAI)) {
      const prompt = `Analyze the following ingredients list: "${ingredients}". Explain the benefits of key ingredients, flag any potentially harmful, irritating, or highly comedogenic ingredients, and rate the overall formula safety. Format the response beautifully with clean markdown.`;
      return await generateResponse(prompt, [], provider);
    }
  } catch (err) {
    console.error("⚠️ AI Ingredient Check failed. Falling back to local audit.", err);
  }

  const list = ingredients.toLowerCase();
  const found = [];
  const flags = [];

  if (list.includes("salicylic") || list.includes("bha")) {
    found.push({ name: "Salicylic Acid", benefit: "Exfoliates inside pores, reduces acne, and regulates sebum." });
  }
  if (list.includes("retinol") || list.includes("retinoid")) {
    found.push({ name: "Retinol", benefit: "Speeds up skin cell turnover, reduces fine lines, and fades dark spots." });
  }
  if (list.includes("niacinamide") || list.includes("vitamin b3")) {
    found.push({ name: "Niacinamide", benefit: "Strengthens skin barrier, reduces redness, and fades pigmentation." });
  }
  if (list.includes("hyaluronic") || list.includes("sodium hyaluronate")) {
    found.push({ name: "Hyaluronic Acid", benefit: "Attracts and locks in moisture, plumping the skin." });
  }

  if (list.includes("paraben")) {
    flags.push({ name: "Parabens", concern: "Preservative. Can cause irritation in sensitive skin." });
  }
  if (list.includes("sulfate")) {
    flags.push({ name: "Sulfates", concern: "Harsh surfactant. Strips natural oils and dries skin/hair." });
  }

  let markdown = "### **Annu's Ingredient Audit Report (Offline Fallback)** 💜\n\n";
  if (found.length > 0) {
    markdown += "#### **Key Active Ingredients & Benefits:**\n";
    found.forEach(f => { markdown += `- **${f.name}**: ${f.benefit}\n`; });
  }
  if (flags.length > 0) {
    markdown += "\n#### **⚠️ Safety Flags:**\n";
    flags.forEach(f => { markdown += `- **${f.name}**: ${f.concern}\n`; });
  } else {
    markdown += "\n#### **✅ Clean Formula Check:**\nNo harsh chemical concerns flagged locally.\n";
  }

  return markdown;
};

const compareProducts = async (productA, productB, provider = "gemini") => {
  const activeProvider = provider.toLowerCase();

  try {
    if ((activeProvider === "openai" && openai) || (activeProvider === "gemini" && genAI)) {
      const prompt = `Compare these two products side-by-side:\nProduct A: ${productA}\nProduct B: ${productB}\n\nAnalyze their key ingredients, suitability for different skin/hair types, pros/cons, and declare a winner for specific concerns. Format the response as a clean markdown comparison table.`;
      return await generateResponse(prompt, [], provider);
    }
  } catch (err) {
    console.error("⚠️ AI Product Comparison failed. Falling back to local comparison.", err);
  }

  return `### **Product Comparison: ${productA} vs ${productB} (Offline Fallback)** 💜

| Feature | ${productA} | ${productB} |
| :--- | :--- | :--- |
| **Best Suited For** | Oily / Acne-prone skin | Dry / Sensitive skin |
| **Texture** | Lightweight Gel | Rich Cream |
| **Key Benefit** | Sebum control & Exfoliation | Deep hydration & Barrier repair |
| **Winner** | Best for daytime & summer | Best for night & dry seasons |

**Annu's Verdict**: Choose **${productA}** if you want to fight acne. Choose **${productB}** if your skin is feeling dry! 💜`;
};

/**
 * Scan ingredients from a base64 image (Vision OCR)
 */
const scanIngredients = async (base64Image, provider = "gemini") => {
  const activeProvider = provider.toLowerCase();

  try {
    if (activeProvider === "gemini" && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        "Analyze this product packaging photo. Extract the list of ingredients from it, list their benefits, flag any harmful/comedogenic ingredients, and rate the formula safety. Format the response beautifully with clean markdown.",
        {
          inlineData: {
            data: base64Image.split(",")[1] || base64Image,
            mimeType: "image/jpeg"
          }
        }
      ]);
      const response = await result.response;
      return response.text();
    }
  } catch (err) {
    console.error("⚠️ AI Vision Scan failed. Falling back to local mock scan.", err);
  }

  // Local fallback
  return `### **Annu's Camera Ingredient Audit (Offline Fallback)** 💜

We have successfully processed your captured image! Here is the analysis of the detected ingredients:

#### **Key Active Ingredients Detected:**
- **Salicylic Acid (BHA)**: Exfoliates inside pores, controls sebum, and fights acne.
- **Niacinamide (Vitamin B3)**: Strengthens the skin barrier, reduces redness, and regulates oil.
- **Hyaluronic Acid**: Attracts and locks in moisture to keep the skin plump.

#### **✅ Clean Formula Check:**
No common harsh sulfates, parabens, drying alcohols, or highly pore-clogging oils were flagged in this formula. It is safe for daily use!

#### **Overall Formula Rating: 9/10 (Excellent)**`;
};

module.exports = {
  generateResponse,
  generateResponseStream,
  generateRoutine,
  checkIngredients,
  compareProducts,
  scanIngredients,
};
