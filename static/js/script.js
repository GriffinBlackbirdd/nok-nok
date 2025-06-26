// Navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", function () {
  navLinks.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

// Close mobile menu when clicking a link
const navItems = document.querySelectorAll(".nav-links a");
navItems.forEach((item) => {
  item.addEventListener("click", function () {
    navLinks.classList.remove("active");
    menuToggle.classList.remove("active");
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// Self-executing function to initialize chatbot
(function() {
  // Flag to ensure initialization only happens once
  let chatbotInitialized = false;

  // Function to initialize chatbot
  function initChatbot() {
    // Prevent multiple initializations
    if (chatbotInitialized) {
      console.log("Chatbot already initialized, skipping");
      return;
    }

    console.log("Initializing chatbot...");

    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotSend = document.getElementById('chatbot-send');

    // Debug check
    console.log("Elements found:", {
      toggle: !!chatbotToggle,
      container: !!chatbotContainer,
      close: !!chatbotClose,
      messages: !!chatbotMessages,
      input: !!chatbotInput,
      send: !!chatbotSend
    });

    if (!chatbotToggle || !chatbotContainer) {
      console.error("Critical chatbot elements not found");
      return; // Exit if critical elements are missing
    }

    // Mark as initialized
    chatbotInitialized = true;

    // Generate a unique session ID for this chat
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    let userEmail = null;
    let userPhone = null;
    let waitingForEmail = false;
    let waitingForPhone = false;
    let previousMessage = "";

    // Add CSS for animations and styling fixes
    const style = document.createElement('style');
    style.textContent = `
      .dot-animation {
        display: inline-block;
        animation: dotAnimation 1.5s infinite;
      }
      @keyframes dotAnimation {
        0% { opacity: 0.2; }
        20% { opacity: 1; }
        100% { opacity: 0.2; }
      }
      .loading .message-content p {
        display: flex;
        align-items: center;
      }
      .dot-animation {
        display: inline-block;
        width: 20px;
        text-align: left;
      }
      .chatbot-container {
        display: block !important;
        visibility: visible !important;
        transform: scale(0);
        transform-origin: bottom right;
        transition: transform 0.3s ease;
        opacity: 1;
        height: 450px; /* Set a fixed height */
        display: flex !important;
        flex-direction: column !important;
      }
      .chatbot-container.active {
        transform: scale(1) !important;
      }
      .chatbot-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-height: 300px; /* Set a max height */
        height: 100%;
        scrollbar-width: thin;
      }

      /* Improved send button styles */
      .chatbot-input button {
        background-color: var(--primary);
        color: white;
        border: none;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        min-width: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        margin-left: 8px;
      }

      .chatbot-input button:hover {
        background-color: #e05e1c;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .chatbot-input button:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .chatbot-input button svg {
        fill: white;
        width: 18px;
        height: 18px;
        transform: rotate(15deg);
        transition: transform 0.2s ease;
      }

      .chatbot-input button:hover svg {
        transform: rotate(0deg) scale(1.1);
      }

      /* Improved input box */
      .chatbot-input {
        padding: 12px 15px;
        border-top: 1px solid #eaeaea;
        display: flex;
        align-items: center;
        background-color: white;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }

      .chatbot-input input {
        flex: 1;
        padding: 12px 15px;
        border: 1px solid #eaeaea;
        border-radius: 20px;
        outline: none;
        font-size: 0.95rem;
        background-color: #f8f8f8;
        transition: all 0.3s ease;
      }

      .chatbot-input input:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(225, 113, 42, 0.15);
        background-color: white;
      }
    `;
    document.head.appendChild(style);

    // Toggle chatbot visibility with multiple approaches
    chatbotToggle.addEventListener('click', function() {
      console.log("Toggle clicked");
      chatbotContainer.classList.toggle('active');

      // Use direct style manipulation as backup
      if (chatbotContainer.classList.contains('active')) {
        chatbotContainer.style.transform = 'scale(1)';
        if (chatbotInput) chatbotInput.focus();
        if (chatbotMessages) chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      } else {
        chatbotContainer.style.transform = 'scale(0)';
      }
    });

    // Close chatbot
    if (chatbotClose) {
      chatbotClose.addEventListener('click', function() {
        chatbotContainer.classList.remove('active');
        chatbotContainer.style.transform = 'scale(0)';
      });
    }

    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;

      // Only add avatar for bot messages
      if (!isUser) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chatbot-avatar';
        avatarDiv.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24">
            <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" fill="currentColor"/>
          </svg>
        `;
        messageDiv.appendChild(avatarDiv);
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      contentDiv.innerHTML = `<p>${content}</p>`;
      messageDiv.appendChild(contentDiv);

      if (chatbotMessages) {
        chatbotMessages.appendChild(messageDiv);
        // Scroll to the bottom of the messages
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }
    }

    // Display loading indicator
    function showLoading() {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'chatbot-message bot loading';
      loadingDiv.id = 'loading-message';

      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'chatbot-avatar';
      avatarDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24">
          <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" fill="currentColor"/>
        </svg>
      `;
      loadingDiv.appendChild(avatarDiv);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      contentDiv.innerHTML = `<p>Typing<span class="dot-animation">...</span></p>`;
      loadingDiv.appendChild(contentDiv);

      if (chatbotMessages) {
        chatbotMessages.appendChild(loadingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }
    }

    // Remove loading indicator
    function removeLoading() {
      const loadingMessage = document.getElementById('loading-message');
      if (loadingMessage) {
        loadingMessage.remove();
      }
    }

    // Handle sending a message to the backend
    async function sendMessage() {
      if (!chatbotInput) return;

      const message = chatbotInput.value.trim();
      if (!message) return;

      // Add user message to chat
      addMessage(message, true);
      chatbotInput.value = '';

      // If waiting for email, treat this input as email
      if (waitingForEmail) {
        userEmail = message;
        waitingForEmail = false;

        // Validate email format (basic validation)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userEmail)) {
          addMessage("That doesn't look like a valid email address. Please try again with a valid email.", false);
          userEmail = null;
          waitingForEmail = true;
          return;
        }

        addMessage(`Thank you for providing your email (${userEmail}). Now, could you please provide your phone number?`, false);
        waitingForPhone = true;
        return;
      }

      // If waiting for phone, treat this input as phone
      if (waitingForPhone) {
        userPhone = message;
        waitingForPhone = false;

        // Validate phone format (basic validation)
        const phonePattern = /^[0-9+\-\s()]{10,15}$/;
        if (!phonePattern.test(userPhone.replace(/\s+/g, ''))) {
          addMessage("That doesn't look like a valid phone number. Please enter a number with at least 10 digits.", false);
          userPhone = null;
          waitingForPhone = true;
          return;
        }

        addMessage(`Thank you for providing your phone number (${userPhone}). I'll continue processing your request.`, false);

        // Process the original message with both email and phone
        processMessageWithBackend(previousMessage, userEmail, userPhone);
        return;
      }

      // Store message in case we need to reprocess it with contact info
      previousMessage = message;

      // Process the message with the backend
      processMessageWithBackend(message, userEmail, userPhone);
    }

    // Function to communicate with the backend
    async function processMessageWithBackend(message, email = null, phone = null) {
      showLoading();

      try {
        console.log("Sending message to backend:", message);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            session_id: sessionId,
            email: email,
            phone: phone
          }),
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response from backend:", data);

        removeLoading();

        // Add the bot response to the chat
        addMessage(data.response, false);

        // Check if contact information is needed
        if (data.needsEmail && !userEmail) {
          waitingForEmail = true;
          addMessage("Please provide your email address so we can send you the information:", false);
        } else if (data.needsPhone && !userPhone) {
          waitingForPhone = true;
          addMessage("Please provide your phone number so our technician can contact you:", false);
        }
      } catch (error) {
        console.error('Error:', error);
        removeLoading();
        addMessage("I'm sorry, I'm having trouble connecting to our service right now. Please try again later or call us at 9904966966.", false);
      }
    }

    // Send message when clicking the send button
    if (chatbotSend) {
      chatbotSend.addEventListener('click', sendMessage);
    }

    // Send message when pressing Enter in the input field
    if (chatbotInput) {
      chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }

    // Clear any existing messages first
    if (chatbotMessages) {
      chatbotMessages.innerHTML = '';
    }

    // Add initial greeting
    addMessage("Hello! How can the Nok-Nok team help you today? I'm here to assist with plumbing, electrical, or home repair services.", false);
  }

  // Try different methods to initialize, but use flags to prevent multiple initializations

  // Method 1: Immediate if document is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("Document already interactive/complete, initializing immediately");
    initChatbot();
  } else {
    // Method 2: Wait for DOM
    console.log("Waiting for DOMContentLoaded");
    document.addEventListener('DOMContentLoaded', initChatbot);
  }

  // Method 3: Fallback with delay
  if (!chatbotInitialized) {
    console.log("Setting timeout fallback");
    setTimeout(initChatbot, 1000);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  // Function to handle responsive video background
// Function to handle responsive video background
function setupResponsiveVideo() {
  const video = document.querySelector('.hero video');

  if (!video) return; // Exit if no video element

  // Set essential video attributes for mobile compatibility
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('preload', 'metadata');
  video.muted = true; // Explicitly set muted
  video.playsInline = true; // iOS specific

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Force play the video with better error handling
  function attemptPlay() {
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video started playing successfully');
        })
        .catch(error => {
          console.log('Auto-play was prevented:', error);

          // Fallback: Show poster image
          const heroSection = document.querySelector('.hero');
          if (heroSection) {
            const posterUrl = video.getAttribute('poster');
            if (posterUrl) {
              heroSection.style.backgroundImage = `url("${posterUrl}")`;
              heroSection.style.backgroundSize = 'cover';
              heroSection.style.backgroundPosition = 'center center';
              heroSection.style.backgroundRepeat = 'no-repeat';
            }
          }
        });
    }
  }

  // Try to play immediately
  if (video.readyState >= 3) {
    attemptPlay();
  } else {
    video.addEventListener('loadeddata', attemptPlay, { once: true });
  }

  // iOS specific handling
  if (isIOS) {
    // For iOS, we need to be more aggressive about starting playback
    video.addEventListener('loadstart', () => {
      setTimeout(attemptPlay, 100);
    });
  }

  // Handle user interaction to start video (required by some browsers)
  function startVideoOnInteraction() {
    if (video.paused) {
      attemptPlay();
    }
    // Remove listeners after first interaction
    document.removeEventListener('touchstart', startVideoOnInteraction);
    document.removeEventListener('click', startVideoOnInteraction);
  }

  document.addEventListener('touchstart', startVideoOnInteraction, { passive: true });
  document.addEventListener('click', startVideoOnInteraction);
}

  // Run the setup on page load
  setupResponsiveVideo();

  // Also run on resize to handle orientation changes
  window.addEventListener('resize', setupResponsiveVideo);
});