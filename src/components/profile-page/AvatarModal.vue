<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="avatar-modal">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('profile.selectAvatar') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Current Avatar Display -->
        <div class="current-avatar-display q-mb-lg">
          <q-avatar size="100px" class="current-avatar">
            <img
              :src="selectedAvatar || currentAvatar || defaultAvatar"
              :alt="t('profile.currentAvatar')"
            />
          </q-avatar>
          <div class="text-caption text-grey-6 q-mt-xs text-center">
            {{ t('profile.currentAvatar') }}
          </div>
        </div>

        <!-- Category Selection -->
        <div class="hashtag-section q-mb-lg">
          <h5 class="text-subtitle1 q-mb-md">{{ t('profile.selectCategory') }}</h5>

          <!-- Loading Categories -->
          <div v-if="isLoadingCategories" class="hashtag-grid">
            <div v-for="i in 6" :key="i" class="hashtag-skeleton">
              <q-skeleton type="rect" width="120px" height="32px" />
            </div>
          </div>

          <!-- Categories Grid -->
          <div v-else-if="categoriesList && categoriesList.length > 0" class="hashtag-grid">
            <q-chip
              v-for="category in categoriesList"
              :key="category.category"
              :label="`#${category.category}`"
              :color="selectedCategory === category.category ? 'primary' : 'grey-7'"
              :text-color="selectedCategory === category.category ? 'white' : 'grey-3'"
              clickable
              @click="selectCategory(category)"
              class="hashtag-chip"
            >
              <template v-slot:avatar>
                <q-avatar :icon="category.icon || 'category'" size="sm" />
              </template>
              <template v-slot:after>
                <span class="text-caption q-ml-xs">({{ category.count }})</span>
              </template>
            </q-chip>
          </div>

          <!-- Empty Categories -->
          <div v-else class="empty-categories text-center q-py-md">
            <q-icon name="category" size="48px" color="grey-6" />
            <div class="text-body2 text-grey-6 q-mt-md">
              {{ t('profile.noCategoriesAvailable') }}
            </div>
          </div>
        </div>

        <!-- Avatar Grid -->
        <div class="avatar-section">
          <h5 class="text-subtitle1 q-mb-md">
            {{
              selectedCategoryName
                ? `${t('profile.avatarsFor')} ${selectedCategoryName}`
                : t('profile.selectCategoryFirst')
            }}
          </h5>

          <!-- Loading State -->
          <div v-if="isLoadingAvatars" class="avatar-grid">
            <div v-for="i in 12" :key="i" class="avatar-skeleton">
              <q-skeleton type="circle" size="60px" />
            </div>
          </div>

          <!-- Avatar Grid -->
          <div v-else-if="avatarList && avatarList.length > 0" class="avatar-grid">
            <div
              v-for="avatar in avatarList"
              :key="avatar.id"
              class="avatar-option"
              :class="{ 'avatar-selected': selectedAvatar === avatar.url }"
              @click="selectAvatar(avatar.url)"
            >
              <q-avatar size="60px" class="avatar-item">
                <img :src="avatar.url" :alt="avatar.name" />
              </q-avatar>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state text-center q-py-lg">
            <q-icon name="image_not_supported" size="48px" color="grey-6" />
            <div class="text-body2 text-grey-6 q-mt-md">
              {{
                selectedCategory ? t('profile.noAvatarsForTag') : t('profile.selectCategoryFirst')
              }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="t('common.cancel')" color="grey-7" @click="closeModal" />
        <q-btn
          :label="t('profile.saveAvatar')"
          color="primary"
          :disable="!selectedAvatar"
          @click="saveAvatar"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import {
  useAvatarCategories,
  useAvatarByCategory,
  useUpdateProfileSettings,
} from 'src/composables/profile-page/useProfileSettings.js'

// ========== PROPS & EMITS ==========
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currentAvatar: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'avatar-saved'])

// ========== COMPOSABLES ==========
const { t } = useI18n()
const $q = useQuasar()

