
import { GoogleGenAI } from "@google/genai";
import { AnalyticsData } from '../types';

// Fix: Safely initialize GoogleGenAI client and check for API key.
// The client is now created inside the function to avoid app crash on startup if API key is missing.
export const generateAnalyticsInsights = async (analyticsData: AnalyticsData): Promise<string> => {
  // Fix: Per guidelines, assume API_KEY is present and initialize client directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = 'gemini-2.5-flash';
  const prompt = `
    Analyze the following digital business card analytics data and provide actionable insights.
    The user is a professional looking to improve their networking effectiveness.
    Provide the analysis in markdown format with clear headings.

    Data:
    - Total Views: ${analyticsData.totalViews}
    - Unique Scans: ${analyticsData.uniqueScans}
    - Average Time on Page: ${analyticsData.timeOnPage} seconds
    - Top Viewer Locations: ${analyticsData.locations.map(l => `${l.city}, ${l.country} (${l.count} views)`).join(', ')}
    - Device Breakdown: ${analyticsData.devices.map(d => `${d.type} (${d.count} users)`).join(', ')}

    Analysis Required:
    1.  **Overall Performance:** Give a summary of the card's performance. Is it effective?
    2.  **Engagement Insights:** What does the time on page and unique scan rate suggest about viewer engagement?
    3.  **Geographic Reach:** What can be inferred from the top viewer locations? Are there any networking opportunities in these areas?
    4.  **Audience Technology:** What does the device breakdown tell about the audience?
    5.  **Lead Quality Score:** Based on all the data, provide a "Lead Quality Score" from 1-100 and justify it. A high score means the card is attracting highly engaged, relevant contacts.
    6.  **Actionable Recommendations:** Provide 3 concrete, actionable recommendations for the user to improve their card's effectiveness.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating insights from Gemini:", error);
    return "There was an error generating AI insights. Please try again later.";
  }
};
