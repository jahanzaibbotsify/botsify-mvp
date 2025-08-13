<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui";
import { useBotStore } from "@/stores/botStore"; // No longer needed

// Reactive data
const testing = ref(false);
const botStore = useBotStore();

// Methods
const handleTestBot = async () => {
  testing.value = true;
  
  try {
    // Open WhatsApp with test message
    const whatsappUrl = `https://web.whatsapp.com/send?phone=923313014733&text=Start%20Bot%${botStore.botId}`;
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Error opening WhatsApp test:', error);
  } finally {
    testing.value = false;
  }
};
</script>

<template>
  <div class="tab-panel">
    <div class="test-bot-content">
      <h2 class="text-center">Bot WhatsApp Demo</h2>
      <br>
      <div class="test-instructions">
        <ul class="test-list">
          <li>Before applying for WhatsApp business account, you can test out your bot on WhatsApp</li>
          <li>To do that, you can message <strong>Hi</strong> to our official WhatsApp number <strong>+923313014733</strong>.</li>
          <li>Upon messaging <strong>Hi</strong>, you will be asked to enter the ID of your Bot i.e: <strong>{{ botStore.botId }}</strong>. After entering the bot id your test mode will start.</li>
          <li>You can now test out your bot, In case you want to exit testing mode. You can do that by typing <strong>Exit Test</strong></li>
        </ul>
        <div class="test-button-container">
          <Button 
            variant="primary"
            size="large"
            icon="pi pi-whatsapp"
            :loading="testing"
            :disabled="testing"
            @click="handleTestBot"
          >
            {{ testing ? 'Opening WhatsApp...' : 'Test now on WhatsApp' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  padding: 0;
}

.test-bot-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.test-bot-content h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.test-instructions {
  text-align: left;
  margin-left: 20px;
}

.test-list {
  list-style-type: circle;
  margin: 0 0 24px 0;
  padding-left: 20px;
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
  line-height: 1.6;
}

.test-list li {
  margin-bottom: 12px;
}

.test-list strong {
  color: var(--color-text-primary, #111827);
  font-weight: 600;
}

.test-button-container {
  text-align: center;
  margin-top: 24px;
}

.test-button-container .ui-button {
  background-color: #25D366;
  border-color: #25D366;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  font-size: 16px;
}

.test-button-container .ui-button:hover {
  background-color: #128C7E;
  border-color: #128C7E;
}

.test-button-container .ui-button:focus {
  box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.3);
}

.test-button-container .ui-button:disabled {
  background-color: #9CA3AF;
  border-color: #9CA3AF;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .test-bot-content {
    padding: 16px;
  }
  
  .test-instructions {
    margin-left: 10px;
  }
  
  .test-list {
    padding-left: 16px;
  }
}
</style>
