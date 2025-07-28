import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PromptVersion, GlobalPromptTemplate, Story } from '@/types';

export const usePromptTemplatesStore = defineStore('promptTemplates', () => {
  // State
  const globalPromptTemplates = ref<GlobalPromptTemplate[]>([]);
  const storyVersions = ref<Map<string, PromptVersion[]>>(new Map());

  // Getters
  const getGlobalTemplates = computed(() => globalPromptTemplates.value);

  const getDefaultTemplate = computed(() => {
    return globalPromptTemplates.value.find(template => template.isDefault) || null;
  });

  const getTemplateById = computed(() => {
    return (templateId: string): GlobalPromptTemplate | undefined => {
      return globalPromptTemplates.value.find(template => template.id === templateId);
    };
  });

  const getVersionsForChat = computed(() => {
    return (chatId: string): PromptVersion[] => {
      return storyVersions.value.get(chatId) || [];
    };
  });

  const getActiveVersionForChat = computed(() => {
    return (chatId: string): PromptVersion | null => {
      const versions = storyVersions.value.get(chatId);
      return versions?.find(v => v.isActive) || null;
    };
  });

  // Actions
  function createPromptVersion(content: string, isActive: boolean = true): PromptVersion {
    return {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      updatedAt: new Date(),
      version: Date.now(),
      isActive
    };
  }

  function addVersionToChat(chatId: string, content: string, createNewVersion: boolean = true): void {
    if (!storyVersions.value.has(chatId)) {
      storyVersions.value.set(chatId, []);
    }

    const versions = storyVersions.value.get(chatId)!;
    
    if (createNewVersion) {
      // Deactivate all existing versions
      versions.forEach(version => {
        version.isActive = false;
      });
      
      // Add new version
      versions.push(createPromptVersion(content, true));
    } else {
      // Update the active version
      const activeVersion = versions.find(v => v.isActive);
      if (activeVersion) {
        activeVersion.content = content;
        activeVersion.updatedAt = new Date();
      } else {
        versions.push(createPromptVersion(content, true));
      }
    }
  }

  function revertToPromptVersion(chatId: string, versionId: string): boolean {
    const versions = storyVersions.value.get(chatId);
    if (!versions) return false;

    const targetVersion = versions.find(v => v.id === versionId);
    if (!targetVersion) return false;

    // Deactivate all versions
    versions.forEach(version => {
      version.isActive = false;
    });

    // Activate target version
    targetVersion.isActive = true;
    targetVersion.updatedAt = new Date();

    return true;
  }

  function deletePromptVersion(chatId: string, versionId: string): boolean {
    const versions = storyVersions.value.get(chatId);
    if (!versions) return false;

    const versionIndex = versions.findIndex(v => v.id === versionId);
    if (versionIndex === -1) return false;

    const deletedVersion = versions[versionIndex];
    
    // If deleting active version, activate the most recent version
    if (deletedVersion.isActive && versions.length > 1) {
      const remainingVersions = versions.filter(v => v.id !== versionId);
      const mostRecent = remainingVersions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      if (mostRecent) {
        mostRecent.isActive = true;
      }
    }

    versions.splice(versionIndex, 1);
    return true;
  }

  function clearVersionHistory(chatId: string): void {
    storyVersions.value.delete(chatId);
  }

  function createGlobalPromptTemplate(name: string, content: string, isDefault: boolean = false): GlobalPromptTemplate {
    const template: GlobalPromptTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      content,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If this is a default template, remove default from others
    if (isDefault) {
      globalPromptTemplates.value.forEach(t => {
        t.isDefault = false;
      });
    }

    globalPromptTemplates.value.push(template);
    return template;
  }

  function updateGlobalPromptTemplate(templateId: string, updates: Partial<GlobalPromptTemplate>): boolean {
    const template = globalPromptTemplates.value.find(t => t.id === templateId);
    if (template) {
      Object.assign(template, updates, { updatedAt: new Date() });
      
      // If setting as default, remove default from others
      if (updates.isDefault) {
        globalPromptTemplates.value.forEach(t => {
          if (t.id !== templateId) {
            t.isDefault = false;
          }
        });
      }
      
      return true;
    }
    return false;
  }

  function deleteGlobalPromptTemplate(templateId: string): boolean {
    const templateIndex = globalPromptTemplates.value.findIndex(t => t.id === templateId);
    if (templateIndex !== -1) {
      globalPromptTemplates.value.splice(templateIndex, 1);
      return true;
    }
    return false;
  }

  function loadTemplatesFromStorage(storedTemplates: any[]): void {
    globalPromptTemplates.value = storedTemplates.map((template: any) => ({
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt)
    }));
  }

  function saveTemplatesToStorage(): any[] {
    return globalPromptTemplates.value;
  }

  function loadVersionsFromStorage(chatId: string, storedVersions: any[]): void {
    const parsedVersions = storedVersions.map((version: any) => ({
      ...version,
      updatedAt: new Date(version.updatedAt)
    }));
    storyVersions.value.set(chatId, parsedVersions);
  }

  function saveVersionsToStorage(chatId: string): any[] {
    return storyVersions.value.get(chatId) || [];
  }

  return {
    // State
    globalPromptTemplates,
    storyVersions,
    
    // Getters
    getGlobalTemplates,
    getDefaultTemplate,
    getTemplateById,
    getVersionsForChat,
    getActiveVersionForChat,
    
    // Actions
    createPromptVersion,
    addVersionToChat,
    revertToPromptVersion,
    deletePromptVersion,
    clearVersionHistory,
    createGlobalPromptTemplate,
    updateGlobalPromptTemplate,
    deleteGlobalPromptTemplate,
    loadTemplatesFromStorage,
    saveTemplatesToStorage,
    loadVersionsFromStorage,
    saveVersionsToStorage
  };
}); 