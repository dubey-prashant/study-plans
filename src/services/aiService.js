import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateResponse = async (prompt, chatHistory = []) => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        ...chatHistory.map((msg) => ({
          role: msg.isUser ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      console.log(
        'Response from Gemini API:',
        response.data.candidates[0].content.parts[0].text
      );
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
};
