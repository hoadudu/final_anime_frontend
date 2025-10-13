<template>
  <div class="top-right-container">
    <!-- Rating Section -->
    <q-card class="rating-card">
      <div class="rating-header">
        <div class="rating-score">⭐ 9.4</div>
        <q-btn
          glossy
          color="secondary"
          no-caps
          :label="$t('watch.voteNow')"
          class="rating-action"
        />
      </div>
    </q-card>

    <!-- Post Reactions Component -->
    <PostReactions
      v-if="postId"
      :post-id="postId"
      @reaction-changed="onReactionChanged"
      class="q-mt-md"
    />
  </div>
</template>

<script setup>
import PostReactions from 'src/components/PostReactions.vue'

// Props
defineProps({
  postId: {
    type: [Number, String],
    default: null,
  },
})

// Emits
const emit = defineEmits(['reaction-changed'])

// Handle reaction change event
const onReactionChanged = (data) => {
  console.log('Reaction changed:', data)
  emit('reaction-changed', data)
}
</script>

<style scoped>
.top-right-container {
  width: 100%;
  /* max-width: 320px; */
  margin: 0 auto;
}

.rating-card {
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(20, 20, 20, 0.95), rgba(16, 16, 16, 0.98));
  color: #e8e8e8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
  padding: 16px 18px;
}

.rating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-score {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffd166;
}

.rating-action {
  padding: 0 12px;
}

.comments-card {
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(20, 20, 20, 0.95), rgba(16, 16, 16, 0.98));
  color: #e8e8e8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
  padding: 16px 18px;
}

.comment-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f0f0f0;
}

.banner-emoji {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .top-right-container {
    max-width: 100%;
  }
}
</style>
