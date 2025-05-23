import axios from 'axios';
import { getGLPSystemPrompt } from '../utils/system.prompt';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

export const generateResponse = async (prompt, systemPrompt = '') => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        {
          role: 'model',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      console.log(
        'Response from Gemini API:',
        response,
        response.data.candidates[0].content.parts[0].text
      );
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

export const generateGLPResponse = async (prompt) => {
  const examples = await fetch('/GLPexamples.html').then((response) =>
    response.text()
  );
  const systemPrompt = getGLPSystemPrompt(examples);

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        {
          role: 'model',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      console.log(
        'Response from Gemini API:',
        response,
        response.data.candidates[0].content.parts[0].text
      );
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

export const generateCMCResponse = async (prompt) => {
  const examples = await fetch('/examples.html').then((response) =>
    response.text()
  );
  const systemPrompt = getGLPSystemPrompt('');

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        {
          role: 'model',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      console.log(
        'Response from Gemini API:',
        response,
        response.data.candidates[0].content.parts[0].text
      );
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

export const generateINDResponse = async (prompt) => {
  const examples = await fetch('/examples.html').then((response) =>
    response.text()
  );
  const systemPrompt = getGLPSystemPrompt('');

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        {
          role: 'model',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      console.log(
        'Response from Gemini API:',
        response,
        response.data.candidates[0].content.parts[0].text
      );
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
