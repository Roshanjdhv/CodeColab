"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Code completion action
export const completeCode = action({
  args: {
    code: v.string(),
    language: v.string(),
    cursorPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const beforeCursor = args.code.substring(0, args.cursorPosition);
    const afterCursor = args.code.substring(args.cursorPosition);

    const prompt = `You are CodeMentor, an AI coding assistant. Complete the following ${args.language} code at the cursor position. Provide only the completion text, no explanations.

Code before cursor:
\`\`\`${args.language}
${beforeCursor}
\`\`\`

Code after cursor:
\`\`\`${args.language}
${afterCursor}
\`\`\`

Provide a short, relevant code completion that fits naturally at the cursor position:`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
      });

      const completion = response.choices[0].message.content?.trim() || "";
      
      return {
        completion,
        success: true,
      };
    } catch (error) {
      console.error("Code completion error:", error);
      return {
        completion: "",
        success: false,
        error: "Failed to generate code completion",
      };
    }
  },
});

// Error analysis and solution
export const analyzeError = action({
  args: {
    code: v.string(),
    error: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = `You are CodeMentor, an expert coding assistant. Analyze this ${args.language} code error and provide a solution.

Code:
\`\`\`${args.language}
${args.code}
\`\`\`

Error:
${args.error}

Provide:
1. A clear explanation of what's causing the error
2. The corrected code
3. A brief explanation of the fix

Format your response as JSON:
{
  "explanation": "Clear explanation of the error",
  "correctedCode": "The fixed code",
  "fixExplanation": "Brief explanation of what was changed"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.2,
      });

      const content = response.choices[0].message.content?.trim() || "";
      
      try {
        const parsed = JSON.parse(content);
        return {
          ...parsed,
          success: true,
        };
      } catch {
        return {
          explanation: content,
          correctedCode: args.code,
          fixExplanation: "Could not parse AI response",
          success: true,
        };
      }
    } catch (error) {
      console.error("Error analysis error:", error);
      return {
        explanation: "Failed to analyze error",
        correctedCode: args.code,
        fixExplanation: "AI service unavailable",
        success: false,
      };
    }
  },
});

// AI Chat for coding questions
export const chatWithCodeMentor = action({
  args: {
    message: v.string(),
    code: v.optional(v.string()),
    language: v.optional(v.string()),
    conversationHistory: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const systemPrompt = `You are CodeMentor, a friendly and expert AI coding assistant. You help developers with:
- Code explanations and reviews
- Debugging and error fixing
- Best practices and optimization
- Learning new concepts
- Code completion and suggestions

Always be helpful, clear, and provide practical examples. If code is provided, analyze it carefully and give specific feedback.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history
    if (args.conversationHistory) {
      messages.push(...args.conversationHistory);
    }

    // Format user message with code if provided
    let userMessage = args.message;
    if (args.code && args.language) {
      userMessage += `\n\nHere's my ${args.language} code:\n\`\`\`${args.language}\n${args.code}\n\`\`\``;
    }

    messages.push({ role: "user", content: userMessage });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const reply = response.choices[0].message.content?.trim() || "I'm sorry, I couldn't generate a response.";
      
      return {
        reply,
        success: true,
      };
    } catch (error) {
      console.error("CodeMentor chat error:", error);
      return {
        reply: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        success: false,
      };
    }
  },
});

// Code explanation
export const explainCode = action({
  args: {
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = `You are CodeMentor, an expert coding teacher. Explain this ${args.language} code in a clear, educational way.

Code:
\`\`\`${args.language}
${args.code}
\`\`\`

Provide:
1. A high-level overview of what the code does
2. Line-by-line or section-by-section breakdown
3. Key concepts and patterns used
4. Any potential improvements or best practices

Make it educational and easy to understand.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.4,
      });

      const explanation = response.choices[0].message.content?.trim() || "";
      
      return {
        explanation,
        success: true,
      };
    } catch (error) {
      console.error("Code explanation error:", error);
      return {
        explanation: "Failed to explain code. AI service unavailable.",
        success: false,
      };
    }
  },
});

// Code optimization suggestions
export const optimizeCode = action({
  args: {
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = `You are CodeMentor, an expert code reviewer. Analyze this ${args.language} code and suggest optimizations.

Code:
\`\`\`${args.language}
${args.code}
\`\`\`

Provide:
1. Performance improvements
2. Code readability enhancements
3. Best practices recommendations
4. Optimized version of the code if applicable

Format as JSON:
{
  "suggestions": ["list of improvement suggestions"],
  "optimizedCode": "improved version of the code",
  "explanation": "explanation of the improvements made"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content?.trim() || "";
      
      try {
        const parsed = JSON.parse(content);
        return {
          ...parsed,
          success: true,
        };
      } catch {
        return {
          suggestions: [content],
          optimizedCode: args.code,
          explanation: "Could not parse optimization suggestions",
          success: true,
        };
      }
    } catch (error) {
      console.error("Code optimization error:", error);
      return {
        suggestions: ["AI service unavailable"],
        optimizedCode: args.code,
        explanation: "Failed to analyze code for optimization",
        success: false,
      };
    }
  },
});
