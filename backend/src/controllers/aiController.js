import { GoogleGenAI } from '@google/genai';

// @desc    Ask AI assistant a weather-related question
// @route   POST /api/ai/ask
// @access  Private (or Public for now)
const askAI = async (req, res, next) => {
  try {
    const { question, contextData } = req.body;
    
    if (!question) {
      res.status(400);
      throw new Error('Please provide a question');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.json({
        answer: "I'm sorry, my AI capabilities are currently offline. Please configure the API key.",
        mock: true
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Create a prompt that includes the weather context if available
    let prompt = `You are an expert, helpful WeatherVerse AI assistant. Keep your answer concise (2-3 sentences). Answer the following question: "${question}"\n`;
    
    if (contextData) {
      prompt += `\nHere is the current weather context for the user: ${JSON.stringify(contextData)}\n`;
      prompt += `Base your answer on this context if relevant to the question.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      answer: response.text,
    });
  } catch (error) {
    next(error);
  }
};

export { askAI };
