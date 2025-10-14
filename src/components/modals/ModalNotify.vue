<template>
  <q-dialog
    v-model="isOpen"
    :persistent="false"
    :maximized="false"
    transition-show="scale"
    transition-hide="scale"
    @hide="onHide"
  >
    <q-card class="notification-card" style="min-width: 320px; max-width: 500px">
      <!-- Header with notification icon and close button -->
      <q-card-section class="notification-header">
        <div class="row items-center no-wrap">
          <q-icon :name="notificationIcon" :color="notificationColor" size="md" class="q-mr-sm" />
          <div class="col">
            <div class="text-h6 text-weight-medium">
              {{ notification?.title || t('notification.defaultTitle') }}
            </div>
            <div class="text-caption text-grey-6">
              {{ formatDate(notification?.created_at) }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="grey-6" @click="closeModal" class="q-ml-sm" />
        </div>
      </q-card-section>

      <!-- Notification content -->
      <q-card-section class="notification-content">
        <div class="text-body1 text-grey-8">
          {{ notification?.message || t('notification.defaultMessage') }}
        </div>
      </q-card-section>

      <!-- Auto-close progress bar -->
      <q-linear-progress
        :value="progressValue"
        :color="notificationColor"
        size="3px"
        class="progress-bar"
        :class="{ 'progress-bar-animated': isAutoClosing }"
      />

      <!-- Footer with action buttons -->
      <q-card-actions align="right" class="notification-actions">
        <q-btn
          flat
          :label="t('notification.markAsRead')"
          color="primary"
          @click="markAsRead"
          :loading="isMarkingAsRead"
          v-if="notification && !notification.read"
        />
        <q-btn flat :label="t('common.close')" color="grey-6" @click="closeModal" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  notification: {
    type: Object,
    default: () => ({
      main: 1,
      title: '',
      message: '',
      created_at: '',
      read: false,
    }),
  },
  autoCloseDelay: { type: Number, default: 10000 }, // 10 seconds
  autoClose: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'mark-as-read', 'close'])

const { t } = useI18n()
const $q = useQuasar()

// Reactive state
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isMarkingAsRead = ref(false)
const isAutoClosing = ref(false)
const progressValue = ref(0)
const autoCloseTimer = ref(null)
const progressTimer = ref(null)

// Computed properties
const notificationIcon = computed(() => {
  if (props.notification?.read) return 'check_circle'
  return 'notifications'
})

const notificationColor = computed(() => {
  if (props.notification?.read) return 'positive'
  return 'primary'
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return t('notification.justNow')
    } else if (diffInHours < 24) {
      return t('notification.hoursAgo', { hours: diffInHours })
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return t('notification.daysAgo', { days: diffInDays })
    }
  } catch (error) {
    console.warn('Error formatting date:', error)
    return dateString
  }
}

const startAutoClose = () => {
  if (!props.autoClose || props.notification?.read) return

  isAutoClosing.value = true
  progressValue.value = 0

  // Progress bar animation
  const progressInterval = 50 // Update every 50ms
  const totalSteps = props.autoCloseDelay / progressInterval
  let currentStep = 0

  progressTimer.value = setInterval(() => {
    currentStep++
    progressValue.value = currentStep / totalSteps

    if (currentStep >= totalSteps) {
      clearInterval(progressTimer.value)
      closeModal()
    }
  }, progressInterval)

  // Auto-close timer as backup
  autoCloseTimer.value = setTimeout(() => {
    closeModal()
  }, props.autoCloseDelay)
}

const stopAutoClose = () => {
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
    autoCloseTimer.value = null
  }
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
  isAutoClosing.value = false
}

const markAsRead = async () => {
  if (props.notification?.read) return

  isMarkingAsRead.value = true

  try {
    emit('mark-as-read', props.notification)

    $q.notify({
      type: 'positive',
      message: t('notification.markedAsRead'),
      timeout: 2000,
      position: 'top',
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    $q.notify({
      type: 'negative',
      message: t('notification.markAsReadError'),
      timeout: 3000,
      position: 'top',
    })
  } finally {
    isMarkingAsRead.value = false
  }
}

const closeModal = () => {
  stopAutoClose()
  emit('close', props.notification)
  isOpen.value = false
}

const onHide = () => {
  stopAutoClose()
  progressValue.value = 0
  isAutoClosing.value = false
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Reset progress when modal opens
      progressValue.value = 0
      // Start auto-close if enabled and notification is not read
      if (props.autoClose && !props.notification?.read) {
        // Small delay to ensure modal is fully rendered
        setTimeout(() => {
          startAutoClose()
        }, 100)
      }
    } else {
      stopAutoClose()
    }
  },
)

watch(
  () => props.notification?.read,
  (isRead) => {
    if (isRead) {
      stopAutoClose()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue && props.autoClose && !props.notification?.read) {
    startAutoClose()
  }
})

onUnmounted(() => {
  stopAutoClose()
})
</script>

<style lang="scss" scoped>
.notification-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  background: white;
}

.notification-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;

  .text-h6 {
    color: white;
    font-weight: 600;
  }

  .text-caption {
    color: rgba(255, 255, 255, 0.8);
  }
}

.notification-content {
  padding: 20px;
  background: white;

  .text-body1 {
    line-height: 1.6;
    word-wrap: break-word;
  }
}

.progress-bar {
  height: 3px;
  background: rgba(0, 0, 0, 0.1);

  &.progress-bar-animated {
    transition: all 0.1s ease;
  }
}

.notification-actions {
  padding: 12px 20px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;

  .q-btn {
    text-transform: none;
    font-weight: 500;
    border-radius: 8px;
    padding: 8px 16px;

    &:first-child {
      margin-right: 8px;
    }
  }
}

// Hover effects
.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

// Mobile responsiveness
@media (max-width: 600px) {
  .notification-card {
    margin: 16px;
    min-width: calc(100vw - 32px);
    max-width: calc(100vw - 32px);
  }

  .notification-header {
    padding: 12px 16px;

    .text-h6 {
      font-size: 1.1rem;
    }
  }

  .notification-content {
    padding: 16px;
  }

  .notification-actions {
    padding: 8px 16px 16px;
    flex-direction: column;

    .q-btn {
      width: 100%;
      margin: 4px 0;
    }
  }
}

// Animation for modal appearance
:deep(.q-dialog) {
  .q-card {
    animation: notificationSlideIn 0.3s ease-out;
  }
}

@keyframes notificationSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Dark mode support (if needed)
@media (prefers-color-scheme: dark) {
  .notification-card {
    background: #1a1a2e;
    color: white;
  }

  .notification-content {
    background: #1a1a2e;

    .text-body1 {
      color: rgba(255, 255, 255, 0.87);
    }
  }

  .notification-actions {
    background: #16213e;
    border-top-color: #2d3748;
  }
}
</style>
