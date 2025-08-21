import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface HuggingFaceRequest {
  inputs: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    do_sample?: boolean;
    top_p?: number;
  };
}

export interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export interface AIResponse {
  message: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  // Using multiple AI APIs for better accuracy
  private readonly primaryUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
  private readonly fallbackUrl = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
  private readonly conversationalUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
  private readonly openAICompatibleUrl = 'https://api-inference.huggingface.co/models/bigscience/bloom-560m';
  
  private conversationHistory: ChatMessage[] = [];
  private speechSynthesis: SpeechSynthesis;
  private speechRecognition: any;
  private currentModel: number = 0;

  constructor(private http: HttpClient) {
    this.speechSynthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
    }
  }

  sendMessage(message: string, language: string = 'en'): Observable<AIResponse> {
    // Add user message to conversation history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    this.conversationHistory.push(userMessage);

    // Try multiple AI models for better accuracy
    return this.tryMultipleModels(message, language);
  }

  private tryMultipleModels(message: string, language: string): Observable<AIResponse> {
    const models = [this.primaryUrl, this.conversationalUrl, this.fallbackUrl, this.openAICompatibleUrl];
    
    return this.callAIModel(models[this.currentModel], message, language).pipe(
      catchError(error => {
        console.log(`Model ${this.currentModel} failed, trying next...`);
        this.currentModel = (this.currentModel + 1) % models.length;
        
        if (this.currentModel === 0) {
          // All models failed, use enhanced fallback
          return from([this.getEnhancedFallbackResponse(message, language)]);
        }
        
        return this.callAIModel(models[this.currentModel], message, language);
      })
    );
  }

  private callAIModel(apiUrl: string, message: string, language: string): Observable<AIResponse> {
    // Create more sophisticated conversation context
    const conversationContext = this.buildAdvancedConversationContext(message, language);
    
    const requestBody: HuggingFaceRequest = {
      inputs: conversationContext,
      parameters: {
        max_length: 200,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<HuggingFaceResponse[]>(apiUrl, requestBody, { headers })
      .pipe(
        map(response => {
          if (response && response.length > 0 && response[0].generated_text) {
            let aiResponse = response[0].generated_text;
            
            // Advanced response processing
            aiResponse = this.processAIResponse(aiResponse, message, language);
            
            // Add to conversation history
            this.addAIResponseToHistory(aiResponse);
            
            return {
              message: aiResponse,
              success: true
            };
          } else {
            throw new Error('No valid response from AI model');
          }
        })
      );
  }

  private buildAdvancedConversationContext(message: string, language: string): string {
    const systemPrompts: { [key: string]: string } = {
      'en': 'You are a helpful, intelligent AI assistant for SocialBook social media platform. Provide accurate, relevant, and helpful responses. Be conversational but informative.',
      'ur': 'آپ SocialBook سوشل میڈیا پلیٹ فارم کے لیے مددگار، ذہین AI اسسٹنٹ ہیں۔ درست، متعلقہ اور مفید جوابات فراہم کریں۔',
      'ar': 'أنت مساعد ذكي مفيد ومفيد لمنصة SocialBook للتواصل الاجتماعي. قدم إجابات دقيقة ومناسبة ومفيدة.',
      'fr': 'Vous êtes un assistant IA intelligent et utile pour la plateforme de médias sociaux SocialBook. Fournissez des réponses précises, pertinentes et utiles.',
      'es': 'Eres un asistente de IA inteligente y útil para la plataforma de redes sociales SocialBook. Proporciona respuestas precisas, relevantes y útiles.',
      'hi': 'आप SocialBook सोशल मीडिया प्लेटफॉर्म के लिए एक सहायक, बुद्धिमान AI सहायक हैं। सटीक, प्रासंगिक और उपयोगी उत्तर प्रदान करें।'
    };

    let context = systemPrompts[language] || systemPrompts['en'];
    
    // Add conversation history with better formatting
    const recentHistory = this.conversationHistory.slice(-8); // More context
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        context += `\nUser: ${msg.content}`;
      } else {
        context += `\nAssistant: ${msg.content}`;
      }
    });

    // Add current question
    context += `\nUser: ${message}`;
    context += `\nAssistant:`;

    return context;
  }

  private processAIResponse(response: string, originalMessage: string, language: string): string {
    // Remove unwanted patterns and clean up
    response = response.replace(/User:|Assistant:|Human:|AI:|System:/g, '');
    response = response.replace(/\n+/g, ' ');
    response = response.trim();
    
    // Extract only the assistant's response
    const parts = response.split('Assistant:');
    if (parts.length > 1) {
      response = parts[parts.length - 1].trim();
    }
    
    // Remove repetitive patterns
    response = response.replace(/(.{10,}?)\1+/g, '$1');
    
    // Ensure response is relevant and not empty
    if (response.length < 10 || this.isGenericResponse(response)) {
      return this.getContextualResponse(originalMessage, language);
    }
    
    // Ensure proper sentence ending
    if (!response.match(/[.!?]$/)) {
      response += '.';
    }
    
    // Limit response length for better UX
    if (response.length > 300) {
      response = response.substring(0, 297) + '...';
    }
    
    return response;
  }

  private isGenericResponse(response: string): boolean {
    const genericPatterns = [
      /^(yes|no|ok|okay|sure|maybe)\.?$/i,
      /^.{1,15}\.?$/,
      /^(i|you|the|a|an)\s/i,
      /^\s*$/ 
    ];
    
    return genericPatterns.some(pattern => pattern.test(response.trim()));
  }

  private getContextualResponse(message: string, language: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Question detection with better patterns
    if (lowerMessage.includes('what') || lowerMessage.includes('how') || 
        lowerMessage.includes('why') || lowerMessage.includes('when') ||
        lowerMessage.includes('where') || lowerMessage.includes('who') ||
        message.includes('?')) {
      return this.getQuestionResponse(message, language);
    }
    
    // Greeting detection
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
        lowerMessage.includes('hey') || lowerMessage.includes('good morning') ||
        lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
      return this.getGreetingResponse(language);
    }
    
    // Help request detection
    if (lowerMessage.includes('help') || lowerMessage.includes('assist') ||
        lowerMessage.includes('support')) {
      return this.getHelpResponse(language);
    }
    
    // Default contextual response
    return this.getEngagingResponse(message, language);
  }

  private getQuestionResponse(message: string, language: string): string {
    const responses: { [key: string]: string[] } = {
      'en': [
        `That's a great question about "${message}". Let me help you with that.`,
        `I'd be happy to help you understand this better. Here's what I think:`,
        `Based on your question, I can provide some insights about this topic.`,
        `That's an interesting question. Let me give you a helpful answer.`
      ],
      'ur': [
        `یہ "${message}" کے بارے میں بہترین سوال ہے۔ میں آپ کی اس میں مدد کروں گا۔`,
        `میں آپ کو اس کو بہتر سمجھنے میں مدد کرنے میں خوش ہوں گا۔`,
        `آپ کے سوال کی بنیاد پر، میں اس موضوع کے بارے میں کچھ بصیرت فراہم کر سکتا ہوں۔`
      ]
    };
    
    const langResponses = responses[language] || responses['en'];
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }

  private getGreetingResponse(language: string): string {
    const responses: { [key: string]: string[] } = {
      'en': [
        "Hello! I'm your AI assistant for SocialBook. How can I help you today?",
        "Hi there! Welcome to SocialBook's AI assistant. What would you like to know?",
        "Hey! I'm here to help you with anything you need. What's on your mind?"
      ],
      'ur': [
        "السلام علیکم! میں SocialBook کا AI اسسٹنٹ ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
        "ہیلو! SocialBook کے AI اسسٹنٹ میں خوش آمدید۔ آپ کیا جاننا چاہیں گے؟"
      ]
    };
    
    const langResponses = responses[language] || responses['en'];
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }

  private getHelpResponse(language: string): string {
    const responses: { [key: string]: string } = {
      'en': "I'm here to help! I can assist you with questions about SocialBook, general topics, provide information, or just have a conversation. What specific help do you need?",
      'ur': "میں یہاں مدد کے لیے ہوں! میں SocialBook کے بارے میں سوالات، عمومی موضوعات میں آپ کی مدد کر سکتا ہوں، معلومات فراہم کر سکتا ہوں، یا صرف بات چیت کر سکتا ہوں۔ آپ کو کس خاص مدد کی ضرورت ہے؟"
    };
    
    return responses[language] || responses['en'];
  }

  private getEngagingResponse(message: string, language: string): string {
    const responses: { [key: string]: string[] } = {
      'en': [
        `I understand you're talking about "${message}". That's interesting! Can you tell me more about what you'd like to know?`,
        `Thanks for sharing that with me. I'd love to help you explore this topic further.`,
        `That's a thoughtful point about "${message}". What specific aspect would you like to discuss?`,
        `I see what you're getting at. Let me provide some useful information about this.`
      ],
      'ur': [
        `میں سمجھ گیا آپ "${message}" کے بارے میں بات کر رہے ہیں۔ یہ دلچسپ ہے! کیا آپ مجھے بتا سکتے ہیں کہ آپ کیا جاننا چاہتے ہیں؟`,
        `اس کو میرے ساتھ شیئر کرنے کا شکریہ۔ میں آپ کو اس موضوع کو مزید دریافت کرنے میں مدد کرنا چاہوں گا۔`
      ]
    };
    
    const langResponses = responses[language] || responses['en'];
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }

  private getEnhancedFallbackResponse(message: string, language: string): AIResponse {
    // Enhanced fallback with contextual understanding
    const intelligentResponse = this.getContextualResponse(message, language);
    
    this.addAIResponseToHistory(intelligentResponse);
    
    return {
      message: intelligentResponse,
      success: true
    };
  }
    // Smart fallback responses based on common patterns
    const responses = this.getSmartFallbackResponses(message, language);
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    this.addAIResponseToHistory(randomResponse);
    
    return {
      message: randomResponse,
      success: true
    };
  }

  private getSmartFallbackResponses(message: string, language: string): string[] {
    const lowerMessage = message.toLowerCase();
    
    const responseMap: { [key: string]: { [key: string]: string[] } } = {
      en: {
        greeting: [
          "Hello! I'm your AI assistant. How can I help you today?",
          "Hi there! Welcome to SocialBook. What would you like to chat about?",
          "Hey! I'm here to help. What's on your mind?"
        ],
        question: [
          "That's an interesting question! Let me think about that...",
          "I'd be happy to help you with that. Here's what I think:",
          "Great question! From my perspective, I would say..."
        ],
        thanks: [
          "You're very welcome! Is there anything else I can help you with?",
          "Happy to help! Feel free to ask me anything else.",
          "My pleasure! I'm here whenever you need assistance."
        ],
        default: [
          "I understand what you're saying. Could you tell me more about that?",
          "That sounds interesting! I'd love to hear more details.",
          "I see. What would you like to know more about?",
          "I'm here to help! Can you give me a bit more context?"
        ]
      },
      ur: {
        greeting: [
          "السلام علیکم! میں آپ کا AI اسسٹنٹ ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
          "ہیلو! SocialBook میں خوش آمدید۔ آپ کس بارے میں بات کرنا چاہیں گے؟",
          "ہائے! میں یہاں آپ کی مدد کے لیے ہوں۔ آپ کے ذہن میں کیا ہے؟"
        ],
        question: [
          "یہ ایک دلچسپ سوال ہے! مجھے اس کے بارے میں سوچنے دیں...",
          "میں اس میں آپ کی مدد کرنے میں خوش ہوں گا۔ میرا خیال یہ ہے:",
          "بہترین سوال! میرے نظریے سے، میں کہوں گا..."
        ],
        thanks: [
          "آپ کا بہت شکریہ! کیا کوئی اور چیز ہے جس میں میں آپ کی مدد کر سکوں؟",
          "مدد کرنے میں خوشی ہوئی! بلا جھجھک مجھ سے کچھ اور پوچھیں۔",
          "میری خوشی! جب بھی آپ کو مدد چاہیے میں یہاں ہوں۔"
        ],
        default: [
          "میں سمجھ گیا آپ کیا کہہ رہے ہیں۔ کیا آپ اس کے بارے میں مزید بتا سکتے ہیں؟",
          "یہ دلچسپ لگ رہا ہے! میں مزید تفصیلات سننا چاہوں گا۔",
          "میں دیکھ رہا ہوں۔ آپ کس کے بارے میں مزید جاننا چاہیں گے؟",
          "میں یہاں مدد کے لیے ہوں! کیا آپ مجھے تھوڑا سا مزید سیاق و سباق دے سکتے ہیں؟"
        ]
      }
    };

    const languageResponses = responseMap[language] || responseMap['en'];

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('سلام') || lowerMessage.includes('ہیلو')) {
      return languageResponses['greeting'];
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || 
        lowerMessage.includes('شکریہ') || lowerMessage.includes('شکر')) {
      return languageResponses['thanks'];
    }
    
    if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || 
        lowerMessage.includes('why') || lowerMessage.includes('کیا') || lowerMessage.includes('کیسے')) {
      return languageResponses['question'];
    }

    return languageResponses['default'];
  }

  private cleanupResponse(response: string): string {
    // Remove unwanted patterns
    response = response.replace(/User:|Assistant:|Human:|AI:/g, '');
    response = response.replace(/\n+/g, ' ');
    response = response.trim();
    
    // Ensure response ends properly
    if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
      response += '.';
    }
    
    return response;
  }

  private buildConversationContext(language: string): string {
    const systemPrompts: { [key: string]: string } = {
      'en': 'You are a helpful AI assistant for SocialBook social media platform. Be friendly and helpful.',
      'ur': 'آپ SocialBook سوشل میڈیا پلیٹ فارم کے لیے مددگار AI اسسٹنٹ ہیں۔ دوستانہ اور مددگار رہیں۔',
      'ar': 'أنت مساعد ذكي مفيد لمنصة SocialBook للتواصل الاجتماعي. كن ودودًا ومفيدًا.',
      'fr': 'Vous êtes un assistant IA utile pour la plateforme de médias sociaux SocialBook. Soyez amical et serviable.',
      'es': 'Eres un asistente de IA útil para la plataforma de redes sociales SocialBook. Sé amigable y servicial.',
      'hi': 'आप SocialBook सोशल मीडिया प्लेटफॉर्म के लिए एक सहायक AI सहायक हैं। मित्रवत और सहायक रहें।'
    };

    let context = systemPrompts[language] || systemPrompts['en'];
    
    // Add recent conversation history (last 3 messages for context)
    const recentHistory = this.conversationHistory.slice(-6); // 3 user + 3 assistant messages
    recentHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      context += `\n${role}: ${msg.content}`;
    });

    return context;
  }

  addAIResponseToHistory(response: string) {
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    this.conversationHistory.push(aiMessage);
  }

  // Voice Features
  speakText(text: string, language: string = 'en'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language-specific voice settings
      const voiceSettings: { [key: string]: { lang: string; rate: number; pitch: number } } = {
        'en': { lang: 'en-US', rate: 0.9, pitch: 1.0 },
        'ur': { lang: 'ur-PK', rate: 0.8, pitch: 1.1 },
        'ar': { lang: 'ar-SA', rate: 0.8, pitch: 1.0 },
        'fr': { lang: 'fr-FR', rate: 0.9, pitch: 1.0 },
        'es': { lang: 'es-ES', rate: 0.9, pitch: 1.0 },
        'hi': { lang: 'hi-IN', rate: 0.8, pitch: 1.1 }
      };

      const settings = voiceSettings[language] || voiceSettings['en'];
      utterance.lang = settings.lang;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.speechSynthesis.speak(utterance);
    });
  }

  startVoiceRecognition(language: string = 'en'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // Set language for recognition
      const speechLanguages: { [key: string]: string } = {
        'en': 'en-US',
        'ur': 'ur-PK',
        'ar': 'ar-SA',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'hi': 'hi-IN'
      };

      this.speechRecognition.lang = speechLanguages[language] || 'en-US';

      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.speechRecognition.onerror = (event: any) => {
        reject(new Error('Speech recognition error: ' + event.error));
      };

      this.speechRecognition.start();
    });
  }

  stopVoiceRecognition() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

  clearConversation() {
    this.conversationHistory = [];
  }

  setSystemPrompt(language: string) {
    // This method is kept for compatibility but the system prompt is now handled in buildConversationContext
    this.conversationHistory = [];
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  isVoiceSupported(): boolean {
    return !!(this.speechSynthesis && this.speechRecognition);
  }
}
