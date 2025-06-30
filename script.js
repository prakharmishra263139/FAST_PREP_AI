// DOM Element References
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('userInput');
const chatLog = document.getElementById('chat-log');
const sendButton = document.getElementById('sendButton');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const darkModeToggle = document.getElementById('darkModeToggle');
const helpBtn = document.getElementById('helpBtn');
const clearChatBtn = document.getElementById('clearChat');
const exampleBtn = document.getElementById('exampleBtn');
const voiceBtn = document.getElementById('voiceBtn');
const topicSearch = document.getElementById('topicSearch');
const suggestions = document.querySelectorAll('.suggestion');

// --- YOUR API KEY IS INSERTED HERE ---
// WARNING: This is insecure and visible to anyone visiting your site.
const API_KEY = "AIzaSyAXZKmbmA_uFTWoXg_0Jwewx6H0wgmj1ek";

// The system instruction that defines the bot's personality and rules.
const systemInstructionText = `You are a data strucutre and algorithm instructor.You will only reply to the problem related to data strucutre and algorithm.You have to solve the query of user in simplest way  If user ask any questions which is not related to data structure and algorithm , reply him rudely
Example: "If user ask , How are you, 
You will reply : you dumb ask me some sensible questions
You have to reply him in a rude way if questions is not related to data structure and algorithm.
else reply him in a simple explanation.
`;

// Speech Recognition setup
let recognition;
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        voiceBtn.classList.add('listening');
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        userInput.focus();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        addMessage('bot', `**Error:** ${event.error}. Voice input failed.`);
    };
} catch (e) {
    console.warn('Speech recognition not supported', e);
    voiceBtn.style.display = 'none';
}

// Initialize dark mode from localStorage or prefer-color-scheme
function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'enabled' || (savedMode === null && prefersDark)) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Function to add copy buttons to code blocks
function addCopyButtons() {
    document.querySelectorAll('pre').forEach((pre) => {
        // Skip if already has a copy button
        if (pre.querySelector('.copy-btn')) return;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="far fa-copy"></i><span class="tooltip">Copy</span>';
        
        copyBtn.addEventListener('click', () => {
            const code = pre.querySelector('code')?.innerText || pre.innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="far fa-copy"></i><span class="tooltip">Copy</span>';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
        
        pre.appendChild(copyBtn);
    });
}

// Function to add a new message to the chat interface
function addMessage(sender, message, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (isLoading) {
        messageDiv.classList.add('loading');
    }
    
    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    if (sender === 'bot') {
        textDiv.innerHTML = marked.parse(message);
        // Add copy buttons after message is added
        setTimeout(addCopyButtons, 100);
    } else {
        textDiv.textContent = message;
    }
    
    messageDiv.appendChild(textDiv);
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
    return messageDiv;
}

// Clear the chat history
function clearChat() {
    chatLog.innerHTML = '';
    addMessage('bot', 'Hello. I am your DSA tutor. Ask me anything about Data Structures and Algorithms. Ask me anything else at your own risk.');
}

// Show example questions
function showExamples() {
    const examples = [
        "Explain Binary Search with time complexity",
        "What's the difference between BFS and DFS?",
        "How does QuickSort work? Show example",
        "Explain Dijkstra's algorithm with a diagram",
        "What are the applications of hash tables?"
    ];
    
    const exampleMessage = "Here are some example questions you can ask:\n\n" +
                          examples.map(ex => `• ${ex}`).join('\n') +
                          "\n\nClick any suggestion below or type your own question.";
    
    addMessage('bot', exampleMessage);
}

// Filter topics based on search input
function filterTopics() {
    const searchTerm = topicSearch.value.toLowerCase();
    const topicItems = document.querySelectorAll('.topic-item');
    
    topicItems.forEach(item => {
        const topicText = item.querySelector('.topic-btn').textContent.toLowerCase();
        const questions = item.querySelectorAll('.question-btn');
        let hasVisibleQuestions = false;
        
        questions.forEach(question => {
            const questionText = question.textContent.toLowerCase();
            if (questionText.includes(searchTerm)) {
                question.style.display = 'flex';
                hasVisibleQuestions = true;
            } else {
                question.style.display = 'none';
            }
        });
        
        // Show/hide the entire topic item based on matches
        if (topicText.includes(searchTerm) || hasVisibleQuestions) {
            item.style.display = 'block';
            // Expand if there are matching questions
            if (hasVisibleQuestions) {
                item.classList.add('active');
            }
        } else {
            item.style.display = 'none';
        }
    });
}

// Initialize the app
function init() {
    initDarkMode();
    
    // Event Listeners
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    darkModeToggle.addEventListener('click', toggleDarkMode);

    helpBtn.addEventListener('click', () => {
        addMessage('bot', "**Help Guide**\n\n" +
                         "1. Click on any topic in the sidebar to auto-fill a question\n" +
                         "2. Use the microphone button for voice input\n" +
                         "3. Click suggestions below the input box for quick questions\n" +
                         "4. Toggle dark mode using the moon/sun icon\n" +
                         "5. Clear chat history with the trash can button");
    });

    clearChatBtn.addEventListener('click', clearChat);

    exampleBtn.addEventListener('click', showExamples);

    voiceBtn.addEventListener('click', () => {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                addMessage('bot', "**Error:** Couldn't start voice recognition. Please try again.");
                console.error('Voice recognition error:', e);
            }
        } else {
            addMessage('bot', "**Warning:** Voice input is not supported in your browser.");
        }
    });

    topicSearch.addEventListener('input', filterTopics);

    // Add click handlers for topic dropdowns
    const topicItems = document.querySelectorAll('.topic-item');
    topicItems.forEach(item => {
        const header = item.querySelector('.topic-header');
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on the actual topic button
            if (e.target.classList.contains('topic-btn') || e.target.closest('.topic-btn')) {
                return;
            }
            item.classList.toggle('active');
        });

        // Also make the topic button toggle the dropdown
        const topicBtn = item.querySelector('.topic-btn');
        topicBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the header click from triggering
            item.classList.toggle('active');
        });
    });

    // Add click handlers for question buttons
    const questionButtons = document.querySelectorAll('.question-btn');
    questionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const question = button.getAttribute('data-topic');
            userInput.value = question;
            userInput.focus();
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Add click handlers for suggestions
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            userInput.value = suggestion.textContent;
            userInput.focus();
        });
    });

    // Chat form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userQuery = userInput.value.trim();
        if (!userQuery) return;

        addMessage('user', userQuery);
        const queryToSend = userInput.value;
        userInput.value = '';
        sendButton.disabled = true;
        userInput.disabled = true;
        
        const loadingMessage = addMessage('bot', 'Thinking...', true);
        
        const modelName = "gemini-1.5-flash-latest"; 
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [{ text: queryToSend }]
            }],
            system_instruction: {
                parts: [{ text: systemInstructionText }]
            }
        };
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error (${response.status}): ${errorData.error.message}`);
            }

            const data = await response.json();
            const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I encountered an issue and can't respond.";
            
            loadingMessage.classList.remove('loading');
            loadingMessage.querySelector('.text').innerHTML = marked.parse(botResponseText);
            addCopyButtons();

        } catch (error) {
            console.error("Fetch Error:", error);
            const errorMessage = `**Error:** ${error.message}. <br><br>Please check the browser's developer console for more details.`;
            loadingMessage.querySelector('.text').innerHTML = marked.parse(errorMessage);
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);