<script setup lang="ts">
import ModalLayout from "@/components/ui/ModalLayout.vue";
import {ref} from "vue";

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

const openModal = () => {
  modalRef.value?.openModal()
}

const bots = [
  {icon: 'website.png', label: 'Website'},
  {icon: 'whatsapp.png', label: 'WhatsApp'},
  {icon: 'instagram.png', label: 'Instagram'},
  {icon: 'messenger.png', label: 'Messenger'},
  {icon: 'telegram.png', label: 'Telegram'},
  {icon: 'sms.png', label: 'SMS'},
  {icon: 'portable-agent-icon.svg', label: 'Portable Agent'},
]

defineExpose({openModal});
</script>


<template>
  <ModalLayout
      ref="modalRef"
      title="Publish Bot"
      max-width="500px"
  >
    <div class="server-grid">

      <div
          class="server-card"
          v-for="bot in bots"
          :key="bot.icon"
      >
        <div class="server-icon">
          <img :src="`/bots/${bot.icon}`" width="28" height="28" alt="${bot.label} icon"/>
        </div>
        <div class="text-sm text-emphasis">
          <div>{{ bot.label }}</div>
        </div>
      </div>
    </div>
  </ModalLayout>
</template>

<style scoped>
.server-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.server-card {
  background: var(--color-bg-secondary);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 12px 12px 16px;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 80px;
  height: 100px;
  min-width: 0;
  box-sizing: border-box;
  position: relative;
}

.server-card.add-new-card {
  border: 1.5px dashed var(--color-primary);
  background: var(--color-bg-tertiary);
}

.server-card.connected {
  border-color: var(--color-success);
  background: rgba(34, 197, 94, 0.05);
}

.server-card.coming-soon {
  cursor: not-allowed;
  opacity: 0.7;
  filter: blur(0.5px);
}

.server-card.coming-soon:hover {
  transform: none;
  border-color: var(--color-border);
}

.server-card.add-new-card .add-icon {
  background: var(--color-bg-primary);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.server-card .server-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 6px;
}

.server-card .server-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.server-card .add-label,
.server-card .text-sm {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-primary);
  text-align: left;
  margin-top: 0;
  margin-left: 0;
  padding-left: 0;
}

.server-card .text-sm {
  color: var(--color-text-primary);
}
</style>