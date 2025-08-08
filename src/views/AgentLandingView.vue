<template>
  <div class="agent-landing">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Brand -->
        <div class="navbar-brand">
          <div class="brand-section">
            <router-link to="/" class="brand-link">
              <img 
                class="brand-logo" 
                src="/logo.png"
                alt="Botsify Logo"
              />
            </router-link>
            <a href="/chatbot-platform" class="chatbot-platform-link">
              Agentic Platform
            </a>
          </div>
          
          <!-- Responsive toggle -->
          <div class="navbar-toggle" @click="toggleMobileMenu">
            <span class="toggle-line"></span>
            <span class="toggle-line"></span>
            <span class="toggle-line"></span>
          </div>
        </div>

        <!-- Navbar menu -->
        <div class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
        
          <div class="navbar-end">
            <a href="/choose-plan" class="navbar-item">Pricing</a>
            <a href="/login" class="navbar-item">Login</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-main">
        <div class="container">
          <div class="hero-content">
            <div class="tag-section">
              <div class="tag-text">
                <i class="fa fa-magic"></i>
                Build Portable AI Agents, Not Just Bots
              </div>
            </div>

            <h1 class="hero-title">
              Build agents, use
              <span class="colorful-text">EVERYWHERE</span>.
            </h1>

            <h2 class="hero-subtitle">
              Prompt, run, and deploy portable AI agents in seconds
            </h2>

            <!-- Main Form -->
            <div class="form-wrapper">
              <form @submit.prevent="handleFormSubmit" class="chat-form">
                <div class="textarea-wrapper">
                  <textarea
                    ref="messageTextarea"
                    v-model="userMessage"
                    class="message-textarea"
                    :placeholder="currentPlaceholder"
                    rows="4"
                  ></textarea>
                  <button type="submit" class="send-button">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff">
                      <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <!-- Prompt Suggestions -->
            <div class="prompt-suggestions">
              <span 
                v-for="prompt in promptSuggestions" 
                :key="prompt"
                class="prompt-chip" 
                @click="selectPrompt(prompt)"
              >
                {{ prompt }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-links">
            <ul class="footer-list">
              <li><a href="https://vocallify.com">Vocallify</a></li>
              <li><a href="/team">Our Team</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions">Terms of Service</a></li>
            </ul>
          </div>
          <p class="footer-copyright">
            &copy; 2016-{{ currentYear }} | 
            <a href="/">Botsify</a> | 
            All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>

    <!-- Signup Modal -->
    <div v-if="showSignupModal" class="modal-overlay" @click="closeSignupModal">
      <div class="signup-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <h3 class="modal-title">Sign Up to Continue</h3>
            <p class="modal-subtitle">Create your free Botsify account</p>
          </div>
          <button class="modal-close" @click="closeSignupModal">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="signupSuccess" class="success-message">
            <div class="alert alert-success">
              <i class="fa fa-check-circle"></i>
              Signup successful! Redirecting you to book a demo...
            </div>
          </div>

          <form v-else @submit.prevent="handleSignupSubmit" class="signup-form">
            <div class="form-group">
              <div class="input-group">
                <span class="input-icon">
                  <i class="fa fa-user"></i>
                </span>
                <input
                  v-model="signupForm.name"
                  type="text"
                  class="form-input"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <div class="input-group">
                <span class="input-icon">
                  <i class="fa fa-envelope"></i>
                </span>
                <input
                  v-model="signupForm.email"
                  type="email"
                  class="form-input"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <div class="input-group">
                <span class="input-icon">
                  <i class="fa fa-lock"></i>
                </span>
                <input
                  v-model="signupForm.password"
                  type="password"
                  class="form-input"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <div class="input-group">
                <span class="input-icon">
                  <i class="fa fa-phone"></i>
                </span>
                <input
                  v-model="signupForm.phone"
                  type="tel"
                  class="form-input"
                  placeholder="e.g. +1234567890"
                  required
                />
              </div>
            </div>

            <div v-if="signupError" class="error-message">
              {{ signupError }}
            </div>

            <button type="submit" class="signup-button" :disabled="isSubmitting">
              {{ isSubmitting ? 'Signing Up...' : 'Sign Up' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Reactive state
const showMobileMenu = ref(false)
const showSignupModal = ref(false)
const userMessage = ref('')
const currentPlaceholder = ref('For example: \'Build a AI agent for my website that can answer questions about pricing.\'')
const signupSuccess = ref(false)
const signupError = ref('')
const isSubmitting = ref(false)

// Signup form data
const signupForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  userMessage: ''
})

// Static data
const promptSuggestions = [
  "Create an Agent for hotel management",
  "Fetch data from my API", 
  "Collection user email and name at start",
  "Add Carousel for products",
  "Add welcome message with Quick Replies",
  "Update agent logo"
]

const typingPrompts = [
  'collect lead information, and send it to Hubspot',
  'answer customer questions from my website and uploaded PDF',
  'show products from my Shopify store and generate Stripe link to send to users for checkout',
  'acts as a product manager and create Weekly Sprint plan using data from Monday.com',
  'get lead information from my Google Spreadsheet and send them email'
]

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Typing animation state
let promptIndex = 0
let charIndex = 0
let isDeleting = false
let typingInterval: number | null = null

// Methods
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleFormSubmit = () => {
  // Check if user is already registered
  if (localStorage.getItem('botsify_user_registered')) {
    window.open('https://botsify.com/book-demo', '_blank')
    return
  }

  const message = userMessage.value.trim()
  if (message) {
    signupForm.value.userMessage = message
    resetSignupForm()
    showSignupModal.value = true
  }
}

const selectPrompt = (prompt: string) => {
  userMessage.value = prompt
}

const closeSignupModal = () => {
  showSignupModal.value = false
  resetSignupForm()
}

const resetSignupForm = () => {
  signupError.value = ''
  signupSuccess.value = false
  if (!showSignupModal.value) {
    signupForm.value = {
      name: '',
      email: '',
      password: '',
      phone: '',
      userMessage: signupForm.value.userMessage
    }
  }
}

const handleSignupSubmit = async () => {
  signupError.value = ''
  
  const { name, email, password, phone } = signupForm.value
  
  if (!name || !email || !password || !phone) {
    signupError.value = 'All fields are required.'
    return
  }

  isSubmitting.value = true
  
  try {
    // Simulate API call - replace with actual signup logic
    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('phone_number', phone)
    formData.append('user_message', signupForm.value.userMessage)

    // For demo purposes, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    localStorage.setItem('botsify_user_registered', 'true')
    signupSuccess.value = true
    
    setTimeout(() => {
      window.open('https://botsify.com/book-demo', '_blank')
      closeSignupModal()
    }, 2000)
    
  } catch (error) {
    signupError.value = 'There was an error submitting the form. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const startTypingAnimation = () => {
  const typePrompt = () => {
    const currentPrompt = typingPrompts[promptIndex]
    const visibleText = currentPrompt.substring(0, charIndex)
    
    currentPlaceholder.value = `Create agent to ${visibleText}|`
    
    if (!isDeleting && charIndex < currentPrompt.length) {
      charIndex++
      typingInterval = window.setTimeout(typePrompt, 40)
    } else if (isDeleting && charIndex > 0) {
      charIndex--
      typingInterval = window.setTimeout(typePrompt, 20)
    } else {
      isDeleting = !isDeleting
      if (!isDeleting) {
        promptIndex = (promptIndex + 1) % typingPrompts.length
      }
      typingInterval = window.setTimeout(typePrompt, 800)
    }
  }
  
  typePrompt()
}

const stopTypingAnimation = () => {
  if (typingInterval) {
    clearTimeout(typingInterval)
    typingInterval = null
  }
}

// Lifecycle
onMounted(() => {
  startTypingAnimation()
})

onUnmounted(() => {
  stopTypingAnimation()
})
</script>

<style scoped>
/* Import external fonts and styles */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&family=Yrsa:ital,wght@0,300..700;1,300..700&display=swap');

.agent-landing {
  /* min-height: 100vh; */
  /* position: relative; */
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  color: white;
}

/* Background Effects */
.agent-landing::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 180deg,
    #ff0080,
    #7928ca,
    #2afadf,
    #7928ca,
    #ff0080
  );
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.agent-landing::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}

