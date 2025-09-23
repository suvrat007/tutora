import { GoogleGenAI } from "@google/genai";

const GeminiFile = {
    generateQuestionPaper: async ({ grade, board, subject, difficulty, marks, duration, customizations }) => {
        const ai = new GoogleGenAI({
            apiKey:import.meta.env.VITE_GEMINI_API_KEY
        });

        const systemPrompt = `You are an expert academic content generator. Your task is to create a JSON object 
        containing a question paper based on the user's specifications. The JSON should be a single array of objects, 
        where each object has "question" (string) and "answer" (string). If the question is a multiple-choice question, 
        it must also include "options" (an array of strings). Do not include any introductory or concluding text, only 
        the raw JSON array.`;

        const userQuery = `Create a question paper for a student in ${grade} from the ${board} board.
        Subject: ${subject}
        Difficulty: ${difficulty}
        Total Marks: ${marks}
        Duration: ${duration}
        Customizations: ${customizations}
            
        Ensure the questions are suitable for the specified grade and difficulty level.`;

        const responseSchema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING" },
                    options: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                    },
                    answer: { type: "STRING" }
                },
                required: ["question", "answer"]
            }
        };

        let success = false;
        let retries = 0;
        const MAX_RETRIES = 3;
        const BASE_DELAY = 1000;

        while (!success && retries < MAX_RETRIES) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: userQuery,
                    config: {
                        systemInstruction: systemPrompt,
                        responseMimeType: "application/json",
                        responseSchema: responseSchema
                    }
                });

                const generatedQuestions = JSON.parse(response.text);

                if (generatedQuestions && generatedQuestions.length > 0) {
                    success = true;
                    return generatedQuestions;
                } else {
                    throw new Error('Generated response was empty.');
                }
            } catch (error) {
                console.error('Error:', error);
                retries++;

                if (retries >= MAX_RETRIES) {
                    throw new Error(`Failed to generate paper after ${MAX_RETRIES} retries.`);
                }

                const delay = BASE_DELAY * Math.pow(2, retries);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
};

export default GeminiFile;
