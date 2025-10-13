<template>
  <q-card class="post-reactions-card">
    <!-- Header with total count -->
    <div class="reactions-header">
      <div class="reactions-title">
        <q-icon name="thumb_up" class="title-icon" />
        <span>{{ $t('reactions.title') || 'Phản ứng' }}</span>
      </div>
      <div class="total-count">{{ totalReactions }} {{ $t('reactions.total') || 'tổng' }}</div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="reactions-loading">
      <q-spinner-dots size="lg" color="primary" />
      <div class="loading-text">{{ $t('reactions.loading') || 'Đang tải...' }}</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="reactions-error">
      <q-icon name="error" color="negative" size="md" />
      <div class="error-text">{{ $t('reactions.errorLoading') || 'Lỗi tải phản ứng' }}</div>
      <q-btn flat dense color="primary" :label="$t('common.retry') || 'Thử lại'" @click="refetch" />
    </div>

    <!-- Reactions -->
    <div v-else class="reactions-container">
      <div
        v-for="reactionType in Object.values(REACTION_TYPES)"
        :key="reactionType"
        class="reaction-item"
        :class="{
          'reaction-active': hasReacted(reactionType),
          'reaction-disabled': isMutating && !isAuthenticated,
        }"
        @click="handleReaction(reactionType)"
      >
        <!-- Emoji and count -->
        <div class="reaction-display">
          <div class="reaction-emoji">
            {{ REACTION_CONFIG[reactionType].emoji }}
          </div>
          <div class="reaction-count">
            {{ reactions[reactionType] || 0 }}
          </div>
        </div>

        <!-- Label and percentage -->
        <div class="reaction-info">
          <div class="reaction-label">
            {{
              $t(REACTION_CONFIG[reactionType].labelKey) ||
              REACTION_CONFIG[reactionType].defaultLabel
            }}
          </div>
          <div class="reaction-percentage">{{ getReactionPercentage(reactionType) }}%</div>
        </div>

        <!-- Progress bar -->
        <div class="reaction-progress">
          <div
            class="progress-bar"
            :class="`progress-${reactionType}`"
            :style="{ width: `${getReactionPercentage(reactionType)}%` }"
          ></div>
        </div>

        <!-- Active indicator -->
        <div v-if="hasReacted(reactionType)" class="reaction-indicator">
          <q-icon name="check_circle" color="positive" size="sm" />
        </div>

        <!-- Loading indicator for this reaction -->
        <div v-if="isMutating" class="reaction-loading-overlay">
          <q-spinner size="sm" color="white" />
        </div>
      </div>
    </div>

    <!-- Authentication prompt -->
    <div v-if="!isAuthenticated" class="auth-prompt">
      <q-icon name="info" color="info" />
      <span>{{ $t('reactions.loginToReact') || 'Đăng nhập để phản ứng' }}</span>
    </div>

    <!-- My reaction display -->
    <div v-if="myReaction && isAuthenticated" class="my-reaction">
      <q-chip
        :color="getReactionColor(myReaction)"
        text-color="white"
        :icon="'sentiment_satisfied'"
      >
        {{ $t('reactions.yourReaction') || 'Phản ứng của bạn' }}:
        {{ $t(REACTION_CONFIG[myReaction].labelKey) || REACTION_CONFIG[myReaction].defaultLabel }}
      </q-chip>
    </div>
  </q-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { usePostReactions } from 'src/composables/watch-anime/usePostReactions'

