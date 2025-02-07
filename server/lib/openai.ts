import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const completionResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1)
});

export async function generateCompletion(context: string): Promise<{ text: string, confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant. Generate a natural continuation for the given text. Respond with JSON containing the suggested text and a confidence score between 0-1."
        },
        {
          role: "user",
          content: context
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = completionResponseSchema.parse(
      JSON.parse(response.choices[0].message.content || "{}")
    );

    return result;
  } catch (error) {
    console.error("OpenAI completion error:", error);
    throw new Error("Failed to generate completion");
  }
}

const summaryResponseSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string())
});

export async function generateSummary(text: string): Promise<{ summary: string, keyPoints: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Summarize the given text and extract key points. Respond with JSON containing a concise summary and array of key points."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = summaryResponseSchema.parse(
      JSON.parse(response.choices[0].message.content || "{}")
    );

    return result;
  } catch (error) {
    console.error("OpenAI summary error:", error);
    throw new Error("Failed to generate summary");
  }
}
