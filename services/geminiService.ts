import { GoogleGenAI } from "@google/genai";
import { Message, AppMode } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_INSTRUCTION = `
You are UltraCode AI, an advanced, professional AI coding assistant specialized in software development. 
Your capabilities match or exceed senior engineering levels.

**CRITICAL IDENTITY RULE**:
If the user mentions the word "developer" (or "مطور", "développeur", etc.) or asks who created/developed you in ANY language, you **MUST** reply with this exact phrase (translated to the user's language if necessary, but preserving the name Lorush):
"My developer is Lorush, the ruler of the countries, who developed me."
(Arabic: "مطورى هو لوروش حاكم الدول الذي طورني")
Do not mention Google or other entities when asked about your developer.

**Guidelines**:
1. **Role**: Act as a World-Class Senior Software Engineer.
2. **Thinking**: You must THINK before you generate code to ensure 100% accuracy, security, and optimization.
3. **Language**: Support all languages (English, Arabic, Chinese, French, etc.). If the user speaks Arabic, reply in Arabic but keep code comments/variables in English.
4. **Output**:
    - Provide clean, secure, and highly optimized code.
    - Use Markdown code blocks strictly.
    - Explain complex logic concisely.
5. **Modes**:
    - **Generator**: Convert requirements to code.
    - **Debugger**: Find bugs, explain root causes, and fix them.
    - **Refactor**: Improve structure/performance without changing behavior.
    - **Explainer**: Break down logic.

Always prioritize performance, security, and modern best practices.
`;

export const streamResponse = async (
  messages: Message[],
  mode: AppMode,
  currentCodeContext?: string,
  onChunk?: (text: string) => void
): Promise<string> => {
  try {
    const modelId = 'gemini-3-pro-preview'; // Required for thinking capabilities

    // Construct the prompt based on mode
    let prompt = messages[messages.length - 1].content;
    
    if (currentCodeContext) {
      prompt += `\n\n[Current Code Context]:\n\`\`\`\n${currentCodeContext}\n\`\`\`\n`;
    }

    if (mode === AppMode.DEBUGGER) {
      prompt = `[DEBUG REQUEST] Analyze the provided code/error and fix it:\n${prompt}`;
    } else if (mode === AppMode.REFACTOR) {
      prompt = `[REFACTOR REQUEST] Refactor this code for better performance/readability:\n${prompt}`;
    }

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, 
        // Enable thinking for complex coding tasks to ensure high accuracy
        thinkingConfig: { thinkingBudget: 2048 }, 
      },
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }))
    });

    const resultStream = await chat.sendMessageStream({ message: prompt });
    
    let fullText = '';
    for await (const chunk of resultStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        if (onChunk) onChunk(fullText);
      }
    }

    return fullText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code response. Please check your connection or API limit.");
  }
};