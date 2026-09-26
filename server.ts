import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory cache for high-frequency astrology & lucky numbers calculations (TTL 1 hour)
const astroCache = new Map<string, { data: any; expiry: number }>();
function getCachedAstro(key: string) {
  const cached = astroCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    astroCache.delete(key);
    return null;
  }
  return cached.data;
}
function setCachedAstro(key: string, data: any, ttlMs: number = 3600000) {
  // Prune cache if overly large
  if (astroCache.size > 500) {
    const firstKey = astroCache.keys().next().value;
    if (firstKey) astroCache.delete(firstKey);
  }
  astroCache.set(key, { data, expiry: Date.now() + ttlMs });
}

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Mock responses will be used as fallback.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient multi-model fallback list
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

async function callGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
  topP?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
          temperature: params.temperature ?? 0.85,
          topP: params.topP ?? 0.95,
        },
      });

      const responseText = response.text || "";
      if (responseText.trim().length > 0) {
        return { text: responseText, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const statusCode = err?.status || err?.code || "503";
      // Gracefully switch to backup model without dumping raw error traces to stderr
      console.log(`[Gemini Info] Candidate ${model} temporarily unavailable (${statusCode}), switching to next model candidate...`);
      // Brief pause before trying next candidate model
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw lastError || new Error("All Gemini models are temporarily experiencing high demand");
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Sassy System Prompt Builder
function buildSassySystemPrompt(
  discipline: string,
  sassyLevel: string,
  userName?: string
): string {
  let sassInstruction = "";
  if (sassyLevel === "mild") {
    sassInstruction = "สไตล์เพื่อนสาวอบอุ่น ตรงไปตรงมา มีแซวเล็กๆ พอน่ารัก หวังดีและให้กำลังใจแบบผู้ใหญ่มีเหตุผล";
  } else if (sassyLevel === "savage") {
    sassInstruction = "สไตล์เพื่อนสาวปากแซ่บขั้นสุด ฟาดด้วยความจริงของโลกแบบไม่ไว้หน้า จิกกัดจุดอ่อนแบบตลกร้าย (Roast) ตบเรียกสติแรงๆ แต่เจตนาคือรักเพื่อน ไม่อยากให้เพื่อนโง่หรือหลงทาง";
  } else {
    // spicy / default
    sassInstruction = "สไตล์เพื่อนสาวตัวแม่ ปากแซ่บ จิกกัดตรงประเด็น พูดความจริงที่คนอื่นไม่กล้าพูด ประชดประชันแบบมีศิลปะและตลก แต่โคตรจริงใจ";
  }

  return `คุณคือ "แม่หมอลิลลี่" (Lilly the Sassy Oracle) หมอดูเพื่อนสาวตัวแม่ผู้รอบรู้ทั้ง 4 ศาสตร์พยากรณ์โบราณ (โหราศาสตร์จีน/ปาจื่อ/อี้จิง, ไพ่ยิปซี Tarot, ไพ่โอราเคิล Oracle, หินรูนอักษรนอร์ส Runes) ควบคู่กับจิตวิทยาเชิงพฤติกรรม (Behavioral Psychology) และหลักการทางวิทยาศาสตร์!

[บุคลิกและน้ำเสียง]:
- ${sassInstruction}
- ใช้สรรพนามเรียกตัวเองว่า "เจ๊", "ฉัน", "แม่หมอลิลลี่" และเรียกลูกดวง/ผู้ใช้ว่า "แก", "ชะนี", "เธอ", "คุณเพื่อน" หรือเรียกชื่อ "${userName || "แก"}"
- ไม่ส่งเสริมความงมงายแบบนั่งรอวาสนา! เชื่อว่า "ดวงดาวและไพ่สะท้อนจิตใต้สำนึกและแนวโน้มพฤติกรรม แต่ผลลัพธ์อยู่ที่ Action และสมองของแกเอง"
- สอดแทรกคำอธิบายทางจิตวิทยา (เช่น Confirmation Bias, Sunk Cost Fallacy, Attachment Style, Dopamine Seeking, Self-Sabotage, Healthy Boundaries) ผสานกับสัญลักษณ์โหราศาสตร์
- มีลูกเล่นภาษาพูดไทยที่สนุก สนทนาเป็นธรรมชาติ มีความจิกกัดแบบเพื่อนรัก (เช่น "ตื่นค่ะสาว", "ไพ่ไม่ได้โกหก แต่แกกำลังหลอกตัวเอง", "เค้าไม่ได้ไม่ว่าง เค้าแค่ไม่แคร์แก", "ดวงแกไม่ได้แย่ แกแค่ผัดวันประกันพรุ่ง")
- ศาสตร์ที่สนทนาปัจจุบัน: ${discipline || "ภาพรวม 4 ศาสตร์"}
- ตอบภาษาไทย เข้าใจง่าย ชัดเจน สนุก ไม่น่าเบื่อ และมีข้อคิดที่นำไปลงมือทำได้จริง (Actionable Truth)`;
}

// Continuous Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, discipline = "general", sassyLevel = "spicy", userName, contextData } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const systemPrompt = buildSassySystemPrompt(discipline, sassyLevel, userName);

  // Format chat history
  const conversationHistory = messages.map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  // If there is contextData, prefix to the latest user message
  if (contextData && conversationHistory.length > 0) {
    const lastIndex = conversationHistory.length - 1;
    if (conversationHistory[lastIndex].role === "user") {
      conversationHistory[lastIndex].parts[0].text =
        `[บริบทดวง/ไพ่ที่เปิดได้: ${JSON.stringify(contextData)}]\n` +
        conversationHistory[lastIndex].parts[0].text;
    }
  }

  try {
    const result = await callGeminiWithFallback({
      contents: conversationHistory,
      systemInstruction: systemPrompt,
      temperature: 0.85,
    });

    const reply = result.text || "โอ๊ยแก จักรวาลสัญญาณขัดข้องแป๊บ เอาใหม่อีกทีซิ!";
    return res.json({ reply });
  } catch (error: any) {
    console.log("[Chat API] Graceful fallback activated:", error?.message || "high demand");
    const lastUserQuery = messages[messages.length - 1]?.content || "";
    const fallbackReply = `ฟังนะแก เรื่อง "${lastUserQuery.slice(0, 50)}" ที่แกถามเนี่ย สรุปสั้นๆ ให้ตาสว่างคือ: ดวงดาวมันเป็นแค่แผนที่ แต่คนกุมพวงมาลัยคือตัวแกเอง! หยุดเอาเวลาไปนั่งกังวลกับสิ่งที่ยังไม่เกิด หายใจเข้าลึกๆ แล้วลงมือแก้ปัญหาชิ้นแรกให้เสร็จก่อนบ่ายนี้เดี๋ยวนี้เลยย่ะ! 💅✨`;
    return res.json({ reply: fallbackReply, fallback: true });
  }
});