// ========== REACTIVE DATA ==========
const selectedAvatar = ref('')
const selectedCategory = ref(null)
const selectedCategoryName = ref('')

const defaultAvatar = 'https://cdn.quasar.dev/img/boy-avatar.png'

// No need for hardcoded icon mapping - icons come from API

// ========== COMPUTED ==========
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// ========== QUERIES & MUTATIONS ==========
const { data: categoriesList, isLoading: isLoadingCategories } = useAvatarCategories()

const {
  data: avatarList,
  isLoading: isLoadingAvatars,
  refetch: refetchAvatars,
} = useAvatarByCategory(selectedCategory)

const { mutate: updateProfileMutation } = useUpdateProfileSettings()

// ========== WATCHERS ==========
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    refetchAvatars()
  }
})

watch(
  () => props.currentAvatar,
  (newAvatar) => {
    selectedAvatar.value = newAvatar
  },
)

// Auto-select default category when modal opens and categories are loaded
watch(
  () => [isOpen.value, categoriesList.value],
  ([modalOpen, categories]) => {
    if (modalOpen && categories && categories.length > 0 && !selectedCategory.value) {
      const defaultCategory = categories.find((cat) => cat.is_default === true)
      if (defaultCategory) {
        selectCategory(defaultCategory)
      }
    }
  },
  { immediate: true },
)

// ========== METHODS ==========
const selectCategory = (category) => {
  selectedCategory.value = category.category
  selectedCategoryName.value = `#${category.category}`
  selectedAvatar.value = '' // Reset selection when changing category
}

const selectAvatar = (avatarUrl) => {
  selectedAvatar.value = avatarUrl
}

const closeModal = () => {
  selectedAvatar.value = props.currentAvatar
  selectedCategory.value = null
  selectedCategoryName.value = ''
  isOpen.value = false
}

const saveAvatar = () => {
  if (!selectedAvatar.value) return

  updateProfileMutation(
    { avatar: selectedAvatar.value },
    {
      onSuccess: (data) => {
        console.log('Avatar update success in modal:', data)
        $q.notify({
          type: 'positive',
          message: t('profile.avatarUpdated'),
          position: 'top',
          timeout: 2000,
        })
        emit('avatar-saved', selectedAvatar.value)
        closeModal()
      },
      onError: (error) => {
        console.error('Avatar update error in modal:', error)

        // Don't show error for blocked OPTIONS requests
        if (error.message?.includes('Unnecessary OPTIONS request blocked')) {
          console.log('Skipping error notification for blocked OPTIONS request')
          return
        }

        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || t('profile.avatarUpdateError'),
          position: 'top',
          timeout: 3000,
        })
      },
    },
  )
}
</script>

<style lang="scss" scoped>
.avatar-modal {
  width: 100%;
  max-width: 600px;
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);

  .q-card__section {
    color: rgba(255, 255, 255, 0.9);
  }

  .current-avatar-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .current-avatar {
      border: 3px solid rgba(0, 212, 255, 0.3);
    }
  }

  .hashtag-section {
    .hashtag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 8px;

      .hashtag-chip {
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
        }
      }

      .hashtag-skeleton {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 32px;
      }
    }

    .empty-categories {
      padding: 40px 20px;
    }
  }

  .avatar-section {
    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.01);
    }

    .avatar-option {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 50%;
      padding: 4px;

      &:hover {
        background: rgba(0, 212, 255, 0.1);
        transform: scale(1.05);
      }

      &.avatar-selected {
        background: rgba(0, 212, 255, 0.2);
        border: 2px solid #00d4ff;
      }

      .avatar-item {
        border: 2px solid transparent;
        transition: border-color 0.3s ease;
      }
    }

    .avatar-skeleton {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 68px;
    }

    .empty-state {
      padding: 40px 20px;
    }
  }

  :deep(.q-skeleton) {
    background: rgba(255, 255, 255, 0.05);

    &::after {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    }
  }

  :deep(.q-dialog__inner) {
    padding: 16px;
  }
}
</style>
