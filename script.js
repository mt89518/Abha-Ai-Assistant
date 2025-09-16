class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.stopButton = document.getElementById('stopButton');
        this.chatContainer = document.querySelector('.chat-container');
        this.abortController = null;
        
        this.init();
    }
    
    init() {
        this.showWelcomeScreen();
        this.chatForm.addEventListener('submit', this.handleSubmit.bind(this));
        this.messageInput.addEventListener('input', this.handleInput.bind(this));
        this.messageInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.stopButton.addEventListener('click', this.handleStop.bind(this));
        this.messageInput.focus();
    }
    
    showWelcomeScreen() {
        this.chatMessages.innerHTML = `
            <div class="welcome-screen">
                <h2>How can I help you today?</h2>
                <div class="example-prompts">
                    <div class="example-prompt" onclick="document.getElementById('messageInput').value='What is the current weather in Mumbai?'; document.getElementById('messageInput').focus();">
                        <h3>Get weather updates</h3>
                        <p>What is the current weather in Mumbai?</p>
                    </div>
                    <div class="example-prompt" onclick="document.getElementById('messageInput').value='Latest news in artificial intelligence'; document.getElementById('messageInput').focus();">
                        <h3>Latest news</h3>
                        <p>Latest news in artificial intelligence</p>
                    </div>
                    <div class="example-prompt" onclick="document.getElementById('messageInput').value='Explain quantum computing in simple terms'; document.getElementById('messageInput').focus();">
                        <h3>Learn something new</h3>
                        <p>Explain quantum computing in simple terms</p>
                    </div>
                    <div class="example-prompt" onclick="document.getElementById('messageInput').value='Help me write a professional email'; document.getElementById('messageInput').focus();">
                        <h3>Writing assistance</h3>
                        <p>Help me write a professional email</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    newChat() {
        this.chatMessages.innerHTML = '';
        this.showWelcomeScreen();
        this.messageInput.value = '';
        this.messageInput.focus();
    }
    
    handleInput() {
        this.autoResize();
        this.updateSendButton();
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSubmit(e);
        }
    }
    
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 200) + 'px';
    }
    
    updateSendButton() {
        const hasContent = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasContent;
    }
    
    handleStop() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        
        this.setLoading(false);
        this.addMessage('Request stopped by user.', 'bot');
        this.messageInput.focus();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Remove welcome screen if it exists
        const welcomeScreen = this.chatMessages.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input and disable form
        this.messageInput.value = '';
        this.autoResize();
        this.setLoading(true, 'AI is thinking...');
        
        try {
            // Create AbortController for this request
            this.abortController = new AbortController();
            
            // Simulate different loading states
            const statusTimeout1 = setTimeout(() => {
                if (message.toLowerCase().includes('weather') || 
                    message.toLowerCase().includes('news') || 
                    message.toLowerCase().includes('current') ||
                    message.toLowerCase().includes('latest')) {
                    this.updateLoadingStatus('🔍 Searching the web...');
                }
            }, 1000);
            
            const statusTimeout2 = setTimeout(() => {
                if (message.toLowerCase().includes('weather') || 
                    message.toLowerCase().includes('news') || 
                    message.toLowerCase().includes('current') ||
                    message.toLowerCase().includes('latest')) {
                    this.updateLoadingStatus('🧠 Processing search results...');
                }
            }, 3000);
            
            // Send message to backend with abort signal
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                signal: this.abortController.signal
            });
            
            // Clear timeouts if request completes
            clearTimeout(statusTimeout1);
            clearTimeout(statusTimeout2);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Add bot response to chat
            this.addMessage(data.response, 'bot');
            
        } catch (error) {
            if (error.name === 'AbortError') {
                // Request was aborted, don't show error message
                return;
            }
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'bot', true);
        } finally {
            this.abortController = null;
            this.setLoading(false);
            this.messageInput.focus();
        }
    }
    
    addMessage(content, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'user') {
            avatar.textContent = '👤';
        } else {
            avatar.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142.0852-4.7735 2.7818a.7759.7759 0 0 0-.3927.6813v6.7369l-2.0201-1.1686a.071.071 0 0 1-.038-.052V10.91a4.5056 4.5056 0 0 1 7.4113-3.4928zm-1.6964 2.6158-.9601-.5577v-1.1319a.0757.0757 0 0 1 .071 0l.9601.5577v1.1319z"/>
                </svg>
            `;
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isError) {
            messageContent.style.color = '#ff6b6b';
        }
        
        // Handle line breaks and format text
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;
        
        messageWrapper.appendChild(avatar);
        messageWrapper.appendChild(messageContent);
        messageDiv.appendChild(messageWrapper);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(text) {
        // Convert line breaks to paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        
        if (paragraphs.length <= 1) {
            // Single paragraph, just handle line breaks
            let formatted = text.replace(/\n/g, '<br>');
            formatted = this.applyTextFormatting(formatted);
            return `<p>${formatted}</p>`;
        } else {
            // Multiple paragraphs
            return paragraphs.map(p => {
                const formatted = this.applyTextFormatting(p.replace(/\n/g, '<br>'));
                return `<p>${formatted}</p>`;
            }).join('');
        }
    }
    
    applyTextFormatting(text) {
        // Convert URLs to clickable links
        let formatted = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert **bold** text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* text (but not URLs)
        formatted = formatted.replace(/(?<!\w)\*([^*\s][^*]*[^*\s])\*(?!\w)/g, '<em>$1</em>');
        
        // Convert `code` text
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        return formatted;
    }
    
    setLoading(isLoading, status = 'AI is thinking...') {
        const loadingText = document.getElementById('loadingText');
        
        if (isLoading) {
            this.loadingIndicator.style.display = 'block';
            loadingText.textContent = status;
            this.sendButton.disabled = true;
            this.messageInput.disabled = true;
        } else {
            this.loadingIndicator.style.display = 'none';
            this.updateSendButton();
            this.messageInput.disabled = false;
        }
        this.scrollToBottom();
    }
    
    updateLoadingStatus(status) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = status;
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }
}

// Initialize the chat app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

// Add CSS for message formatting
const style = document.createElement('style');
style.textContent = `
    .message-content a {
        color: #10a37f;
        text-decoration: underline;
    }
    
    .message-content a:hover {
        color: #0d8f6f;
    }
    
    .message-content strong {
        font-weight: 600;
    }
    
    .message-content em {
        font-style: italic;
    }
    
    .message-content code {
        background: #2d2d2d;
        color: #f8f8f2;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
    }
`;
document.head.appendChild(style);