/* Navbar */
.navbar {
    position: relative;
    z-index: 10;
    padding: 10px 0px 20px 0px;
    background: transparent;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.brand-link {
  display: flex;
  align-items: center;
}

.chatbot-platform-link {
  color: white;
  text-decoration: none;
  font-weight: 300;
  font-size: 1rem;
  transition: var(--transition-normal);
  border-bottom: 1px solid transparent;
}

.chatbot-platform-link:hover {
  border-bottom-color: white;
  color: white;
}

.brand-logo {
  height: 40px;
  width: auto;
  background: transparent;
  object-fit: contain;
}

.navbar-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.toggle-line {
  width: 25px;
  height: 3px;
  background-color: white;
  transition: var(--transition-normal);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.navbar-start,
.navbar-end {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.navbar-item {
  color: white;
  text-decoration: none;
  font-weight: 300;
  transition: var(--transition-normal);
  border-bottom: 1px solid transparent;
}

.navbar-item:hover {
  border-bottom-color: white;
  color: white;
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-main {
  position: relative;
  width: 100%;
  min-height: 80vh;
  padding: 2rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}


.tag-text {
    display: inline-block;
    padding: 8px 20px;
    border-radius: 50px;
    background-color: #f0f0f0 !important;
    color: #333;
    font-weight: 500;
    font-size: 0.8rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(45deg, #feda75, /* Yellow */ #d21efa, /* Orange */ #d62976, /* Pink */ #962fbf, /* Purple */ #4f5bd5 /* Blue */);
    background-size: 300% 300%;
    animation: gradientShift 6s ease infinite;
}

.tag-text i {
  margin-right: var(--space-2);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-title {
  font-size: 3.8rem;
  line-height: 1.2;
  color: #384348;
  font-family: 'Yrsa', serif;
  margin-bottom: var(--space-3);
}

.colorful-text {
  font-style: italic;
  text-shadow: -4px -5px 1px #D782CF, 4px 5px 1px #9DECEC;
}

.hero-subtitle {
    font-family: 'Lexend', sans-serif;
    color: #2e66f4;
    font-size: 1.15rem;
    margin-bottom: var(--space-6);
    font-weight: 300;
}

/* Form */
.form-wrapper {
    max-width: 982px;
    margin: 0 auto;
}

.chat-form {
  position: relative;
}

.textarea-wrapper {
  position: relative;
  border-radius: 16px;
}

.message-textarea {
    border-radius: 16px;
            background: #EFEFEF;
            outline: none;
            box-shadow: 0 0 5px #AA91E1, 0 0 10px #A4A4E4, 0 0 10px #D592D9, 0 0 20px #9783E4, 0 0 40px #9783E5 !important;
            transition: box-shadow 0.3s ease;
            color: #333;
            resize: none;
            min-height: 140px;
            border: 1px solid #DBDBDB;
            padding: 20px;
            padding-right: 80px;
            width: 100%;
}

.message-textarea::placeholder {
  color: #333;
  opacity: 1;
}

.message-textarea:focus {
  border-color: #2e66f4;
  box-shadow: 0 0 1px 1px #2e66f4;
}

.send-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-normal);
}

.send-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
}

/* Prompt Suggestions */
.prompt-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 25px;
}

.prompt-chip {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 6px 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #e0ccf2c4;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: inset 2px 2px 5px rgb(200 130 215), inset -2px -2px 5px rgba(255, 255, 255, 0.1);
}

.prompt-chip:hover {
  box-shadow: none;
  transform: translateY(-2px);
}

/* Footer */
.landing-footer {
  position: relative;
  z-index: 2;
  background: transparent;
  padding: var(--space-5) 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.footer-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list a {
    color: white;
    font-size: 14px;
    font-weight: 300;
    text-decoration: none;
    transition: var(--transition-normal);
}

.footer-list a:hover {
  opacity: 0.8;
}

.footer-copyright {
  color: white;
  margin: 0;
}

.footer-copyright a {
  color: white;
  text-decoration: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.signup-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-title-section {
  text-align: center;
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2e66f4;
  margin: 0 0 var(--space-1) 0;
}

.modal-subtitle {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: var(--space-2);
}

.modal-body {
  padding: var(--space-4);
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-group {
  position: relative;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
  background: #fafdff;
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-3);
  background: white;
  border-right: 1px solid #ddd;
  color: #2e66f4;
}

.form-input {
  flex: 1;
  border: none;
  padding: var(--space-3);
  font-size: 1rem;
  background: transparent;
  outline: none;
}

.form-input:focus {
  border-color: #2e66f4;
  box-shadow: 0 0 1px 1px #2e66f4;
}

.signup-button {
  background: linear-gradient(45deg, #2e66f4, #4facfe);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-normal);
  letter-spacing: 0.5px;
}

.signup-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  margin-bottom: var(--space-4);
}

.alert {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert i {
  margin-right: var(--space-2);
}

.error-message {
  color: var(--color-error);
  text-align: center;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar-toggle {
    display: flex;
  }

  .brand-section {
    gap: var(--space-2);
  }

  .chatbot-platform-link {
    font-size: 0.875rem;
  }

  .navbar-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.9);
    flex-direction: column;
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .navbar-menu.is-active {
    display: flex;
  }

  .navbar-start,
  .navbar-end {
    flex-direction: column;
    width: 100%;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .prompt-suggestions {
    justify-content: center;
  }

  .prompt-chip {
    font-size: 0.9rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-list {
    justify-content: center;
  }

  .modal-overlay {
    padding: var(--space-2);
  }

  .signup-modal {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .brand-section {
    gap: var(--space-1);
  }

  .brand-logo {
    height: 32px;
  }

  .chatbot-platform-link {
    font-size: 0.75rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .prompt-chip {
    font-size: 0.8rem;
    padding: 4px 8px;
  }

  .message-textarea {
    min-height: 120px;
    padding: var(--space-3);
    padding-right: 60px;
  }

  .send-button {
    width: 36px;
    height: 36px;
    bottom: 15px;
    right: 15px;
  }
}
</style> 