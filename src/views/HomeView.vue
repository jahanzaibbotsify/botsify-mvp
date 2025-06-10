<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useChatStore } from '../stores/chatStore';

const router = useRouter();
const chatStore = useChatStore();

const startNewChat = () => {
  const newChat = chatStore.createNewChat();
  router.push(`/chat/${newChat.id}`);
};
</script>

<template>
  <div class="home-view scrollbar">
    <div class="home-header">
      <div class="header-content">
        <div class="header-text">
          <p class="header-subtitle">Welcome to Botsify Chat</p>
        </div>
      </div>
    </div>

    <div class="welcome-container">
      <div class="logo-container">
        <img src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Botsify Logo" class="logo" />
      </div>
      
      <div class="action-container">
        <button class="primary start-button" @click="startNewChat">
          Start a New Chat
        </button>
      </div>
      
      <div class="features-section">
        <h2>Features</h2>
        <div class="features">
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>Smart Chat Interface</h3>
            <p>Intuitive and modern conversational experience</p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
            </div>
            <h3>Real-time Updates</h3>
            <p>See when the AI is typing with live indicators</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  height: 100%;
  overflow-y: auto;
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
}

.home-header {
  position: sticky;
  top: 0;
  background-color: var(--color-bg-primary);
  padding: var(--space-2) 0;
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
}

.header-text {
  flex: 1;
}

.header-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.welcome-container {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.logo-container {
  margin-bottom: var(--space-6);
  text-align: center;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.action-container {
  margin-bottom: var(--space-7);
  text-align: center;
}

.start-button {
  font-size: 1rem;
  padding: var(--space-3) var(--space-5);
}

.features-section {
  text-align: center;
}

.features-section h2 {
  margin-bottom: var(--space-6);
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.feature:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
  color: var(--color-primary);
}

.feature h3 {
  font-size: 1rem;
  margin-bottom: var(--space-2);
}

.feature p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .home-view {
    padding: var(--space-3) var(--space-2);
  }

  .home-header {
    padding: var(--space-2) 0;
    margin-bottom: var(--space-4);
  }

  .header-content {
    height: 40px;
    padding: 0 var(--space-3);
  }

  .header-subtitle {
    font-size: 0.875rem;
  }

  .welcome-container {
    padding: var(--space-4) var(--space-2);
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .start-button {
    width: 100%;
    max-width: 300px;
  }

  .features {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .features-section h2 {
    margin-bottom: var(--space-4);
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .home-view {
    padding: var(--space-2);
  }
  
  .welcome-container {
    padding: var(--space-3) var(--space-1);
  }
  
  .logo {
    width: 80px;
    height: 80px;
  }
  
  .feature {
    padding: var(--space-3);
  }
}
</style>