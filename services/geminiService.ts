
import { GoogleGenAI, Type } from "@google/genai";
import { Priority, Todo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const breakdownTask = async (taskTitle: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Break down this task into 3-5 actionable sub-tasks: "${taskTitle}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subtasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["subtasks"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.subtasks;
  } catch (e) {
    console.error("Failed to parse AI breakdown", e);
    return [];
  }
};

export const suggestPriority = async (taskTitle: string, description: string = ''): Promise<Priority> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this task title: "${taskTitle}" and description: "${description}", suggest a priority (low, medium, or high).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
        },
        required: ["priority"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.priority as Priority;
  } catch (e) {
    return 'medium';
  }
};

export const getSmartProductivityAdvice = async (todos: Todo[]): Promise<string> => {
  const pendingTasks = todos.filter(t => !t.completed).map(t => `${t.title} (${t.priority} priority)`);
  const prompt = `I have these pending tasks: ${pendingTasks.join(', ')}. What should I focus on first for maximum impact? Give a concise 2-sentence advice.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "Keep going! You're doing great.";
};
