import { GoogleGenAI } from "@google/genai";
import { Student, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFinancialAdvice = async (
  query: string, 
  students: Student[], 
  transactions: Transaction[]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Prepare a summary of the data to keep context size reasonable
    const dataContext = JSON.stringify({
      totalStudents: students.length,
      totalBalance: students.reduce((acc, s) => acc + s.balance, 0),
      topSavers: students.sort((a, b) => b.balance - a.balance).slice(0, 5).map(s => ({ name: s.name, balance: s.balance })),
      recentTransactions: transactions.slice(0, 10),
      transactionSummary: {
        totalDeposits: transactions.filter(t => t.type === 'DEPOSIT').length,
        totalWithdrawals: transactions.filter(t => t.type === 'WITHDRAWAL').length,
      }
    });

    const prompt = `
      You are an intelligent financial assistant for a school savings application called "TabunganKu".
      
      Here is the current school financial data context (JSON):
      ${dataContext}

      User Query: "${query}"

      Please answer the user's query based on the data provided. 
      - Be encouraging and educational about saving money.
      - If asked about specific students in the "topSavers" list, mention them.
      - Provide insights on trends if asked.
      - Keep the answer concise (under 150 words) and formatted nicely.
      - Use Indonesian language (Bahasa Indonesia).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Maaf, saya tidak dapat menganalisis data saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten pintar. Pastikan API Key valid.";
  }
};