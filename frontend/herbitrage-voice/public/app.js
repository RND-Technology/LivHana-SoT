// Configuration
const VOICE_SERVICE_URL = 'https://voice-service-plad5efvha-uc.a.run.app';
const REASONING_GATEWAY_URL = 'https://reasoning-gateway-plad5efvha-uc.a.run.app';
const CREDENTIALS = {
    email: 'jesseniesen@gmail.com',
    password: 'TXTOLivHanaHerbitrage'
};

// State
let isListening = false;
let isProcessing = false;
let recognition = null;
let currentAudio = null;
let sessionId = `session-${Date.now()}`;

// DOM Elements
const landingPage = document.getElementById('landingPage');
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const cockpitScreen = document.getElementById('cockpitScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const talkBtn = document.getElementById('talkBtn');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const transcript = document.getElementById('transcript');
const conversationHistory = document.getElementById('conversationHistory');

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Speech recognition started');
            updateStatus('listening', 'Listening...');
            talkBtn.classList.add('listening');
        };

        recognition.onresult = (event) => {
            const results = Array.from(event.results);
            const transcriptText = results
                .map(result => result[0].transcript)
                .join('');

            transcript.textContent = transcriptText;

            // If final result, process it
            if (event.results[event.results.length - 1].isFinal) {
                processVoiceInput(transcriptText);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            updateStatus('error', `Error: ${event.error}`);
            isListening = false;
            talkBtn.classList.remove('listening');
            setTimeout(() => {
                updateStatus('idle', 'Ready to assist');
            }, 3000);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            isListening = false;
            talkBtn.classList.remove('listening');
            if (!isProcessing) {
                updateStatus('idle', 'Ready to assist');
            }
        };

        // Enable talk button once recognition is ready
        talkBtn.disabled = false;
    } else {
        console.error('Speech recognition not supported');
        updateStatus('error', 'Speech recognition not supported in this browser');
        statusText.textContent = 'Speech recognition not supported. Please use Chrome or Edge.';
    }
}

// Modal Controls
loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    loginModal.classList.remove('active');
    loginError.textContent = '';
});

// Close modal when clicking outside
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
        loginError.textContent = '';
    }
});

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
        // Store session
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('userEmail', email);

        // Close modal and show cockpit
        loginModal.classList.remove('active');
        showCockpit(email);
    } else {
        loginError.textContent = 'Invalid credentials. Please try again.';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    showLanding();
});

// Talk Button Handler
talkBtn.addEventListener('click', () => {
    if (isListening || isProcessing) {
        // Stop listening
        if (recognition && isListening) {
            recognition.stop();
        }
        return;
    }

    // Start listening
    if (recognition) {
        transcript.textContent = '';
        isListening = true;
        recognition.start();
    }
});

// Process Voice Input
async function processVoiceInput(text) {
    if (!text || !text.trim()) {
        return;
    }

    isProcessing = true;
    updateStatus('processing', 'Thinking...');
    talkBtn.classList.remove('listening');
    talkBtn.classList.add('processing');

    // Add user message to conversation
    addMessage('user', text);

    try {
        // Call reasoning-gateway directly (simplified - no queue needed)
        const reasoningResponse = await fetch(`${REASONING_GATEWAY_URL}/api/v1/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: text,
                task_type: 'conversation',
                max_budget: 0.01
            })
        });

        if (!reasoningResponse.ok) {
            const errorText = await reasoningResponse.text();
            throw new Error(`Reasoning failed: ${errorText}`);
        }

        const { result } = await reasoningResponse.json();
        console.log('Got reasoning response:', result);
        const response = result;

        if (response) {
            // Add assistant message to conversation
            addMessage('assistant', response);

            // Convert to speech
            await speakText(response);
        }

    } catch (error) {
        console.error('Error processing voice input:', error);
        updateStatus('error', 'Sorry, something went wrong');
        addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.');

        setTimeout(() => {
            updateStatus('idle', 'Ready to assist');
        }, 3000);
    } finally {
        isProcessing = false;
        talkBtn.classList.remove('processing');
    }
}

// Convert text to speech
async function speakText(text) {
    updateStatus('speaking', 'Speaking...');

    try {
        const response = await fetch(`${VOICE_SERVICE_URL}/api/elevenlabs/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                voiceId: '21m00Tcm4TlvDq8ikWAM', // Default ElevenLabs voice
                modelId: 'eleven_monolingual_v1'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to synthesize speech');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        currentAudio = new Audio(audioUrl);

        currentAudio.onended = () => {
            updateStatus('idle', 'Ready to assist');
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
        };

        currentAudio.onerror = (error) => {
            console.error('Audio playback error:', error);
            updateStatus('idle', 'Ready to assist');
        };

        await currentAudio.play();

    } catch (error) {
        console.error('Error speaking text:', error);
        updateStatus('idle', 'Ready to assist');
    }
}

// Update status indicator
function updateStatus(state, text) {
    statusIcon.className = `status-icon ${state}`;
    statusText.textContent = text;
}

// Add message to conversation
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'Liv';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);

    conversationHistory.appendChild(messageDiv);

    // Scroll to bottom
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Show cockpit screen
function showCockpit(email) {
    userEmail.textContent = email;
    landingPage.classList.remove('active');
    cockpitScreen.classList.add('active');

    // Hide navigation bar when in cockpit
    document.querySelector('.nav-bar').style.display = 'none';

    // Initialize speech recognition
    initSpeechRecognition();
}

// Show landing page
function showLanding() {
    cockpitScreen.classList.remove('active');
    landingPage.classList.add('active');
    loginForm.reset();
    loginError.textContent = '';

    // Show navigation bar when on landing page
    document.querySelector('.nav-bar').style.display = 'block';

    // Reset state
    if (recognition) {
        recognition.stop();
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    isListening = false;
    isProcessing = false;
    conversationHistory.innerHTML = '';
    transcript.textContent = '';
}

// Check for existing session on load
window.addEventListener('DOMContentLoaded', () => {
    const authenticated = sessionStorage.getItem('authenticated');
    const email = sessionStorage.getItem('userEmail');

    if (authenticated === 'true' && email) {
        showCockpit(email);
    } else {
        showLanding();
    }
});

// Handle contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}