// Deep Dive Reading Analysis Endpoint
app.post("/api/gemini/reading", async (req, res) => {
  const {
    discipline,
    topic,
    userQuestion,
    itemsSelected, // Cards/Runes/Chinese Zodiac elements
    sassyLevel = "spicy",
    depthTier = "standard", // 'quick' (5 coins), 'standard' (10 coins), 'deep_soul' (25 coins)
    userInfo = {},
    pastReadings = [], // Cross-reading history for karmic thread continuity
    karmicThread = {},
  } = req.body;

  let depthDirective = "";
  if (depthTier === "quick") {
    depthDirective = `
[ระดับความลึก: คำทำนายรวบรัด (Quick Summary - 5 Coins)]
- ตอบกระชับ ตรงประเด็น สั้นได้ใจความ ไม่ต้องแบ่งหัวข้อยืดยาว
- ความยาวรวมประมาณ 3-4 ย่อหน้าสั้นๆ
- โครงสร้าง:
# ⚡ สรุปดวงด่วน: [หัวข้อสั้นๆ]
## 🎯 แก่นแท้สั้นๆ: [วิเคราะห์ตรงประเด็น ไม่เกิน 3 บรรทัด]
## ⚠️ จุดเตือน 1 ข้อที่ต้องระวังทันที: [คำเตือนสติแบบเพื่อนสาว]
## 🐾 Action สั้นๆ วันนี้: [สิ่งที่ต้องทำทันที 1 ข้อ]
`;
  } else if (depthTier === "deep_soul") {
    depthDirective = `
[ระดับความลึก: ผ่าจิตวิญญาณระดับลึกสุดขีด (Ultra Deep Psycho-Spiritual - 25 Coins)]
- วิเคราะห์ละเอียดประณีตขั้นสูงสุด ผ่าทะลุภาพลวงตา ลึกถึงระดับจิตใต้สำนึก ปมวัยเด็ก (Inner Child) และ Karmic Loop
- ระบุช่วงเวลาไทม์ไลน์ 3 ระยะ (ระยะสั้น 7 วัน / ระยะกลาง 1 เดือน / ระยะยาว 3 เดือน)
- แนะนำ Micro-Ritual เชิงจิตวิทยาปลดล็อกเฉพาะบุคคล
- โครงสร้างแบบพรีเมียม:
# 👑 [มหาคัมภีร์เจาะลึกชะตา & ถอดรหัสจิตวิญญาณ]
## 🌑 1. Shadow Self & The Unconscious Loop (เงาในใจและปมที่ซ่อนไว้)
[วิเคราะห์กลไกป้องกันตัวเอง Defense Mechanism, ปมความกลัวที่ฝังแน่น และสิ่งที่ผู้ใช้ปฏิเสธที่จะมอง]

## 🎴 2. การถอดรหัสเชิงสัญลักษณ์ชั้นสูง & สัมพันธ์กับไพ่เดิม (Esoteric & Symbolic Breakdown)
[ตีความความเชื่อมโยงของไพ่/สัญลักษณ์ที่ได้ (${JSON.stringify(itemsSelected)}) อย่างลึกซึ้ง ธาตุ สัมพันธภาพ และเปรียบเทียบกับคำทำนายเดิมที่เคยเปิด]

## ⏳ 3. ไทม์ไลน์คลื่นพลังงาน 3 ระยะ (Cosmic Timeline Matrix)
- 📅 **ระยะ 7 วันนี้**: [พลังงานเฉพาะหน้า สิ่งที่ต้องเผชิญและวิธีรับมือ]
- 📅 **ระยะ 1 เดือนข้างหน้า**: [จุดเปลี่ยนสำคัญ ทางแยกที่ต้องตัดสินใจ]
- 📅 **ระยะ 3 เดือนข้างหน้า**: [ผลลัพธ์จาก Action ของวันนี้ หากเปลี่ยนพฤติกรรมสำเร็จ]

## 🧠 4. วินิจฉัยเชิงจิตวิทยาพฤติกรรม (Cognitive & Behavioral Diagnosis)
[ระบุ Cognitive Biases ที่กำลังครอบงำ เช่น Sunk Cost Fallacy, Fear of Missing Out, Confirmation Bias, People Pleasing พร้อมวิธีคิดลบล้าง]

## 💅 5. หมัดฮุกเพื่อนสาวตัวแม่ (Ultimate Bestie Roast & Awakening)
[จิกกัดตบเรียกสติขั้นสุด ฟาดด้วยความจริงอย่างมีชั้นเชิง คมกริบ น้ำตาซึมแต่ขอบคุณที่พูดตรงๆ]

## 🕯️ 6. พิธีกรรมจิตวิทยาปลดล็อก (Personal Micro-Action Ritual)
[แอ็กชันทางจิตวิทยา 3 ขั้นตอน เช่น การเขียนจดหมายเผาทำลาย, การจัดพื้นที่ส่วนตัว, หรือคำปฏิญาณหน้ากระจก]

## 🌟 Soul Alignment Index: [คะแนนความพร้อมของดวงวิญญาณ เช่น 92%]
## 💬 Cosmic Key Mantra: "[ประโยคทองคำปลดล็อกชีวิต 1 ประโยค]"
`;
  } else {
    // Standard (10 coins)
    depthDirective = `
[ระดับความลึก: วิเคราะห์มาตรฐาน (Deep Dive 5 มิติ - 10 Coins)]
- โครงสร้าง 5 หัวข้อครบถ้วน ผสานศาสตร์พยากรณ์ จิตวิทยา และสไตล์เพื่อนสาว
- โครงสร้าง:
# 🔮 [หัวข้อดวงสไตล์เพื่อนสาวแซ่บๆ]
## ⚡ 1. The Raw Truth (แก่นแท้ของความจริงที่ต้องยอมรับ)
- ฟาดด้วยข้อเท็จจริงไม่อ้อมค้อม จิกกัดสัจธรรมเบาๆ

## 🎴 2. การถอดรหัสเชิงสัญลักษณ์ & ความเชื่อมโยงของดวง
- อธิบายความหมายของสัญลักษณ์/ไพ่/ธาตุ/หินรูนที่เปิดได้ (${JSON.stringify(itemsSelected)}) ให้ตรงตามแม่แบบไพ่ต้นฉบับ
- เชื่อมโยงกับประวัติดวงที่เคยเปิดมาแล้ว

## 🧠 3. มุมมองจิตวิทยาและวิทยาศาสตร์ (Psychological Insight)
- วิเคราะห์ว่ากลไกทางจิตใจ อารมณ์ หรือพฤติกรรมอะไรที่กำลังขับเคลื่อนสถานการณ์นี้ (เช่น Sunk Cost, Ego, Fear of Rejection, Confirmation Bias)

## 💅 4. หมัดฮุกเพื่อนสาว (Sassy Bestie Roast & Reality Check)
- ประโยคเด็ดตบเรียกสติ คมกริบ แสบๆ คันๆ แต่น่ารัก

## 🚀 5. Action Plan 3 ข้อที่ต้องทำทันที (ไม่ใช่นั่งมโน)
1. ...
2. ...
3. ...

## 🌟 Soul Readiness Score: [ระบุตัวเลขเป็น % เช่น 78%]
## 💬 Sassy Affirmation: "[คำคมเรียกสติสั้นๆ 1 ประโยค]"
`;
  }

  // Format past readings summary for Gemini prompt
  const pastReadingsSummary = Array.isArray(pastReadings) && pastReadings.length > 0
    ? pastReadings.slice(0, 3).map((pr: any, idx: number) => {
        const pastCards = Array.isArray(pr.itemsSelected)
          ? pr.itemsSelected.map((i: any) => i.nameTh || i.name || i.symbol).join(', ')
          : 'ไพ่เดิม';
        return `[ครั้งก่อนหน้า #${idx + 1} (${pr.discipline || 'ดวง'}): หัวข้อ "${pr.topic}" | ไพ่: ${pastCards} | คำถาม: "${pr.question || 'ภาพรวม'}"]`;
      }).join('\n')
    : 'ยังไม่มีประวัติดวงก่อนหน้านี้ (เป็นการเปิดไพ่ครั้งแรกในระบบ LINE Mini App)';

  let systemPrompt = "";
  if (discipline === "oracle") {
    systemPrompt = `คุณคือ "The Honest Cat Oracle" (หมอดูแมวดำเพื่อนแท้ปากแซ่บ) 
โทนเสียง: พูดตรงแบบกู/มึง กวนได้แต่ต้องมีแก่น ไม่ด่าซ้ำเติม ไม่ข่มขู่ ไม่ฟันธงชีวิต และเรื่องสุขภาพไม่ใช่การวินิจฉัย

[กฎสำคัญที่สุดเพื่อคุณภาพคำทำนาย]:
1. **ห้ามตอบวนซ้ำซาก ห้ามใช้โครงประโยคสำเร็จรูปเดิมๆ**: คำทำนายต้องแปลกใหม่ เจาะจงตามบุคลิกของไพ่แต่ละใบที่เปิดได้จริง!
2. **ต้องตรงกับไพ่ต้นฉบับที่เปิด**: ดึงสัญลักษณ์ คีย์เวิร์ด และเนื้อหาแท้จริงของไพ่โอราเคิลแมว (${JSON.stringify(itemsSelected)}) มาตีความให้ลึกซึ้ง
3. **เชื่อมโยงกับคำตอบ/ไพ่ที่ลูกดวงดูไปแล้ว**: อ้างอิงประวัติดวงก่อนหน้าเพื่อดูพัฒนาการหรือพฤติกรรมวนลูป
ประวัติดวงเดิม:
${pastReadingsSummary}

${depthDirective}
`;
  } else {
    systemPrompt = `${buildSassySystemPrompt(discipline, sassyLevel, userInfo.name)}

[กฎสำคัญที่สุดเพื่อคุณภาพคำทำนาย]:
1. **ห้ามตอบวนซ้ำซาก ห้ามใช้โครงประโยคสำเร็จรูปเดิมๆ**: คำทำนายต้องมีความสดใหม่ มีมิติเฉพาะตัว ไม่พูดลอยๆ หรือใช้แพทเทิร์นจำเจ
2. **ต้องตรงกับความหมายของไพ่ต้นฉบับที่เปิด**: วิเคราะห์ตามสัญลักษณ์ คีย์เวิร์ด ธาตุ และด้านมืด/ด้านสว่างของไพ่ (${JSON.stringify(itemsSelected)})
3. **เชื่อมโยงกับคำตอบหรือไพ่คำทำนายเดิมที่ลูกดวงเคยดูไปแล้ว**:
${pastReadingsSummary}
ชี้ให้เห็นว่าทำไมไพ่ใบนี้ถึงปรากฏขึ้นมาต่อจากไพ่เดิม จักรวาลกำลังเน้นย้ำประเด็นอะไรที่ผู้ใช้ยังไม่ยอมแก้

${depthDirective}
`;
  }

  const prompt = `ผู้ใช้: ${userInfo.name || "ลูกดวง"}
วันเดือนปีเกิด/ข้อมูล: ${JSON.stringify(userInfo)}
ศาสตร์ที่ดู: ${discipline}
หัวข้อ: ${topic || "ทั่วไป"}
ระดับความลึกที่เลือก: ${depthTier} (${depthTier === 'quick' ? '5 coins' : depthTier === 'deep_soul' ? '25 coins' : '10 coins'})
คำถามในใจ: ${userQuestion || "อยากรู้ว่าช่วงนี้ต้องระวังอะไรและจะเอายังไงต่อกับชีวิต"}
สิ่งที่จับได้รอบนี้: ${JSON.stringify(itemsSelected)}

ประวัติดวงที่เคยเปิดสะสมในระบบ LINE Mini App:
${pastReadingsSummary}

ช่วยวิเคราะห์ดวงให้หน่อย ขอแบบถึงพริกถึงขิง ตรงตามความหมายไพ่ต้นฉบับ ไม่ซ้ำซาก ไม่วนลูป และเชื่อมโยงกับเรื่องที่เคยดูไปแล้ว!`;

  try {
    const result = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: systemPrompt,
      temperature: 0.88,
    });

    return res.json({
      reading: result.text,
      depthTier,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.log("[Reading API] Graceful dynamic fallback activated:", error?.message || "high demand");
    
    // High-veracity dynamic fallback that directly parses authentic card symbols & past history
    const fallbackReading = generateAuthenticDynamicReading({
      discipline,
      topic,
      userQuestion,
      itemsSelected,
      depthTier,
      pastReadings,
    });

    return res.json({
      reading: fallbackReading,
      depthTier,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
});

// Dynamic Authentic Reading Generator (Resilient, Non-Repetitive, Card-Accurate)
function generateAuthenticDynamicReading(params: {
  discipline: string;
  topic: string;
  userQuestion: string;
  itemsSelected: any;
  depthTier: string;
  pastReadings?: any[];
}): string {
  const { discipline, topic, userQuestion, itemsSelected, depthTier, pastReadings = [] } = params;

  // Extract card metadata
  const cardsList = Array.isArray(itemsSelected) ? itemsSelected : [itemsSelected];
  const primaryCard = cardsList[0] || {};
  const cardName = primaryCard.nameTh || primaryCard.name || primaryCard.titleTh || primaryCard.symbol || "ไพ่เปิดทางชะตา";
  const cardElement = primaryCard.element || "ธาตุแห่งจิตวิญญาณ";
  const cardKeywords = Array.isArray(primaryCard.keywords) ? primaryCard.keywords.join(", ") : (primaryCard.meaning || "สัจธรรมตรงหน้า");
  const uprightMeaning = primaryCard.uprightMeaning || primaryCard.judgment || primaryCard.personality || "พลังงานเปิดกว้างพร้อมเดินหน้า";
  const reversedMeaning = primaryCard.reversedMeaning || primaryCard.psychologicalBlindspot || "การยึดติดหรือความประมาท";
  const sassyQuote = primaryCard.sassyInsight || primaryCard.sassyQuote || primaryCard.sassyCritique || primaryCard.sassyRealWorldAdvice || "หยุดคิดวนแล้วเริ่มก้าวแรกเดี๋ยวนี้ย่ะ!";

  // Past readings relationship link
  let pastConnection = "";
  if (pastReadings.length > 0) {
    const lastReading = pastReadings[0];
    const prevCards = Array.isArray(lastReading.itemsSelected)
      ? lastReading.itemsSelected.map((i: any) => i.nameTh || i.name || i.symbol).join(', ')
      : 'ไพ่รอบก่อน';
    pastConnection = `รอบก่อนแกเพิ่งเปิดได้ "${prevCards}" ในหัวข้อ "${lastReading.topic || 'ทั่วไป'}" มาวันนี้จักรวาลส่ง "${cardName}" มาตอกย้ำอีกรอบ แปลว่าแกยังไม่ได้ลงมือแก้ที่ต้นเหตุจริงๆ สัญญาณชะตามันร้อยเรียงกันชัดเจนมาก!`;
  } else {
    pastConnection = `นี่คือไพ่ใบแรกในสายใยชะตาของคุณ ไพ่ "${cardName}" เปิดตัวขึ้นมาเพื่อเป็นหมุดหมายเริ่มต้นการตาสว่าง`;
  }

  if (depthTier === "quick") {
    return `# ⚡ สรุปดวงด่วน: ${cardName} (${cardElement})
## 🎯 แก่นแท้สั้นๆ:
ไพ่ ${cardName} (${cardKeywords}) ส่งสัญญาณตรงมาที่คำถามของคุณ: "${userQuestion || topic}" ความหมายหลักคือ "${uprightMeaning}" เลิกเอาความกลัวในอดีตมาขังปัจจุบันได้แล้ว

## ⚠️ จุดเตือน 1 ข้อที่ต้องระวังทันที:
ระวัง "${reversedMeaning}" อย่าใจดีจนตัวเองเดือดร้อน และอย่าผัดวันประกันพรุ่ง

## 🐾 Action สั้นๆ วันนี้:
${sassyQuote}`;
  }

  if (depthTier === "deep_soul") {
    return `# 👑 มหาคัมภีร์เจาะลึกชะตา & ถอดรหัสจิตวิญญาณ: ${cardName}
## 🌑 1. Shadow Self & The Unconscious Loop (เงาในใจและปมที่ซ่อนไว้)
${pastConnection} ไพ่ ${cardName} ชี้ลึกถึงจิตใต้สำนึกว่าคุณมักสร้างกลไกป้องกันตัวจาก "${reversedMeaning}" คุณกลัวการถูกปฏิเสธจนเลือกที่จะยอมเหนื่อยคนเดียว

## 🎴 2. การถอดรหัสเชิงสัญลักษณ์ชั้นสูง & สัมพันธ์กับไพ่เดิม
- **สัญลักษณ์หลัก**: ${cardName} (${cardElement})
- **คีย์เวิร์ดถอดรหัส**: ${cardKeywords}
- **ด้านสว่าง (Light Aspect)**: ${uprightMeaning}
- **ด้านมืดที่ต้องระวัง (Shadow Aspect)**: ${reversedMeaning}
พลังงานของ ${cardElement} กำลังชำระล้างความลังเลใจ ให้พื้นที่กับความเด็ดขาดที่แท้จริง

## ⏳ 3. ไทม์ไลน์คลื่นพลังงาน 3 ระยะ (Cosmic Timeline Matrix)
- 📅 **ระยะ 7 วันนี้**: พลังของ ${cardName} จะทดสอบขอบเขต (Boundaries) ของคุณ จะมีคนหรือสถานการณ์เข้ามาขอร้อง จงกล้าปฏิเสธ
- 📅 **ระยะ 1 เดือนข้างหน้า**: จุดเปลี่ยนสำคัญเรื่อง ${topic} เมื่องานหรือความสัมพันธ์ที่ Toxic หลุดพ้นไป โอกาสทองจะวิ่งเข้ามาแทนที่
- 📅 **ระยะ 3 เดือนข้างหน้า**: ผลลัพธ์จากการเปลี่ยนพฤติกรรมจะทำให้คุณยืนหยัดได้อย่างมั่นคง มีเสถียรภาพและภูมิใจในตัวเอง

## 🧠 4. วินิจฉัยเชิงจิตวิทยาพฤติกรรม (Cognitive & Behavioral Diagnosis)
พบสัญญาณของ "Hyper-Responsibility" แบกความรับผิดชอบที่ไม่ใช่ของตนเอง ให้ฝึกตระหนักรู้ว่าคุณควบคุมได้เฉพาะการกระทำของตัวเอง ไม่ใช่ความรู้สึกของคนทั้งโลก

## 💅 5. หมัดฮุกเพื่อนสาวตัวแม่ (Ultimate Bestie Roast & Awakening)
"${sassyQuote}" เลิกเป็นคนดีที่ทุกคนรัก แต่ตัวเองกลับหมดแรงได้แล้วค่ะสาว! รักตัวเองก่อนไม่ใช่เรื่องเห็นแก่ตัว!

## 🕯️ 6. พิธีกรรมจิตวิทยาปลดล็อก (Personal Micro-Action Ritual)
1. เขียนสิ่งที่ทำให้คุณเสียพลังงานลงกระดาษ 1 แผ่น แล้วฉีกทิ้ง
2. เคลียร์สิ่งของรกๆ บนโต๊ะทำงานหรือกระเป๋าสตางค์ เพื่อเปิดรับพลังงานใหม่
3. กล่าวคำขอบคุณตัวเองหน้ากระจกก่อนนอน 3 วันติดต่อกัน

## 🌟 Soul Alignment Index: 94%
## 💬 Cosmic Key Mantra: "ฉันเป็นผู้กำหนดทิศทางชีวิตตัวเอง สติมา ปัญญาเกิด สำเร็จแน่นอน!"`;
  }

  // Standard 5 Dimensions (10 coins)
  if (discipline === "oracle") {
    return `# 🐱 ${cardName}
## 💬 1. คำตอบแบบกู/มึง
เรื่องที่มึงถามว่า "${userQuestion || topic}" กูจะบอกตรงๆ นะ: ${pastConnection} ไพ่โอราเคิลใบนี้สื่อถึง "${cardKeywords}" ความจริงคือ "${uprightMeaning}" มึงไม่ต้องไปโทษใครเลย ทุกอย่างขึ้นอยู่กับความกล้าของมึงเอง

## 🪞 2. ภาพกำลังสะท้อนอะไร
ไพ่สะท้อนว่ามึงกำลังติดกับดัก "${reversedMeaning}" มึงรู้ว่าอะไรถูกอะไรผิด แต่ชอบหาข้ออ้างผัดวันประกันพรุ่ง

## 🐾 3. มึงควรทำอะไรต่อ
1. ตัดสิ่งที่ไม่จำเป็นออกไป 1 อย่างวันนี้
2. ลงมือทำข้อที่ยากที่สุดให้เสร็จทันที
3. ${sassyQuote}

## ⚡ 4. เจาะลึกจิตใต้สำนึก (Psychological Key)
ปลดล็อกความกลัวความผิดพลาด จำไว้ว่าคนที่ทำอะไรไม่เคยพลาด คือคนที่ไม่เคยลงมือทำอะไรเลย

## 🎯 5. ประโยคสรุปเจ็บๆ แต่มีประโยชน์
"ความจริงไม่เคยทำร้ายใคร มีแต่มโนของมึงเองนั่นแหละที่ข่วนหัวใจตัวเอง!"`;
  }

  return `# 🔮 ถอดรหัสชะตา: ${cardName} (${cardElement})
## ⚡ 1. The Raw Truth (แก่นแท้ของความจริงที่ต้องยอมรับ)
${pastConnection} ความจริงจากไพ่ ${cardName} ชี้ชัดเรื่อง ${topic}: "${uprightMeaning}" ปัญหาไม่ได้อยู่ที่โอกาส แต่อยู่ที่แกมัวแต่กลัวจนไม่กล้าก้าวขาออกมา

## 🎴 2. การถอดรหัสเชิงสัญลักษณ์ & ความเชื่อมโยงของดวง
ไพ่ ${cardName} สังกัดธาตุ ${cardElement} โดดเด่นด้วยแก่นสาร: ${cardKeywords} พลังงานด้านตรงชี้ถึงความสำเร็จ แต่ต้องระวังด้านกลับหัวคือ "${reversedMeaning}"

## 🧠 3. มุมมองจิตวิทยาและวิทยาศาสตร์ (Psychological Insight)
เข้าข่าย "Self-Limiting Belief" ที่แกเผลอตั้งเพดานความสามารถให้ตัวเอง ให้มองข้ามความกลัวและยึดถือ Fact มากกว่า Feeling

## 💅 4. หมัดฮุกเพื่อนสาว (Sassy Bestie Roast & Reality Check)
"${sassyQuote}" ดวงเปิดให้ขนาดนี้แล้ว ถ้ายังนอนอืดไถจอไม่ขยับ ก็อย่าบ่นว่าทำไมคนอื่นเขาแซงหน้าไปนะจ๊ะ!

## 🚀 5. Action Plan 3 ข้อที่ต้องทำทันที
1. เคลียร์สิ่งค้างคาเกี่ยวกับ ${topic} ให้เสร็จ 1 เรื่องก่อนเที่ยง
2. ตั้งขอบเขตให้ชัดเจน ไม่รับปากเรื่องที่ไม่อยากทำ
3. ให้รางวัลตัวเองเพื่อเพิ่มสารโดพามีนในสมองเมื่อทำตามเป้าสำเร็จ

## 🌟 Soul Readiness Score: 88%
## 💬 Sassy Affirmation: "ฉันพร้อมคว้าความสำเร็จด้วยสติ ความมั่นใจ และกรงเล็บที่ไม่ยอมแพ้!"`;
}

// Daily Personalized Horoscope Endpoint
app.post("/api/gemini/daily-fortune", async (req, res) => {
  const {
    name = "ลูกดวง",
    zodiac = "ราศีเมษ (Aries)",
    dayOfBirth = "วันจันทร์",
    focusArea = "ภาพรวมชีวิตและความก้าวหน้า",
    sassyLevel = "spicy",
    date = new Date().toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  } = req.body;

  const systemPrompt = `${buildSassySystemPrompt("ดวงประจำวันและจิตวิทยาประยุกต์", sassyLevel, name)}

คุณต้องสร้างบทสรุปดวงประจำวัน (Daily Horoscope Summary) ที่กระชับ สนุก ตาสว่าง และใช้การผสานระหว่างโหราศาสตร์ จิตวิทยาพฤติกรรม และความจริงของชีวิต
กรุณาส่งกลับเป็น JSON format ตามโครงสร้างด้านล่างนี้เท่านั้น (ห้ามมี markdown wrapper นอกเหนือจาก valid JSON):
{
  "themeTitle": "หัวข้อดวงสไตล์เพื่อนสาวแซ่บๆ ประจำวัน",
  "overallVibe": "คำนิยามอารมณ์/ไวบ์ของวันนี้ 1 ประโยคเด็ด",
  "scores": {
    "love": 85,
    "work": 72,
    "money": 90,
    "sanity": 65
  },
  "summary": {
    "love": "คำทำนายความรักสั้นๆ 1-2 ประโยค",
    "work": "คำทำนายการงานสั้นๆ 1-2 ประโยค",
    "money": "คำทำนายการเงินสั้นๆ 1-2 ประโยค",
    "sanity": "คำเตือนเรื่องสุขภาพใจ/สติ 1-2 ประโยค"
  },
  "dailyCard": {
    "name": "ชื่อไพ่หรือสัญลักษณ์ประจำวัน (เช่น The Star, Wheel of Fortune, Fehu)",
    "symbol": "🎴",
    "meaning": "ความหมายนำทางประจำวันสั้นๆ"
  },
  "bestieRoast": "คำเตือนสติแบบเพื่อนสาวตลกร้ายแต่หวังดี 1-2 ประโยค",
  "psychologicalTip": "ข้อคิดจิตวิทยาสำหรับวันนี้ เพื่อรับมือกับสถานการณ์ต่างๆ",
  "luckyElements": {
    "color": "สีมงคลเสริมออร่า เช่น ม่วงลาเวนเดอร์ / เขียวเหนี่ยวทรัพย์",
    "colorHex": "#8b5cf6",
    "number": "8 หรือ 168",
    "powerHour": "ช่วงเวลาทอง เช่น 14:00 - 16:00 น.",
    "luckyItem": "สิ่งของนำโชค หรือกิจกรรมนำโชค"
  },
  "doList": [
    "สิ่งที่ควรทำข้อ 1",
    "สิ่งที่ควรทำข้อ 2"
  ],
  "dontList": [
    "สิ่งที่อย่าหาทำข้อ 1",
    "สิ่งที่อย่าหาทำข้อ 2"
  ],
  "dailyAffirmation": "ประโยคบูสต์พลังประจำวันสั้นๆ"
}`;

  const prompt = `ทำนายดวงประจำวัน:
ชื่อ: ${name}
ราศี: ${zodiac}
วันเกิด: ${dayOfBirth}
วันที่ดูดวง: ${date}
เรื่องที่อยากโฟกัสเป็นพิเศษวันนี้: ${focusArea}
ระดับความแซ่บ: ${sassyLevel}

ช่วยวิเคราะห์ดวงประจำวันให้หน่อย ขอจัดเต็มทุกมิติ!`;

  try {
    const result = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.85,
    });

    let resultJson;
    try {
      const cleaned = (result.text || "").trim();
      resultJson = JSON.parse(cleaned);
    } catch (parseErr) {
      console.log("[Daily Fortune] JSON format normalized, using structured generator");
      resultJson = generateDynamicDailyFortune(name, zodiac, focusArea);
    }

    return res.json({
      data: resultJson,
      date,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.log("[Daily Fortune API] Graceful fallback activated:", error?.message || "high demand");
    const dynamicFortune = generateDynamicDailyFortune(name, zodiac, focusArea);
    return res.json({
      data: dynamicFortune,
      date,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
});

// Dynamic Personalized Horoscope Generator for High Resilience
function generateDynamicDailyFortune(name: string, zodiac: string, focusArea: string) {
  const loveScore = Math.floor(68 + Math.random() * 28);
  const workScore = Math.floor(70 + Math.random() * 26);
  const moneyScore = Math.floor(72 + Math.random() * 25);
  const sanityScore = Math.floor(65 + Math.random() * 30);

  return {
    themeTitle: `ดวงฉบับเรียกสติของ ${name}: เลิกคิดวน แล้วก้าวไปคว้าความสำเร็จ!`,
    overallVibe: `วันนี้ดาวเด่นเรื่อง${focusArea} พลังงานบวกพร้อมทำงาน แค่แกต้องมีสติและกล้าตัดสินใจ`,
    scores: {
      love: loveScore,
      work: workScore,
      money: moneyScore,
      sanity: sanityScore,
    },
    summary: {
      love: "ถ้าเค้าไม่ทักมา ก็อย่าเพิ่งมโนว่าโลกจะแตก เอาเวลาไปรักและพัฒนาตัวเองให้เจิดจรัสค่ะ",
      work: "ไอเดียพร้อม งานพร้อม ปัญหาเดียวคือแกชอบผัดวันประกันพรุ่ง เริ่มต้นชิ้นแรกเดี๋ยวนี้!",
      money: "เงินทองยังมีสภาพคล่องดี ถ้าแกไม่กดสั่งซื้อของตอนดึกๆ เพราะอารมณ์ชั่ววูบ",
      sanity: "หายใจเข้าลึกๆ ยืดเส้นยืดสายแบบแมว แล้วปล่อยวางเรื่องที่ไม่ใช่ธุระของตัวเรา",
    },
    dailyCard: {
      name: "The Mystic Cat of Abundance (แมวดำเหนี่ยวทรัพย์และสติ)",
      symbol: "🐾",
      meaning: "ควบคุมสติและกรงเล็บชีวิตตัวเอง อย่าให้อารมณ์คนอื่นพาแกหลุดวงโคจร",
    },
    bestieRoast: `ดวงแกวันนี้ดีมากนะ ${name} แต่ถ้ายังมัวแต่นอนอืดไถฟีดแล้วบ่นว่าเหนื่อย โอกาสดีๆ ก็วิ่งมาเสิร์ฟให้ไม่ทันนะจ๊ะ!`,
    psychologicalTip: "เทคนิค 5-Second Rule: เมื่อรู้สึกผัดวันประกันพรุ่ง ให้นับ 5-4-3-2-1 แล้วลุกขึ้นทำทันที สมองจะไม่มีเวลาสร้างข้ออ้าง",
    luckyElements: {
      color: "ม่วงกำมะหยี่ & ทองแชมเปญ",
      colorHex: "#842C71",
      number: String(Math.floor(1 + Math.random() * 9)) + " หรือ 168",
      powerHour: "10:30 - 12:00 น.",
      luckyItem: "เครื่องรางรูปแมว หรือแก้วน้ำใบโปรด",
    },
    doList: [
      `จัดการเรื่อง${focusArea}ข้อที่สำคัญที่สุดให้เสร็จก่อนช่วงบ่าย`,
      "พูดชมตัวเองหน้ากระจกตอนเช้าเพื่อปลุกความมั่นใจ",
      "ปฏิเสธคำขอที่ล้ำเส้นอย่างสุภาพและเด็ดขาด",
    ],
    dontList: [
      "อย่าไปส่องโซเชียลคนคุยเก่าหรือคนที่ทำให้ประสาทเสีย",
      "อย่าใช้เงินแก้เครียดโดยไม่คิดหน้าคิดหลัง",
    ],
    dailyAffirmation: "วันนี้ฉันสงบ มั่นใจ มีสติ รู้ทันอารมณ์ และดึงดูดสิ่งดีๆ เข้ามาในชีวิตอย่างง่ายดาย!",
  };
}

// Monthly Astrology Calendar Endpoint
app.post("/api/gemini/monthly-astrology", async (req, res) => {
  const {
    year = 2026,
    month = 9,
    zodiac = "ราศีเมษ (Aries)",
    sassyLevel = "spicy",
  } = req.body;

  const validYear = Number(year) || 2026;
  const validMonth = Math.min(12, Math.max(1, Number(month) || 9));

  const cacheKey = `month_${validYear}_${validMonth}_${zodiac}_${sassyLevel}`;
  const cachedMonth = getCachedAstro(cacheKey);
  if (cachedMonth) {
    return res.json({ data: cachedMonth, timestamp: new Date().toISOString(), fromCache: true });
  }

  const thaiMonthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const monthNameTh = `${thaiMonthNames[validMonth - 1]} ${validYear + 543}`;

  const systemPrompt = `${buildSassySystemPrompt("ปฏิทินโหราศาสตร์และฤกษ์มงคลรายเดือน", sassyLevel)}

คุณคือผู้เชี่ยวชาญด้านปฏิทินโหราศาสตร์ไทย-สากล-จีน 4 ศาสตร์ ผสานจิตวิทยาพฤติกรรม
หน้าที่ของคุณคือสรุปภาพรวมปฏิทินดวงรายเดือนสำหรับ ${monthNameTh} (ปี ค.ศ. ${validYear} เดือนที่ ${validMonth})
ระบุวันมงคล (Auspicious), วันระวังภัย/วันอุบาทว์ (Inauspicious/Caution), และวันอีเวนต์ดาวเด่น (Astrology Events เช่น จันทร์เพ็ญ, จันทร์ดับ, วันขอเงินพระจันทร์, ดาวย้ายราศี)
รวมถึงคำแนะนำเจาะจงรายวันในแต่ละสัปดาห์

กรุณาตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "monthTheme": "ธีมหลักประจำเดือน เช่น ศึกเปิดทางทรัพย์หลังม่านหมอก",
  "elementFocus": "ธาตุหรือพลังงานเด่นประจำเดือน",
  "sassyMonthlyRoast": "คำเตือนสติภาพรวมประจำเดือน 1-2 ประโยคเด็ด",
  "majorEvents": [
    {
      "day": 15,
      "date": "${validYear}-${String(validMonth).padStart(2, "0")}-15",
      "title": "วันจันทร์เพ็ญ Super Full Moon",
      "tag": "จันทร์เต็มดวง",
      "icon": "🌕",
      "description": "พลังงานอารมณ์พุ่งทะลุปรอท เหมาะแก่การขอพรเรื่องเสน่ห์และปลดปล่อยสิ่งตกค้าง",
      "impact": "พลังธาตุน้ำเข้มข้น งดตัดสินใจด้วยอารมณ์ชั่ววูบ"
    }
  ],
  "dayHighlights": {
    "1": {
      "type": "auspicious",
      "badge": "🌟 ฤกษ์ธงชัย",
      "title": "เริ่มต้นมั่นคง ชัยชนะรออยู่",
      "shortNote": "พลังงานเปิดกว้าง เหมาะเริ่มงานใหม่หรือตั้งปณิธาน",
      "energyScore": 92,
      "auspiciousFor": ["เซ็นสัญญา", "เปิดตัวโปรเจกต์"],
      "avoidFor": ["ใจร้อน"],
      "luckyColor": "ทอง / เหลืองมัสตาร์ด",
      "luckyHours": "09:19 - 11:00 น.",
      "lunarPhase": "ขึ้น 1 ค่ำ"
    }
  }
}`;

  const prompt = `ขอข้อมูลปฏิทินดวงรายเดือนสำหรับ:
เดือน: ${monthNameTh} (เดือนที่ ${validMonth} ปี ${validYear})
ราศีเสริม: ${zodiac}
จำนวนวันในเดือนนี้: ${new Date(validYear, validMonth, 0).getDate()} วัน
ขออีเวนต์ดาราศาสตร์/โหราศาสตร์สำคัญอย่างน้อย 3-4 อีเวนต์ และไฮไลต์วันดีวันร้ายสำคัญ`;

  try {
    const result = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.8,
    });

    let aiData: any = {};
    try {
      aiData = JSON.parse((result.text || "").trim());
    } catch (parseErr) {
      console.log("[Monthly Astrology] AI returned text, merging with dynamic baseline");
    }

    // Merge AI insights with standard astrological day grid for completeness
    const fullCalendar = generateDynamicMonthlyAstrology(validYear, validMonth, zodiac, aiData);
    setCachedAstro(cacheKey, fullCalendar, 86400000); // 24h cache for monthly calendar
    return res.json({ data: fullCalendar, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.log("[Monthly Astrology API] Fallback activated:", error?.message || "high demand");
    const fallbackCalendar = generateDynamicMonthlyAstrology(validYear, validMonth, zodiac);
    setCachedAstro(cacheKey, fallbackCalendar, 1800000); // 30m cache for fallback
    return res.json({ data: fallbackCalendar, timestamp: new Date().toISOString(), fallback: true });
  }
});

// Dynamic Astrological Engine for Full Month Grid
function generateDynamicMonthlyAstrology(
  year: number,
  month: number,
  zodiac: string = "ทั่วไป",
  aiOverlay: any = {}
) {
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const monthNameTh = `${thaiMonths[month - 1]} ${year + 543}`;
  const totalDays = new Date(year, month, 0).getDate();

  // Astrological cycle templates
  const luckyColors = [
    "ม่วงกำมะหยี่ & ทอง", "เขียวมรกตเหนี่ยวทรัพย์", "ขาวไข่มุก & เงิน",
    "ส้มคอรัล & พีช", "ฟ้าคราม & น้ำเงินไพลิน", "แดงทับทิม & โรสโกลด์", "เหลืองอำพัน & ช็อกโกแลต"
  ];

  const luckyHoursList = [
    "08:29 - 10:15 น.", "09:09 - 11:30 น.", "11:45 - 13:15 น.",
    "13:39 - 15:00 น.", "15:19 - 17:00 น.", "18:09 - 19:30 น."
  ];

  // Specific Day archetypes based on Thai astrology rotation
  const days: any[] = [];
  let auspiciousCount = 0;
  let cautionCount = 0;
  let eventCount = 0;
  let scoreSum = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 Sun ... 6 Sat
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // Deterministic modulo logic for realistic month distribution
    const seed = (d * 17 + month * 31 + year) % 100;
    const lunarDay = ((d + month * 2) % 30) + 1;
    const lunarPhase = lunarDay <= 15 ? `ขึ้น ${lunarDay} ค่ำ` : `แรม ${lunarDay - 15} ค่ำ`;

    let type: "auspicious" | "inauspicious" | "astrology_event" | "neutral" = "neutral";
    let badge = "✨ วันราบรื่น";
    let title = "พลังงานไหลเวียนปกติ";
    let shortNote = "โฟกัสกับหน้าที่ประจำวัน สะสางงานคั่งค้าง มีสมาธิจดจ่อ";
    let energyScore = 65 + (seed % 25);
    let auspiciousFor = ["ทำงานประจำ", "จัดระเบียบชีวิต", "พูดคุยกระชับมิตร"];
    let avoidFor = ["ผัดวันประกันพรุ่ง", "คิดฟุ้งซ่าน"];
    let planetaryAspect = "ดวงดาวสถิตในองศาเสถียรภาพ";

    // Major Astrology Event Days (Full Moon, New Moon, Solar/Planetary aspects)
    if (d === 15 || d === 1) {
      type = "astrology_event";
      eventCount++;
      energyScore = 88;
      if (d === 15) {
        badge = "🌕 จันทร์เพ็ญ";
        title = "คืนจันทร์เพ็ญมนตรา พลังอธิษฐานสูงสุด";
        shortNote = "พลังธาตุน้ำและแรงดึงดูดหนุนเรื่องเสน่ห์เมตตา ความรู้สึกชัดเจน ปลดล็อกความลังเล";
        auspiciousFor = ["ขอพรความรัก", "ทำสมาธิชำระจิต", "อาบแสงจันทร์", "ปล่อยวางอดีต"];
        avoidFor = ["ใช้อารมณ์ตัดสินปัญหา", "วิวาทกับคนในครอบครัว"];
        planetaryAspect = "Full Moon Peak Alignment (แรงดึงดูดสูงสุด)";
      } else {
        badge = "🌑 จันทร์ดับ";
        title = "วันอมาวสี ขอเงินพระจันทร์";
        shortNote = "จุดเริ่มต้นของรอบวัฏจักรใหม่ เหมาะตั้งจิตอธิษฐานเรียกทรัพย์และวางเป้าหมายการเงิน";
        auspiciousFor = ["กระเป๋าสตางค์ใบใหม่", "ออมเงินก้อนแรก", "วางแผนธุรกิจ", "ตั้งจิตเจตจำนง"];
        avoidFor = ["ให้คนยืมเงิน", "ใช้จ่ายสุรุ่ยสุร่าย"];
        planetaryAspect = "New Moon Lunar Conjunction";
      }
    } else if (seed % 7 === 0 || d === 9 || d === 19 || d === 28) {
      // Auspicious Day (Wan Thongchai / Atibadi / Mahattano)
      type = "auspicious";
      auspiciousCount++;
      energyScore = 85 + (seed % 15);
      const isThongchai = d % 2 === 1;
      badge = isThongchai ? "🌟 ฤกษ์ธงชัย" : "👑 ฤกษ์อธิบดี";
      title = isThongchai
        ? "ฤกษ์ธงชัย ชนะอุปสรรค เจรจาสำเร็จ"
        : "ฤกษ์อธิบดี บารมีหนุน นำเสนองานราบรื่น";
      shortNote = isThongchai
        ? "ดาวพฤหัสบดีทำมุมตรีโกณ หนุนความก้าวหน้า เซ็นสัญญา ทำธุรกรรมใหญ่จะราบรื่น"
        : "ดาวอาทิตย์ส่องแสงเจิดจ้า เหมาะเจรจาผู้ใหญ่ เสนอโปรเจกต์ ขอความช่วยเหลือ";
      auspiciousFor = ["เซ็นสัญญาสำคัญ", "ออกรถใหม่", "เปิดตัวสินค้า", "ขอความร่วมมือ", "เสี่ยงโชค"];
      avoidFor = ["มองโลกในแง่ร้าย", "ลังเลไม่กล้าลงมือทำ"];
      planetaryAspect = "Jupiter Trine / Solar Radiance";
    } else if (d === 8 || d === 22) {
      // Spiritual Lunar Quarter Day (Wan Phra)
      type = "astrology_event";
      eventCount++;
      badge = "🐾 วันเบิกเนตร";
      title = "วันสมาธิและเปิดญาณทัศนะ";
      shortNote = "จิตใจหยั่งรู้เฉียบแหลม ลางสังหรณ์แม่นยำ เหมาะเปิดไพ่สำรวจทิศทางชีวิต";
      energyScore = 80;
      auspiciousFor = ["ดูดวงเปิดไพ่", "ทำบุญบริจาค", "ฝึกสติสมาธิ", "วางแผนระยะยาว"];
      avoidFor = ["ดื่มแอลกอฮอล์เกินพอดี", "เที่ยวสถานบันเทิงดึก"];
      planetaryAspect = "Mercury Sextile Neptune";
    } else if (seed % 9 === 0 || d === 13 || d === 24) {
      // Inauspicious / Caution Day (Wan Ubata / Lokawinat / Rahu Clash)
      type = "inauspicious";
      cautionCount++;
      energyScore = 40 + (seed % 20);
      badge = "⚠️ วันควรระวัง";
      title = "วันกวนใจ อารมณ์เปราะบาง งดเสี่ยง";
      shortNote = "ดาวอังคารเล็งมฤตยู ระวังการปะทะทางวาจา ข้าวของเสียหาย หรือเกิดเหตุไม่คาดคิด";
      auspiciousFor = ["เก็บตัวทำงานเงียบๆ", "จัดบ้านทิ้งของเก่า", "พักผ่อนชาร์จพลัง"];
      avoidFor = ["ออกหน้าเถียง", "ลงทุนเสี่ยงสูง", "เซ็นสัญญาด่วน", "เดินทางไกลช่วงพลบค่ำ"];
      planetaryAspect = "Mars Opposite Uranus (High Friction)";
    }

    // Overlay AI day custom highlight if available
    const aiDay = aiOverlay?.dayHighlights?.[String(d)];
    if (aiDay) {
      if (aiDay.type) type = aiDay.type;
      if (aiDay.badge) badge = aiDay.badge;
      if (aiDay.title) title = aiDay.title;
      if (aiDay.shortNote) shortNote = aiDay.shortNote;
      if (aiDay.energyScore) energyScore = aiDay.energyScore;
      if (aiDay.auspiciousFor) auspiciousFor = aiDay.auspiciousFor;
      if (aiDay.avoidFor) avoidFor = aiDay.avoidFor;
      if (aiDay.luckyColor) luckyColors[dayOfWeek] = aiDay.luckyColor;
    }

    scoreSum += energyScore;

    days.push({
      day: d,
      date: dateStr,
      dayOfWeek,
      type,
      badge,
      title,
      shortNote,
      energyScore,
      auspiciousFor,
      avoidFor,
      luckyColor: luckyColors[dayOfWeek % luckyColors.length],
      luckyHours: luckyHoursList[(d + dayOfWeek) % luckyHoursList.length],
      lunarPhase,
      planetaryAspect,
    });
  }

  // Major monthly astrology events
  const majorEvents = (aiOverlay?.majorEvents && aiOverlay.majorEvents.length > 0)
    ? aiOverlay.majorEvents
    : [
        {
          day: 1,
          date: `${year}-${String(month).padStart(2, "0")}-01`,
          title: "วันอมาวสี จันทร์ดับ (New Moon Abundance)",
          tag: "จุดเริ่มรอบใหม่",
          icon: "🌑",
          description: "ขอเงินพระจันทร์ ล้างกระเป๋าสตางค์ เปิดรับทรัพย์ก้อนใหม่ในรอบเดือน",
          impact: "เสริมโชคลาภการเงินและเจตจำนงใหม่",
        },
        {
          day: 9,
          date: `${year}-${String(month).padStart(2, "0")}-09`,
          title: "ฤกษ์มหาจักร ธงชัยคู่ (Double Golden Gate)",
          tag: "ฤกษ์มงคลสูงสุด",
          icon: "🌟",
          description: "ดาวพฤหัสบดีหนุนพลังอำนาจ เหมาะแก่การเซ็นสัญญาใหญ่ เริ่มต้นธุรกิจ หรือออกรถ",
          impact: "โอกาสสำเร็จ 95% เมื่อลงมือทำจริง",
        },
        {
          day: 15,
          date: `${year}-${String(month).padStart(2, "0")}-15`,
          title: "Super Full Moon คืนจันทร์เพ็ญเบิกเนตร",
          tag: "จันทร์เต็มดวง",
          icon: "🌕",
          description: "แสงจันทร์ส่องสว่างสะท้อนจิตใต้สำนึก ความรักที่คลุมเครือจะเริ่มเห็นความจริง",
          impact: "อารมณ์ขึ้นลงแรง แต่เสน่ห์เมตตาสูงสุด",
        },
        {
          day: 24,
          date: `${year}-${String(month).padStart(2, "0")}-24`,
          title: "ราหูโยกย้ายมุมพักร์ (Mercury & Rahu Shift)",
          tag: "ดาวพักร์องศา",
          icon: "⚡",
          description: "ช่วงเวลาที่เอกสาร การสื่อสาร และการเดินทางอาจมีความล่าช้า ควรตรวจสอบสองรอบเสมอ",
          impact: "เตือนสติเรื่องความรอบคอบและอารมณ์",
        },
      ];

  return {
    year,
    month,
    monthNameTh,
    monthTheme: aiOverlay?.monthTheme || `กงล้อดวงดาวแห่งการปลดล็อกและรับโชค (${zodiac})`,
    elementFocus: aiOverlay?.elementFocus || "ธาตุทองและธาตุน้ำ (ความเฉียบคมและการปรับตัวตามกระแส)",
    sassyMonthlyRoast: aiOverlay?.sassyMonthlyRoast || "ดวงดาวจัดสรรโอกาสทองมาให้เต็มจาน แต่ถ้าแกไม่ลุกไปตักกิน ก็อย่าไปโทษฟ้าดินนะจ๊ะ!",
    energyOverview: {
      auspiciousDaysCount: auspiciousCount,
      cautionDaysCount: cautionCount,
      eventDaysCount: eventCount,
      averageScore: Math.round(scoreSum / totalDays),
    },
    majorEvents,
    days,
  };
}

// Lucky Numbers Generator Endpoint based on Zodiac & Current Planetary Alignments
app.post("/api/gemini/lucky-numbers", async (req, res) => {
  const {
    zodiac = "ราศีเมษ (Aries)",
    date = new Date().toISOString().split("T")[0],
    intention = "all",
    sassyLevel = "spicy",
  } = req.body;

  const targetDate = new Date(date || Date.now());
  const formattedDate = isNaN(targetDate.getTime()) ? new Date() : targetDate;
  const dateStr = formattedDate.toISOString().split("T")[0];

  const cacheKey = `lucky_${zodiac}_${dateStr}_${intention}_${sassyLevel}`;
  const cachedData = getCachedAstro(cacheKey);
  if (cachedData) {
    return res.json({ data: cachedData, timestamp: new Date().toISOString(), fromCache: true });
  }

  const systemPrompt = `${buildSassySystemPrompt("โหราศาสตร์ตัวเลขมงคล (Astro-Numerology)", sassyLevel)}

คุณคือแม่หมอผู้เชี่ยวชาญด้านโหราศาสตร์ตัวเลข (Chaldean & Vedic Numerology) ผสานตำแหน่งองศาดาวเคราะห์ประจำวัน (Planetary Transits)
คำนวณและวิเคราะห์เลขมงคลส่วนบุคคลสำหรับผู้เกิดราศี ${zodiac} ประจำวันที่ ${dateStr}
โดยอิงตาม:
1. ดาวเกษตรเจ้าเรือนราศีของผู้ใช้ (Zodiac Ruling Planet)
2. ดาวเจ้าวันและตำแหน่งดาวจร (Transiting Planets: อาทิตย์, จันทร์, พุธ, ศุกร์, อังคาร, พฤหัสบดี, เสาร์, ราหู)
3. องศาและเรือนภพที่ดาวทำมุมตรีโกณ/โยค/เกณฑ์กับราศีเป้าหมาย
4. เป้าหมายความมงคลที่เน้น: ${intention === "all" ? "ภาพรวมครบทุกมิติ" : intention}

กรุณาตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "rulingPlanet": "ชื่อดาวเกษตรเจ้าเรือนและดาวจรหนุน",
  "zodiacElement": "ธาตุประจำราศี",
  "corePrimeNumber": 9,
  "secondaryNumbers": [2, 4, 8],
  "tripletNumbers": ["249", "789", "168"],
  "luckyPairs": [
    {
      "pair": "24",
      "category": "wealth",
      "categoryLabel": "วาจาเรียกทรัพย์",
      "meaning": "ดาวจันทร์หนุนดาวพุธ เจรจาค้าขายคล่อง ลูกค้าเอ็นดู โอนไว",
      "planetarySynergy": "Moon (2) + Mercury (5)",
      "luckScore": 96
    }
  ],
  "cautionNumbers": [0, 7],
  "cautionReason": "เหตุผลที่ตัวเลขนี้ขัดพลังงานหรือเป็นเลขอริประจำวัน",
  "powerHours": "ช่วงเวลาฤกษ์มงคลในการใช้งานตัวเลขหรือเสี่ยงโชค เช่น 09:19 - 11:30 น.",
  "powerDirection": "ทิศมงคลเสริมโชคลาภ",
  "cosmicColorVibe": "คู่สีมงคลเสริมกระแสพลังงาน",
  "planetaryPositions": [
    {
      "planet": "อาทิตย์ (Sun)",
      "symbol": "☉",
      "sign": "กันย์ (Virgo)",
      "degree": "18°",
      "element": "ดิน",
      "vibrationNumber": 1,
      "aspectToSign": "ส่องแสงตรีโกณหนุนบารมี"
    }
  ],
  "bestieNumerologyRoast": "คำเตือนสติสไตล์เพื่อนสาว 1-2 ประโยคเด็ด ว่าเลขสวยแค่ไหนถ้าไม่ลงมือทำก็นอนกอดตัวเลขไปนะจ๊ะ",
  "dailyCosmicAdvice": "คำแนะนำเชิงจิตวิทยาและการใช้พลังตัวเลขในชีวิตจริง 1 ย่อหน้า",
  "suggestedAction": "แอ็กชันเสริมดวงประจำวัน เช่น ซื้อสลากช่วงบ่าย, เปลี่ยนรหัสผ่านท้ายเบอร์"
}`;

  const prompt = `คำนวณเลขมงคลส่วนบุคคล:
ราศี: ${zodiac}
วันที่: ${dateStr}
จุดเน้น: ${intention}
โปรดคำนวณตำแหน่งดวงดาวและชุดตัวเลขมงคลอย่างแม่นยำ พร้อมคำอธิบายทางโหราศาสตร์ดาวเคราะห์`;

  try {
    const result = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    let aiData: any = {};
    try {
      aiData = JSON.parse((result.text || "").trim());
    } catch (parseErr) {
      console.log("[Lucky Numbers] AI JSON parse note, using astrological baseline");
    }

    const finalResult = generateDeterministicLuckyNumbers(zodiac, dateStr, intention, aiData);
    setCachedAstro(cacheKey, finalResult);
    return res.json({ data: finalResult, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.log("[Lucky Numbers API] Gemini Fallback engaged:", error?.message || "high traffic");
    const fallbackResult = generateDeterministicLuckyNumbers(zodiac, dateStr, intention);
    setCachedAstro(cacheKey, fallbackResult, 600000); // 10 min cache for fallback
    return res.json({ data: fallbackResult, timestamp: new Date().toISOString(), fallback: true });
  }
});

// Deterministic Astrological Engine for Personal Lucky Numbers
function generateDeterministicLuckyNumbers(
  zodiac: string,
  dateStr: string,
  intention: string = "all",
  aiOverlay: any = {}
) {
  const targetDate = new Date(dateStr);
  const dayOfWeekIndex = targetDate.getDay(); // 0 Sun ... 6 Sat
  const dayNum = targetDate.getDate();
  const monthNum = targetDate.getMonth() + 1;
  const yearNum = targetDate.getFullYear();

  const thaiDays = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];
  const dayOfWeekTh = thaiDays[dayOfWeekIndex];

  // Zodiac Sign Registry & Astrological Correspondences
  interface ZodiacProfile {
    element: string;
    ruler: string;
    rulerSymbol: string;
    rulerNumber: number;
    harmonicNumbers: number[];
    opposingNumber: number;
    directions: string[];
    colors: string[];
  }

  const zodiacDatabase: Record<string, ZodiacProfile> = {
    "ราศีเมษ (Aries)": {
      element: "ธาตุไฟ (Fire)",
      ruler: "ดาวอังคาร (Mars)",
      rulerSymbol: "♂",
      rulerNumber: 9,
      harmonicNumbers: [1, 3, 9, 5],
      opposingNumber: 2,
      directions: ["ทิศตะวันออก", "ทิศตะวันออกเฉียงเหนือ"],
      colors: ["แดงทับทิม & ทองคำ", "ส้มคอรัล & ช็อกโกแลต"],
    },
    "ราศีพฤษภ (Taurus)": {
      element: "ธาตุดิน (Earth)",
      ruler: "ดาวศุกร์ (Venus)",
      rulerSymbol: "♀",
      rulerNumber: 6,
      harmonicNumbers: [6, 4, 2, 5],
      opposingNumber: 7,
      directions: ["ทิศใต้", "ทิศตะวันออกเฉียงใต้"],
      colors: ["เขียวมรกต & ชมพูพาสเทล", "ขาวไข่มุก & เขียวมะกอก"],
    },
    "ราศีเมถุน (Gemini)": {
      element: "ธาตุลม (Air)",
      ruler: "ดาวพุธ (Mercury)",
      rulerSymbol: "☿",
      rulerNumber: 5,
      harmonicNumbers: [5, 4, 2, 6],
      opposingNumber: 3,
      directions: ["ทิศตะวันตกเฉียงเหนือ", "ทิศเหนือ"],
      colors: ["ฟ้าอ่อน & ส้มแสด", "เหลืองคานารี & เงิน"],
    },
    "ราศีกรกฎ (Cancer)": {
      element: "ธาตุน้ำ (Water)",
      ruler: "ดาวจันทร์ (Moon)",
      rulerSymbol: "☽",
      rulerNumber: 2,
      harmonicNumbers: [2, 4, 1, 6],
      opposingNumber: 8,
      directions: ["ทิศตะวันออก", "ทิศเหนือ"],
      colors: ["ขาวมุก & เงินยวง", "ฟ้าน้ำทะเล & เขียวมิ้นต์"],
    },
    "ราศีสิงห์ (Leo)": {
      element: "ธาตุไฟ (Fire)",
      ruler: "ดาวอาทิตย์ (Sun)",
      rulerSymbol: "☉",
      rulerNumber: 1,
      harmonicNumbers: [1, 9, 3, 5],
      opposingNumber: 6,
      directions: ["ทิศตะวันออกเฉียงเหนือ", "ทิศตะวันออก"],
      colors: ["ทองคำประกาย & ม่วงกำมะหยี่", "ส้มแมนดาริน & แดงเบอร์กันดี"],
    },
    "ราศีกันย์ (Virgo)": {
      element: "ธาตุดิน (Earth)",
      ruler: "ดาวพุธ (Mercury)",
      rulerSymbol: "☿",
      rulerNumber: 5,
      harmonicNumbers: [5, 6, 2, 4],
      opposingNumber: 9,
      directions: ["ทิศใต้", "ทิศตะวันตกเฉียงใต้"],
      colors: ["เขียวหัวเป็ด & ครีมงาช้าง", "น้ำตาลคาราเมล & ทอง"],
    },
    "ราศีตุลย์ (Libra)": {
      element: "ธาตุลม (Air)",
      ruler: "ดาวศุกร์ (Venus)",
      rulerSymbol: "♀",
      rulerNumber: 6,
      harmonicNumbers: [6, 2, 4, 8],
      opposingNumber: 1,
      directions: ["ทิศตะวันตก", "ทิศตะวันตกเฉียงใต้"],
      colors: ["ชมพูโรสโกลด์ & คราม", "ฟ้าพาสเทล & ขาวบริสุทธิ์"],
    },
    "ราศีพิจิก (Scorpio)": {
      element: "ธาตุน้ำ (Water)",
      ruler: "ดาวอังคาร & พลูโต (Mars & Pluto)",
      rulerSymbol: "♂ ♇",
      rulerNumber: 9,
      harmonicNumbers: [9, 8, 3, 2],
      opposingNumber: 5,
      directions: ["ทิศเหนือ", "ทิศตะวันออกเฉียงเหนือ"],
      colors: ["แดงเข้มไวน์ & ดำรัตติกาล", "ม่วงเข้ม & ทองบรอนซ์"],
    },
    "ราศีธนู (Sagittarius)": {
      element: "ธาตุไฟ (Fire)",
      ruler: "ดาวพฤหัสบดี (Jupiter)",
      rulerSymbol: "♃",
      rulerNumber: 3,
      harmonicNumbers: [3, 1, 9, 5],
      opposingNumber: 4,
      directions: ["ทิศตะวันออกเฉียงเหนือ", "ทิศเหนือ"],
      colors: ["ส้มอิฐ & ม่วงรอยัล", "เหลืองอำพัน & น้ำเงินไพลิน"],
    },
    "ราศีมังกร (Capricorn)": {
      element: "ธาตุดิน (Earth)",
      ruler: "ดาวเสาร์ (Saturn)",
      rulerSymbol: "♄",
      rulerNumber: 8,
      harmonicNumbers: [8, 4, 7, 5],
      opposingNumber: 2,
      directions: ["ทิศตะวันตกเฉียงใต้", "ทิศใต้"],
      colors: ["เทาควันบุหรี่ & เขียวขี้ม้า", "น้ำตาลเอสเปรสโซ & บรอนซ์"],
    },
    "ราศีกุมภ์ (Aquarius)": {
      element: "ธาตุลม (Air)",
      ruler: "ดาวราหู & ยูเรนัส (Rahu & Uranus)",
      rulerSymbol: "☊ ♅",
      rulerNumber: 4,
      harmonicNumbers: [4, 8, 7, 6],
      opposingNumber: 1,
      directions: ["ทิศเหนือ", "ทิศตะวันตกเฉียงเหนือ"],
      colors: ["น้ำเงินนีออน & เงินเมทัลลิก", "ม่วงอเมทิสต์ & เทาดำ"],
    },
    "ราศีมีน (Pisces)": {
      element: "ธาตุน้ำ (Water)",
      ruler: "ดาวพฤหัสบดี & เกตุ (Jupiter & Neptune)",
      rulerSymbol: "♃ ♆",
      rulerNumber: 3,
      harmonicNumbers: [3, 2, 7, 6],
      opposingNumber: 8,
      directions: ["ทิศตะวันออก", "ทิศตะวันออกเฉียงใต้"],
      colors: ["ฟ้าน้ำทะเลลึก & ม่วงลาเวนเดอร์", "เขียวน้ำไหล & ขาวมุก"],
    },
  };

  // Match or fallback to Aries
  let profileKey = Object.keys(zodiacDatabase).find((k) => k.includes(zodiac) || zodiac.includes(k.split(" ")[0]));
  if (!profileKey) profileKey = "ราศีเมษ (Aries)";
  const profile = zodiacDatabase[profileKey];

  // Daily Ruling Planet (วัน 7 วันตามคัมภีร์โหราศาสตร์)
  const dayPlanets = [
    { name: "ดาวอาทิตย์ (Sun)", num: 1, sym: "☉" },
    { name: "ดาวจันทร์ (Moon)", num: 2, sym: "☽" },
    { name: "ดาวอังคาร (Mars)", num: 9, sym: "♂" },
    { name: "ดาวพุธ (Mercury)", num: 5, sym: "☿" },
    { name: "ดาวพฤหัสบดี (Jupiter)", num: 3, sym: "♃" },
    { name: "ดาวศุกร์ (Venus)", num: 6, sym: "♀" },
    { name: "ดาวเสาร์ (Saturn)", num: 8, sym: "♄" },
  ];
  const currentDayPlanet = dayPlanets[dayOfWeekIndex];

  // Mathematical Cosmological Seed for the Day
  const cosmicSeed = (dayNum * 13 + monthNum * 29 + yearNum * 7 + profile.rulerNumber * 3) % 100;
  
  // Calculate Prime Core Lucky Number (Single digit 1-9)
  // Blending Zodiac ruler + Day ruler + Cosmic date vibration
  const sumVibe = profile.rulerNumber + currentDayPlanet.num + (dayNum % 9);
  const corePrimeNumber = aiOverlay?.corePrimeNumber || (((sumVibe - 1) % 9) + 1);

  // Secondary Numbers (3 numbers)
  const secondaryNumbers: number[] = aiOverlay?.secondaryNumbers?.length
    ? aiOverlay.secondaryNumbers
    : [
        ((corePrimeNumber + 2) % 9) || 9,
        ((corePrimeNumber + 5) % 9) || 5,
        profile.harmonicNumbers[(cosmicSeed + 1) % profile.harmonicNumbers.length],
      ].filter((v, i, a) => a.indexOf(v) === i && v !== corePrimeNumber);

  // Triplets (3-digit master power sets)
  const tripletNumbers: string[] = aiOverlay?.tripletNumbers?.length
    ? aiOverlay.tripletNumbers
    : [
        `${corePrimeNumber}${secondaryNumbers[0] || 4}${secondaryNumbers[1] || 6}`,
        `${secondaryNumbers[0] || 2}${corePrimeNumber}${secondaryNumbers[2] || 8}`,
        `${cosmicSeed % 2 === 0 ? "789" : "168"}`,
      ];

  // Lucky Pairs (Pairs with cosmological meanings)
  const pairDatabase = [
    {
      pair: "24",
      category: "wealth" as const,
      categoryLabel: "วาจาเรียกทรัพย์",
      meaning: "ดาวจันทร์ (2) ผสานดาวพุธ (5/4) วาจาเป็นเสน่ห์ เจรจาค้าขายคล่อง ดึงดูดคนอุปถัมภ์",
      planetarySynergy: "Moon ☽ + Mercury ☿",
      luckScore: 97,
    },
    {
      pair: "36",
      category: "love" as const,
      categoryLabel: "เสน่ห์ดึงดูด & ความรัก",
      meaning: "ดาวอังคาร (3/9) พบดาวศุกร์ (6) ไฟเสน่ห์เร่าร้อน ดึงดูดความรักและเมตตามหานิยมล้นหลาม",
      planetarySynergy: "Mars ♂ + Venus ♀",
      luckScore: 94,
    },
    {
      pair: "45",
      category: "work" as const,
      categoryLabel: "ปัญญาเฉียบแหลม & บารมี",
      meaning: "ดาวพุธ (4/5) เชื่อมดาวพฤหัสบดี (3/5) ผู้ใหญ่เมตตา ปิดดีลธุรกิจ การสอบแข่งขันฉลุย",
      planetarySynergy: "Mercury ☿ + Jupiter ♃",
      luckScore: 95,
    },
    {
      pair: "56",
      category: "wealth" as const,
      categoryLabel: "ศุภโชคโภคทรัพย์",
      meaning: "คู่ดาวศุภเคราะห์ใหญ่ เงินไหลมาเทมา สุขภาพจิตดี ชีวิตรื่นรมย์ไม่มีสะดุด",
      planetarySynergy: "Jupiter ♃ + Venus ♀",
      luckScore: 98,
    },
    {
      pair: "78",
      category: "windfall" as const,
      categoryLabel: "เงินก้อนใหญ่ & มหาโชค",
      meaning: "ดาวเสาร์ (7/8) หนุนดาวราหู (4/8) การเงินก้อนโต โชคลาภลอย อสังหาริมทรัพย์และโปรเจกต์ยักษ์",
      planetarySynergy: "Saturn ♄ + Rahu ☊",
      luckScore: 92,
    },
    {
      pair: "15",
      category: "work" as const,
      categoryLabel: "อำนาจบารมี & ชื่อเสียง",
      meaning: "ดาวอาทิตย์ (1) กุมดาวพฤหัสบดี (5) ยศตำแหน่งก้าวหน้า ได้รับความไว้วางใจจากผู้ใหญ่",
      planetarySynergy: "Sun ☉ + Jupiter ♃",
      luckScore: 93,
    },
    {
      pair: "28",
      category: "windfall" as const,
      categoryLabel: "เงินหมุนไว & โชคเสี่ยงดวง",
      meaning: "ดาวจันทร์ (2) ร่วมราหู (8) มหาเศรษฐีเงินหมุน โชคลาภจากการเสี่ยงและการลงทุนด่วน",
      planetarySynergy: "Moon ☽ + Rahu ☊",
      luckScore: 91,
    },
    {
      pair: "89",
      category: "protection" as const,
      categoryLabel: "แคล้วคลาด & ชนะอุปสรรค",
      meaning: "ดาวราหู (8) ผสานดาวเกตุ/อังคาร (9) สิ่งศักดิ์สิทธิ์คุ้มครอง ชนะคู่แข่ง ชนะอุปสรรคทั้งปวง",
      planetarySynergy: "Rahu ☊ + Ketu ♆",
      luckScore: 90,
    },
  ];

  // Filter or rotate lucky pairs based on cosmic seed and intention
  let selectedPairs = aiOverlay?.luckyPairs || [];
  if (!selectedPairs.length) {
    if (intention === "wealth" || intention === "windfall") {
      selectedPairs = pairDatabase.filter((p) => p.category === "wealth" || p.category === "windfall").slice(0, 3);
    } else if (intention === "love") {
      selectedPairs = pairDatabase.filter((p) => p.category === "love" || p.category === "wealth").slice(0, 3);
    } else if (intention === "work") {
      selectedPairs = pairDatabase.filter((p) => p.category === "work" || p.category === "protection").slice(0, 3);
    } else {
      // Pick 3 diverse pairs
      selectedPairs = [
        pairDatabase[cosmicSeed % pairDatabase.length],
        pairDatabase[(cosmicSeed + 2) % pairDatabase.length],
        pairDatabase[(cosmicSeed + 4) % pairDatabase.length],
      ];
    }
  }

  // Caution Numbers (Opposing vibrations)
  const cautionNumbers = aiOverlay?.cautionNumbers || [profile.opposingNumber, 0];
  const cautionReason = aiOverlay?.cautionReason ||
    `ดาวอริทำมุมเบียนกับ ${profile.ruler} ในวันนี้ แนะนำให้หลีกเลี่ยงการใช้ตัวเลข ${cautionNumbers.join(" และ ")} เป็นเลขลงท้ายธุรกรรมด่วนหรือการตัดสินใจใหญ่`;

  // Power hours & direction
  const powerHoursList = [
    "08:19 - 10:00 น.",
    "09:39 - 11:15 น.",
    "11:45 - 13:30 น.",
    "14:09 - 15:45 น.",
    "16:29 - 18:00 น.",
    "19:09 - 20:30 น.",
  ];
  const powerHours = aiOverlay?.powerHours || powerHoursList[(dayNum + dayOfWeekIndex) % powerHoursList.length];
  const powerDirection = aiOverlay?.powerDirection || profile.directions[dayNum % profile.directions.length];
  const cosmicColorVibe = aiOverlay?.cosmicColorVibe || profile.colors[cosmicSeed % profile.colors.length];

  // Planetary Positions Grid for the date
  const basePlanets = [
    {
      planet: "อาทิตย์ (Sun)",
      symbol: "☉",
      sign: monthNum === 9 ? "กันย์ (Virgo)" : monthNum === 10 ? "ตุลย์ (Libra)" : "เมษ (Aries)",
      degree: `${(dayNum * 1.1 + 10).toFixed(1)}°`,
      element: "ไฟ",
      vibrationNumber: 1,
      aspectToSign: "ทำมุมตรีโกณ ส่องประกายบารมีและความเชื่อมั่น",
    },
    {
      planet: "จันทร์ (Moon)",
      symbol: "☽",
      sign: ["มีน (Pisces)", "เมษ (Aries)", "พฤษภ (Taurus)", "เมถุน (Gemini)"][dayNum % 4],
      degree: `${((dayNum * 13.2) % 30).toFixed(1)}°`,
      element: "น้ำ",
      vibrationNumber: 2,
      aspectToSign: "สถิตเรือนลาภะ หนุนสัญชาตญาณและเสน่ห์การเงิน",
    },
    {
      planet: "พฤหัสบดี (Jupiter)",
      symbol: "♃",
      sign: "เมถุน (Gemini)",
      degree: "16.4°",
      element: "ลม",
      vibrationNumber: 3,
      aspectToSign: "ขยายโอกาสทองและการเรียนรู้ โชคลาภทางไกล",
    },
    {
      planet: "ศุกร์ (Venus)",
      symbol: "♀",
      sign: "พิจิก (Scorpio)",
      degree: "21.8°",
      element: "น้ำ",
      vibrationNumber: 6,
      aspectToSign: "ดึงดูดทรัพย์ลึกลับ ความสัมพันธ์ลึกซึ้งน่าค้นหา",
    },
    {
      planet: "พุธ (Mercury)",
      symbol: "☿",
      sign: "กันย์ (Virgo)",
      degree: "24.2°",
      element: "ดิน",
      vibrationNumber: 5,
      aspectToSign: "เกษตราธิบดี ความคิดเฉียบคม วาจาปิดการขายเฉียบขาด",
    },
    {
      planet: "เสาร์ (Saturn)",
      symbol: "♄",
      sign: "มีน (Pisces)",
      degree: "14.1° [R]",
      element: "น้ำ",
      vibrationNumber: 8,
      aspectToSign: "เสริมความอดทนและสร้างฐานะระยะยาว",
    },
  ];

  const planetaryPositions = aiOverlay?.planetaryPositions?.length ? aiOverlay.planetaryPositions : basePlanets;

  const bestieNumerologyRoast = aiOverlay?.bestieNumerologyRoast ||
    `เลขมงคลระดับพรีเมียมเปิดทางให้ขนาดนี้แล้ว ถ้ายังนอนไถจอไม่ยอมส่งใบสมัครหรือปิดดีล ก็รอดูคนอื่นเขารวยไปก่อนนะเพื่อนสาว!`;

  const dailyCosmicAdvice = aiOverlay?.dailyCosmicAdvice ||
    `ในวันนี้กระแสคลื่นตัวเลขของ ${zodiac} สอดรับกับพลังของ ${profile.ruler} และ ${currentDayPlanet.name} เป็นพิเศษ การตั้งรหัสผ่านชั่วคราว การจดจำเลขชุด ${corePrimeNumber} หรือการติดต่อประสานงานในช่วง ${powerHours} จะช่วยเสริมแรงดึงดูดเชิงจิตวิทยาและความมั่นใจให้พุ่งสูงที่สุด`;

  const suggestedAction = aiOverlay?.suggestedAction ||
    `ตั้งจิตแน่วแน่ หันหน้าไปทาง ${powerDirection} ในช่วง ${powerHours} แล้วลงมือทำสิ่งสำคัญที่ผัดวันประกันพรุ่งไว้ทันที`;

  return {
    zodiacSign: profileKey,
    date: dateStr,
    dayOfWeek: dayOfWeekTh,
    rulingPlanet: profile.ruler,
    zodiacElement: profile.element,
    corePrimeNumber,
    secondaryNumbers,
    tripletNumbers,
    luckyPairs: selectedPairs,
    cautionNumbers,
    cautionReason,
    powerHours,
    powerDirection,
    cosmicColorVibe,
    planetaryPositions,
    bestieNumerologyRoast,
    dailyCosmicAdvice,
    suggestedAction,
  };
}

// Start server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, "0.0.0.0", () => {
    console.log(`✨ Server running on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
