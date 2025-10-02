<template>
  <q-card class="vote-card">
    <!-- Rating -->
    <div class="vote-header">
      <div class="vote-score">⭐ 9.4</div>
      <q-btn glossy color="secondary" no-caps label="Vote now" class="vote-action" />
    </div>

    <!-- Question -->
    <div class="vote-question">
      {{ $t('watch.rateQuestion') || 'What do you think about this anime?' }}
    </div>

    <!-- Options -->
    <div class="row justify-around q-mt-md">
      <q-btn
        v-for="opt in options"
        :key="opt.label"
        outline
        rounded
        glossy
        no-caps
        :label="opt.label"
        :icon="opt.icon"
        class="vote-btn"
        @click="vote(opt.label)"
      />
    </div>

    <!-- Comments -->
    <div class="comment-banner">
      <q-icon name="chat_bubble" class="banner-icon" />
      <span>{{ $t('watch.comments') || 'Comments' }}</span>
      <q-space />
      <img src="https://i.imgur.com/5z4d1zU.png" alt="luffy" height="46" />
    </div>
  </q-card>
</template>

<script setup>
const options = [
  { label: 'Boring', icon: 'sentiment_dissatisfied' },
  { label: 'Great', icon: 'sentiment_satisfied' },
  { label: 'Amazing', icon: 'sentiment_very_satisfied' },
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
  background: linear-gradient(160deg, rgba(28, 29, 55, 0.95), rgba(12, 13, 28, 0.95));
  color: #f1f3ff;
  border: 1px solid rgba(126, 134, 214, 0.35);
  box-shadow: 0 12px 35px rgba(6, 8, 18, 0.45);
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
  color: #d7dcff;
}

.vote-btn {
  width: 95px;
  justify-content: center;
  font-weight: 600;
  color: #cad2ff;
  border-color: rgba(142, 151, 235, 0.6);
}

.vote-btn:hover {
  box-shadow: 0 0 12px rgba(136, 171, 255, 0.5);
}

.comment-banner {
  margin-top: 22px;
  padding: 10px 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(56, 60, 102, 0.9), rgba(33, 36, 65, 0.95));
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f5f7ff;
}

.banner-icon {
  color: #82b1ff;
}

@media (max-width: 768px) {
  .vote-card {
    max-width: 100%;
  }
}
</style>
