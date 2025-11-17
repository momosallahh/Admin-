// ================================================
// AI CHATBOT WITH CHATGPT INTEGRATION
// ================================================

'use strict';

class RoofingChatbot {
    constructor() {
        // Configuration
        this.apiKey = window.ROOFING_CONFIG?.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';

        // Elements
        this.chatbot = document.getElementById('aiChatbot');
        this.chatbotToggle = document.getElementById('chatbotToggle');
        this.chatbotWindow = document.getElementById('chatbotWindow');
        this.chatbotClose = document.getElementById('chatbotClose');
        this.chatbotMessages = document.getElementById('chatbotMessages');
        this.chatbotInput = document.getElementById('chatbotInput');
        this.chatbotSend = document.getElementById('chatbotSend');
        this.quickActions = document.querySelectorAll('.quick-action');
        this.chatNotification = document.getElementById('chatNotification');

        // State
        this.conversationHistory = [];
        this.isOpen = false;
        this.isTyping = false;

        // System prompt for roofing context
        this.systemPrompt = `You are an AI assistant for Elite Roofing Michigan, a premium roofing company.

Your role:
- Help customers with roofing questions, pricing, and scheduling
- Be friendly, professional, and knowledgeable about roofing
- Qualify leads by asking about their roof type, size, damage level, and location
- Provide helpful information about our services
- Encourage booking free inspections

Services we offer:
- Roof Replacement ($5,000-$15,000 typical range)
- Roof Repair ($500-$3,000)
- Storm Damage Assessment & Repair
- Metal Roofing Installation
- Insurance Claims Assistance
- Commercial Roofing

Service areas: Detroit, Grand Rapids, Ann Arbor, Lansing, Flint, Kalamazoo, Troy, Livonia, Sterling Heights, Warren

Key points:
- We're GAF Master Elite Certified (top 3% of contractors)
- 25+ years experience
- 2,000+ satisfied customers
- 24/7 emergency service available
- Free inspections and estimates
- Lifetime craftsmanship warranty

When customers show interest, encourage them to:
1. Book a free inspection
2. Use our instant calculator
3. Call us at (555) 123-4567

Keep responses concise (2-3 sentences max) and ask follow-up questions to engage customers.`;

        this.init();
    }

    init() {
        // Event listeners
        this.chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        this.chatbotClose.addEventListener('click', () => this.closeChatbot());
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick actions
        this.quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.sendMessage(message);
            });
        });

        // Show notification after 5 seconds
        setTimeout(() => {
            if (!this.isOpen) {
                this.showNotification();
            }
        }, 5000);
    }

    toggleChatbot() {
        this.isOpen = !this.isOpen;
        this.chatbotWindow.classList.toggle('active');

        if (this.isOpen) {
            this.hideNotification();
            this.chatbotInput.focus();
        }
    }

    closeChatbot() {
        this.isOpen = false;
        this.chatbotWindow.classList.remove('active');
    }

    showNotification() {
        this.chatNotification.classList.remove('hidden');
    }

    hideNotification() {
        this.chatNotification.classList.add('hidden');
    }

    async sendMessage(customMessage = null) {
        const message = customMessage || this.chatbotInput.value.trim();

        if (!message) return;

        // Clear input
        this.chatbotInput.value = '';

        // Add user message to UI
        this.addMessage(message, 'user');

        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Show typing indicator
        this.showTypingIndicator();

        // Get AI response
        try {
            const response = await this.getChatGPTResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');

            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });

            // Check if lead capture is needed
            this.checkLeadCapture(response);

        } catch (error) {
            this.hideTypingIndicator();
            console.error('ChatGPT API Error:', error);

            // Fallback response
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'bot');
        }
    }

    async getChatGPTResponse(userMessage) {
        // Check if API key is set
        if (!this.apiKey || this.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            return this.getFallbackResponse(userMessage);
        }

        const messages = [
            { role: 'system', content: this.systemPrompt },
            ...this.conversationHistory
        ];

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    getFallbackResponse(userMessage) {
        // Rule-based fallback responses (works without API key)
        const messageLower = userMessage.toLowerCase();

        if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('how much')) {
            return "Great question! Roof replacement typically ranges from $5,000-$15,000 depending on size and materials. Our instant calculator can give you a precise estimate in 30 seconds. Want me to direct you there, or would you prefer a free in-person inspection?";
        }

        if (messageLower.includes('leak') || messageLower.includes('emergency')) {
            return "We offer 24/7 emergency service for roof leaks! This sounds urgent - I can connect you with our emergency team right away. Call (555) 123-4567 now or I can have someone call you back within 15 minutes. What's your phone number?";
        }

        if (messageLower.includes('inspection') || messageLower.includes('schedule') || messageLower.includes('appointment')) {
            return "I'd be happy to schedule a free roof inspection for you! We have availability this week. What city are you located in, and what day works best for you?";
        }

        if (messageLower.includes('insurance') || messageLower.includes('claim')) {
            return "We specialize in insurance claims! We'll handle the entire process - from documentation to approval. We work with all major insurance companies. Would you like to schedule a free damage assessment?";
        }

        if (messageLower.includes('metal roof') || messageLower.includes('metal roofing')) {
            return "Metal roofing is an excellent choice! It lasts 50+ years, is energy-efficient, and looks amazing. Typical cost is $12,000-$20,000 for a standard home. Want to see if it's right for your home? I can schedule a free consultation.";
        }

        if (messageLower.includes('warranty') || messageLower.includes('guarantee')) {
            return "We offer a lifetime craftsmanship warranty on all installations, plus manufacturer warranties up to 50 years! As a GAF Master Elite contractor (top 3%), we provide the best warranties in the industry. What specific coverage are you interested in?";
        }

        // Default response
        return "I'd love to help you with that! Elite Roofing has been serving Michigan for 25+ years with expert service. We offer free inspections and estimates. Would you like to schedule one, or do you have specific questions about roofing?";
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${this.formatMessage(text)}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.chatbotMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

        // Convert newlines to <br>
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatbotMessages.appendChild(typingDiv);
        this.scrollToBottom();
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const typingMsg = this.chatbotMessages.querySelector('.typing-message');
        if (typingMsg) {
            typingMsg.remove();
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    checkLeadCapture(response) {
        // If conversation suggests booking, show quick action
        const keywords = ['schedule', 'inspection', 'appointment', 'call', 'contact'];
        const hasKeyword = keywords.some(kw => response.toLowerCase().includes(kw));

        if (hasKeyword && this.conversationHistory.length > 2) {
            // Lead is qualified - could trigger email capture or booking flow
            console.log('Lead qualified - ready for capture');
            // You could add a lead capture form here
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new RoofingChatbot();
    window.roofingChatbot = chatbot; // Make globally accessible
});
