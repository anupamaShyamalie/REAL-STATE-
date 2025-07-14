import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY||"AIzaSyBK6d3BNoBXyyz4z4BqIsa6mONKyqismpA";
const genAI = new GoogleGenerativeAI(API_KEY);

// Real estate context for better responses
const REAL_ESTATE_CONTEXT = `
You are a professional real estate assistant helping users create property listings. 
Your expertise includes:
- Property valuation and pricing strategies
- Writing compelling property descriptions
- Identifying key amenities and selling points
- Real estate market trends
- Property photography tips
- Legal and regulatory guidance for listings

Always provide helpful, accurate, and professional advice specific to real estate.
Keep responses concise but informative. If asked about specific locations or current market data, 
acknowledge that you may need current market information for the most accurate advice.
`;

export class GeminiChatService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: REAL_ESTATE_CONTEXT
    });
    this.chatHistory = [];
  }

  async sendMessage(userMessage, propertyData = null) {
    try {
      // Include property context if available
      let contextualMessage = userMessage;
      if (propertyData) {
        const propertyContext = this.buildPropertyContext(propertyData);
        contextualMessage = `${propertyContext}\n\nUser Question: ${userMessage}`;
      }

      // Start a new chat session with history
      const chat = this.model.startChat({
        history: this.chatHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage(contextualMessage);
      const response = await result.response;
      const aiMessage = response.text();

      // Update chat history
      this.chatHistory.push(
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: aiMessage }] }
      );

      // Keep history manageable (last 10 exchanges)
      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }

      return aiMessage;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  buildPropertyContext(formData) {
    const context = [];
    
    if (formData.title) context.push(`Property Title: ${formData.title}`);
    if (formData.price) context.push(`Price: $${formData.price.toLocaleString()}`);
    if (formData.address) context.push(`Address: ${formData.address}`);
    if (formData.city) context.push(`City: ${formData.city}`);
    if (formData.type) context.push(`Listing Type: ${formData.type}`);
    if (formData.property) context.push(`Property Type: ${formData.property}`);
    if (formData.bedroom) context.push(`Bedrooms: ${formData.bedroom}`);
    if (formData.bathroom) context.push(`Bathrooms: ${formData.bathroom}`);
    if (formData.size) context.push(`Size: ${formData.size} sqft`);
    if (formData.description) context.push(`Current Description: ${formData.description}`);

    return context.length > 0 
      ? `Current Property Information:\n${context.join('\n')}`
      : '';
  }

  clearHistory() {
    this.chatHistory = [];
  }

  // Predefined smart suggestions based on context
  getSmartSuggestions(propertyData) {
    const suggestions = [];
    
    if (!propertyData.price || propertyData.price === 0) {
      suggestions.push("What's a good price for my property?");
    }
    
    if (!propertyData.description || propertyData.description.trim() === '') {
      suggestions.push("Help me write a description");
    }
    
    if (propertyData.type === 'rent') {
      suggestions.push("What rental policies should I include?");
    }
    
    if (propertyData.property === 'house') {
      suggestions.push("What amenities should I highlight for a house?");
    }
    
    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        "Suggest pricing strategy",
        "Improve my description",
        "Marketing tips for this property"
      );
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

}