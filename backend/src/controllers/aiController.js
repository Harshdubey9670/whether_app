import { GoogleGenAI } from '@google/genai';

// @desc    Ask AI assistant a weather-related question
// @route   POST /api/ai/ask
// @access  Private (or Public for now)
const askAI = async (req, res, next) => {
  try {
    const { question, contextData, history } = req.body;
    
    if (!question && (!history || history.length === 0)) {
      res.status(400);
      throw new Error('Please provide a question or chat history');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.json({
        answer: "I'm sorry, my AI capabilities are currently offline. Please configure the API key in the backend .env file.",
        mock: true
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const systemPrompt = `You are WeatherVerse AI, an expert and helpful meteorology and lifestyle assistant.
You provide highly accurate, concise, and friendly advice based on current weather conditions.
You specialize in:
1. Weather Explanations (making complex meteorology easy to understand)
2. Clothing Recommendations
3. Travel & Commute Advice
4. Farming & Agriculture Advice
5. Outdoor Activity Suggestions
6. Health Recommendations (UV, Air Quality, Humidity effects)

When weather context is provided, ALWAYS tailor your advice to it. Keep your answers conversational, well-formatted (use markdown bullet points if needed), but concise (2-4 sentences max unless detailing a list). Do not use placeholders.

Current Weather Context: ${contextData ? JSON.stringify(contextData) : 'None provided'}`;

    let contents = [];

    // If there is chat history, format it for Gemini
    if (history && Array.isArray(history)) {
      contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
    }

    // Add the system instructions and current question
    const currentMessage = {
      role: 'user',
      parts: [
        { text: `System Instructions: ${systemPrompt}\n\nUser Question: ${question || 'Hello'}` }
      ]
    };
    
    // If no history, just send the current message. If history exists, append the current message.
    // However, Gemini requires strictly alternating roles (user, model, user, model). 
    // To avoid role errors, we can just inject the system prompt into the first user message if history is empty,
    // or prepend a system instruction if the API supports it. The `GoogleGenAI` SDK supports `systemInstruction` directly.

    let response;
    
    try {
      if (history && history.length > 0) {
        // Construct standard history
        const formattedHistory = history.map(msg => ({
          role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));
        
        if (question) {
           formattedHistory.push({
             role: 'user',
             parts: [{ text: question }]
           });
        }
        
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: formattedHistory,
          config: {
             systemInstruction: systemPrompt
          }
        });
      } else {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: question,
          config: {
             systemInstruction: systemPrompt
          }
        });
      }
    } catch (apiError) {
      // Fallback if systemInstruction fails due to older SDK versions
      const fallbackPrompt = `${systemPrompt}\n\nUser: ${question}`;
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fallbackPrompt,
      });
    }

    res.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("AI Error:", error);
    next(error);
  }
};

export { askAI };
