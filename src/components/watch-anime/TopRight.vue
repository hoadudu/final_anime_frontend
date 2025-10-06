<template>
  <q-card class="vote-card">
    <!-- Rating -->
    <div class="vote-header">
      <div class="vote-score">⭐ 9.4</div>
      <q-btn glossy color="secondary" no-caps :label="$t('watch.voteNow')" class="vote-action" />
    </div>

    <!-- Question -->
    <div class="vote-question">
      {{ $t('watch.rateQuestion') }}
    </div>

    <!-- Options -->
    <div class="vote-options-container">
      <div v-for="opt in options" :key="opt.text" class="vote-option" @click="vote(opt.text)">
        <div class="vote-emoji">{{ opt.emoji }}</div>
        <div class="vote-text">{{ $t(opt.text) }}</div>
      </div>
    </div>

    <!-- Comments -->
    <div class="comment-banner">
      <span class="banner-emoji">💬</span>
      <span>{{ $t('watch.comments') || 'Comments' }}</span>
      <q-space />
      <img src="https://i.imgur.com/5z4d1zU.png" alt="luffy" height="46" />
    </div>
  </q-card>
</template>

<script setup>
const options = [
  { emoji: '😫', text: 'watch.boring' },
  { emoji: '😃', text: 'watch.great' },
  { emoji: '😍', text: 'watch.amazing' },
]

const vote = (choice) => {
  console.log('You voted:', choice)
}
</script>

<style scoped>
.vote-card {
  width: 100%;
  max-width: 320px;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(20, 20, 20, 0.95), rgba(16, 16, 16, 0.98));
  color: #e8e8e8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
  margin: 16px auto;
  padding: 16px 18px 22px;
}

.vote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vote-score {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffd166;
}

.vote-action {
  padding: 0 12px;
}

.vote-question {
  margin-top: 14px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
}

.vote-options-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: nowrap;
}

.vote-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 0;
}

.vote-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
}

.vote-emoji {
  font-size: 2rem;
  line-height: 1;
}

.vote-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #d0d0d0;
}

.comment-banner {
  margin-top: 22px;
  padding: 10px 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(22, 22, 22, 0.95));
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f0f0f0;
}

.banner-emoji {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .vote-card {
    max-width: 100%;
  }

  .vote-options-container {
    gap: 4px;
  }

  .vote-option {
    padding: 8px 4px;
  }

  .vote-emoji {
    font-size: 1.5rem;
  }

  .vote-text {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .vote-options-container {
    gap: 2px;
  }

  .vote-option {
    padding: 6px 2px;
  }

  .vote-emoji {
    font-size: 1.3rem;
  }

  .vote-text {
    font-size: 0.7rem;
  }
}
</style>
