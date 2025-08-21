import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService } from '../services/ai.service';
import { HttpClientModule } from '@angular/common/http';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language: string;
  isVoice?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent implements OnInit {
  messages: Message[] = [];
  userInput: string = '';
  selectedLanguage: string = 'en';
  isListening: boolean = false;
  isTyping: boolean = false;
  isMuted: boolean = false;
  isConnected: boolean = true;
  errorMessage: string = '';
  voiceSupported: boolean = false;
  
  languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ];

  constructor(private aiService: AIService) {}

  ngOnInit() {
    this.aiService.setSystemPrompt(this.selectedLanguage);
    this.voiceSupported = this.aiService.isVoiceSupported();
    this.addWelcomeMessage();
  }

  addWelcomeMessage() {
    const welcomeMsg: Message = {
      id: Date.now(),
      text: this.getWelcomeMessage(),
      sender: 'ai',
      timestamp: new Date(),
      language: this.selectedLanguage
    };
    this.messages.push(welcomeMsg);
  }

  getWelcomeMessage(): string {
    const welcomeMessages: { [key: string]: string } = {
      'en': 'Hello! I\'m your AI Assistant. I can speak multiple languages and help you with voice or text chat.',
      'ur': 'السلام علیکم! میں آپ کا AI اسسٹنٹ ہوں۔ میں متعدد زبانیں بول سکتا ہوں اور آواز یا متن کے ذریعے آپ کی مدد کر سکتا ہوں۔',
      'ar': 'مرحبا! أنا مساعدك الذكي. يمكنني التحدث بعدة لغات ومساعدتك بالصوت أو النص.',
      'fr': 'Bonjour! Je suis votre assistant IA. Je peux parler plusieurs langues et vous aider par voix ou texte.',
      'es': '¡Hola! Soy tu asistente de IA. Puedo hablar varios idiomas y ayudarte por voz o texto.',
      'de': 'Hallo! Ich bin Ihr KI-Assistent. Ich kann mehrere Sprachen sprechen und Ihnen per Sprache oder Text helfen.',
      'hi': 'नमस्ते! मैं आपका AI असिस्टेंट हूं। मैं कई भाषाएं बोल सकता हूं और आवाज या टेक्स्ट से आपकी मदद कर सकता हूं।'
    };
    return welcomeMessages[this.selectedLanguage] || welcomeMessages['en'];
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text: this.userInput,
      sender: 'user',
      timestamp: new Date(),
      language: this.selectedLanguage
    };

    this.messages.push(userMessage);
    const currentMessage = this.userInput;
    this.userInput = '';
    this.isTyping = true;
    this.errorMessage = '';

    // Send message to AI API
    this.aiService.sendMessage(currentMessage, this.selectedLanguage).subscribe({
      next: (response: any) => {
        this.handleAIResponse(response);
      },
      error: (error: any) => {
        this.handleError(error);
      }
    });
  }

  private handleAIResponse(response: any) {
    this.isTyping = false;
    
    if (response.success && response.message) {
      const aiMessage: Message = {
        id: Date.now(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        language: this.selectedLanguage
      };

      this.messages.push(aiMessage);
      this.scrollToBottom();
      
      // Speak the response if not muted and voice is supported
      if (!this.isMuted && this.voiceSupported) {
        this.aiService.speakText(response.message, this.selectedLanguage)
          .catch(error => console.log('Speech synthesis error:', error));
      }
    } else {
      this.handleError({ message: response.error || 'No response from AI' });
    }
  }

  private handleGeminiResponse(response: any) {
    this.isTyping = false;
    
    if (response.candidates && response.candidates.length > 0) {
      const aiResponseText = response.candidates[0].content.parts[0].text;
      
      // Add AI response to conversation history
      this.aiService.addAIResponseToHistory(aiResponseText);
      
      const aiMessage: Message = {
        id: Date.now(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        language: this.selectedLanguage
      };

      this.messages.push(aiMessage);
      this.scrollToBottom();
    } else {
      this.handleError({ message: 'No response from AI' });
    }
  }

  private handleError(error: any) {
    this.isTyping = false;
    this.isConnected = false;
    this.errorMessage = error.message || 'Failed to connect to AI. Please try again.';
    
    console.error('AI API Error:', error);
    
    // Add error message to chat
    const errorMessage: Message = {
      id: Date.now(),
      text: this.getErrorMessage(),
      sender: 'ai',
      timestamp: new Date(),
      language: this.selectedLanguage
    };
    
    this.messages.push(errorMessage);
    this.scrollToBottom();
  }

  private getErrorMessage(): string {
    const errorMessages: { [key: string]: string } = {
      'en': 'Sorry, I encountered an error. Please try again.',
      'ur': 'معذرت، مجھے ایک خرابی کا سامنا ہوا۔ براہ کرم دوبارہ کوشش کریں۔',
      'ar': 'آسف، واجهت خطأ. يرجى المحاولة مرة أخرى.',
      'fr': 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
      'es': 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.',
      'de': 'Entschuldigung, ich bin auf einen Fehler gestoßen. Bitte versuchen Sie es erneut.',
      'hi': 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।'
    };
    return errorMessages[this.selectedLanguage] || errorMessages['en'];
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  startVoiceRecording() {
    if (!this.voiceSupported) {
      this.errorMessage = 'Voice recognition is not supported in this browser.';
      return;
    }

    this.isListening = true;
    this.errorMessage = '';
    
    this.aiService.startVoiceRecognition(this.selectedLanguage)
      .then(transcript => {
        this.userInput = transcript;
        this.isListening = false;
        // Automatically send the message after voice recognition
        if (this.userInput.trim()) {
          this.sendMessage();
        }
      })
      .catch(error => {
        this.isListening = false;
        this.errorMessage = `Voice recognition error: ${error.message}`;
        console.error('Voice recognition error:', error);
      });
  }

  stopVoiceRecording() {
    this.isListening = false;
    this.aiService.stopVoiceRecognition();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  onLanguageChange() {
    // Set new system prompt for the selected language
    this.aiService.setSystemPrompt(this.selectedLanguage);
    
    // Add a system message about language change
    const langChangeMessages: { [key: string]: string } = {
      'en': `Language changed to ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`,
      'ur': `زبان تبدیل کر دی گئی ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`,
      'ar': `تم تغيير اللغة إلى ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`,
      'fr': `Langue changée en ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`,
      'es': `Idioma cambiado a ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`,
      'de': `Sprache geändert zu ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`,
      'hi': `भाषा बदली गई ${this.languages.find(l => l.code === this.selectedLanguage)?.name}`
    };
    
    const langChangeMsg: Message = {
      id: Date.now(),
      text: langChangeMessages[this.selectedLanguage] || langChangeMessages['en'],
      sender: 'ai',
      timestamp: new Date(),
      language: this.selectedLanguage
    };
    this.messages.push(langChangeMsg);
    this.scrollToBottom();
  }

  retryLastMessage() {
    this.errorMessage = '';
    this.isConnected = true;
    
    // Find the last user message and resend it
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sender === 'user') {
        const lastUserMessage = this.messages[i].text;
        this.userInput = lastUserMessage;
        this.sendMessage();
        break;
      }
    }
  }

  clearChat() {
    this.messages = [];
    this.aiService.clearConversation();
    this.aiService.setSystemPrompt(this.selectedLanguage);
    this.addWelcomeMessage();
    this.errorMessage = '';
    this.isConnected = true;
  }

  getLanguageName(code: string): string {
    return this.languages.find(l => l.code === code)?.name || 'Unknown';
  }

  getLanguageFlag(code: string): string {
    return this.languages.find(l => l.code === code)?.flag || '🌐';
  }
}