// Props
const props = defineProps({
  postId: {
    type: [Number, String],
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['reaction-changed'])

// Use the reactions composable
const {
  reactions,
  myReaction,
  totalReactions,
  isLoading,
  error,
  handleReaction: handleReactionBase,
  hasReacted,
  getReactionPercentage,
  refetch,
  isAuthenticated,
  isMutating,
  REACTION_TYPES,
  REACTION_CONFIG,
} = usePostReactions(() => props.postId)

// Enhanced reaction handler that emits events
const handleReaction = async (reactionType) => {
  const previousReaction = myReaction.value
  await handleReactionBase(reactionType)

  // Emit event for parent components
  emit('reaction-changed', {
    postId: props.postId,
    previousReaction,
    newReaction: myReaction.value,
    reactionType,
  })
}

// Get color for reaction chip
const getReactionColor = (reactionType) => {
  switch (reactionType) {
    case REACTION_TYPES.BORING:
      return 'orange'
    case REACTION_TYPES.AWESOME:
      return 'positive'
    case REACTION_TYPES.EXCELLENT:
      return 'purple'
    default:
      return 'primary'
  }
}
</script>

<style scoped>
.post-reactions-card {
  background: linear-gradient(160deg, rgba(20, 20, 20, 0.95), rgba(16, 16, 16, 0.98));
  color: #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.reactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.reactions-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.title-icon {
  color: #3b82f6;
}

.total-count {
  font-size: 14px;
  color: #9ca3af;
}

.reactions-loading,
.reactions-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
}

.loading-text,
.error-text {
  color: #9ca3af;
  font-size: 14px;
}

.reactions-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Responsive: 3 cards in a row for screens < 1440px */
@media (max-width: 1439px) {
  .reactions-container {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
  }

  .reaction-item {
    flex: 1 1 0;
    flex-direction: column;
    padding: 10px;
    text-align: center;
    min-width: 0;
  }

  .reaction-display {
    min-width: auto;
    width: 100%;
  }

  .reaction-info {
    width: 100%;
    align-items: center;
  }

  .reaction-progress {
    left: 0;
    right: 0;
  }
}

/* Tablet: 768px - 1023px - reduce sizes */
@media (max-width: 1023px) {
  .post-reactions-card {
    padding: 16px;
  }

  .reaction-item {
    padding: 8px;
    gap: 8px;
  }

  .reaction-emoji {
    font-size: 22px;
  }

  .reaction-count {
    font-size: 14px;
  }

  .reaction-label {
    font-size: 13px;
  }

  .reaction-percentage {
    font-size: 11px;
  }
}

/* Mobile: <= 767px - smaller sizes */
@media (max-width: 767px) {
  .post-reactions-card {
    padding: 12px;
  }

  .reactions-header {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }

  .reactions-title {
    font-size: 14px;
    gap: 6px;
  }

  .total-count {
    font-size: 12px;
  }

  .reactions-container {
    gap: 6px;
  }

  .reaction-item {
    padding: 6px;
    gap: 6px;
    border-radius: 10px;
  }

  .reaction-emoji {
    font-size: 20px;
    margin-bottom: 2px;
  }

  .reaction-count {
    font-size: 13px;
  }

  .reaction-label {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .reaction-percentage {
    font-size: 10px;
  }

  .reaction-indicator {
    top: 4px;
    right: 4px;
  }

  .reaction-indicator :deep(.q-icon) {
    font-size: 16px;
  }

  .my-reaction {
    margin-top: 8px;
  }

  .my-reaction :deep(.q-chip) {
    font-size: 11px;
    padding: 4px 8px;
  }

  .auth-prompt {
    padding: 8px;
    font-size: 12px;
    gap: 6px;
    margin-top: 8px;
  }
}

/* Extra small mobile: <= 375px - minimal sizes */
@media (max-width: 375px) {
  .post-reactions-card {
    padding: 10px;
  }

  .reactions-container {
    gap: 4px;
  }

  .reaction-item {
    padding: 4px;
    gap: 4px;
  }

  .reaction-emoji {
    font-size: 18px;
  }

  .reaction-count {
    font-size: 12px;
  }

  .reaction-label {
    font-size: 10px;
  }

  .reaction-percentage {
    font-size: 9px;
  }

  .reaction-progress {
    height: 2px;
  }

  .reactions-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .auth-prompt {
    padding: 6px;
    font-size: 11px;
  }
}

.reaction-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition:
    background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.reaction-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.reaction-item.reaction-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  animation: pulseActive 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulseActive {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

.reaction-item.reaction-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.reaction-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.reaction-emoji {
  font-size: 24px;
  margin-bottom: 4px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reaction-item.reaction-active .reaction-emoji {
  animation: emojiPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes emojiPop {
  0% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.3) rotate(-5deg);
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.reaction-count {
  font-weight: 600;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reaction-item.reaction-active .reaction-count {
  transform: scale(1.1);
  color: #60a5fa;
}

.reaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reaction-label {
  font-weight: 500;
  font-size: 14px;
  color: #fff;
  transition: color 0.3s ease;
}

.reaction-item.reaction-active .reaction-label {
  color: #60a5fa;
}

.reaction-percentage {
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.reaction-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 0 12px 12px;
  transform-origin: left;
}

.reaction-item.reaction-active .progress-bar {
  animation: progressPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes progressPulse {
  0%,
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.8;
    transform: scaleY(1.2);
  }
}

.progress-boring {
  background: linear-gradient(90deg, #f97316, #ea580c);
}

.progress-awesome {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-excellent {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.reaction-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  animation: indicatorFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes indicatorFadeIn {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-45deg);
  }
  60% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.reaction-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.auth-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: #93c5fd;
}

.my-reaction {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

/* Compact mode */
.post-reactions-card.compact {
  padding: 12px;
}

.compact .reactions-container {
  flex-direction: row;
  gap: 8px;
}

.compact .reaction-item {
  flex: 1;
  flex-direction: column;
  padding: 8px;
  text-align: center;
}

.compact .reaction-display {
  min-width: auto;
}

.compact .reaction-emoji {
  font-size: 20px;
}

.compact .reaction-info {
  align-items: center;
}

.compact .reaction-label {
  font-size: 12px;
}
</style>
