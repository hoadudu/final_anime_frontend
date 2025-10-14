<template>
  <div v-if="isOpen" class="live-search-overlay" @click="handleOverlayClick">
    <div class="live-search-container" @click.stop>
      <!-- Loading State -->
      <div v-if="isLoading" class="live-search-loading">
        <q-spinner-dots color="primary" size="40px" />
        <p class="q-mt-md text-grey-6">Đang tìm kiếm...</p>
      </div>

      <!-- Results -->
      <div v-else-if="results && results.length > 0" class="live-search-results">
        <div class="results-grid">
          <div
            v-for="anime in results"
            :key="anime.id"
            class="result-card"
            @click="handleAnimeClick(anime)"
          >
            <!-- Poster -->
            <div class="result-poster">
              <q-img
                :src="anime.image"
                :alt="anime.title"
                fit="cover"
                loading="lazy"
                spinner-color="primary"
                :ratio="3 / 4"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-8">
                    <q-icon name="broken_image" size="32px" color="grey-5" />
                  </div>
                </template>
              </q-img>
            </div>

            <!-- Info -->
            <div class="result-info">
              <h4 class="result-title" :title="anime.title">
                {{ anime.title }}
              </h4>
              <div class="result-meta">
                <span v-if="anime.status" class="result-status">{{ anime.status }}</span>
                <span v-if="anime.type" class="result-type">{{ anime.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="results && results.length === 0" class="live-search-empty">
        <q-icon name="search_off" size="48px" color="grey-6" />
        <p class="q-mt-md text-grey-6">Không tìm thấy kết quả</p>
      </div>

      <!-- Initial State -->
      <div v-else class="live-search-empty">
        <q-icon name="search" size="48px" color="grey-6" />
        <p class="q-mt-md text-grey-6">Nhập từ khóa để tìm kiếm</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// ========== PROPS ==========
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  results: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// ========== EMITS ==========
const emit = defineEmits(['close', 'anime-click'])

// ========== COMPOSABLES ==========
const router = useRouter()

// ========== METHODS ==========

/**
 * Handle overlay click to close
 */
const handleOverlayClick = () => {
  emit('close')
}

/**
 * Handle anime card click
 */
const handleAnimeClick = (anime) => {
  emit('anime-click', anime)
  emit('close')

  // Navigate to anime info page
  if (anime.link) {
    router.push(anime.link)
  }
}
</script>

<style lang="scss" scoped>
// ========== LIVE SEARCH OVERLAY ==========
.live-search-overlay {
  position: fixed;
  top: 68px; // Below header
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  overflow-y: auto;
  animation: fadeIn 0.2s ease;

  @media (max-width: 599px) {
    top: 56px; // Adjust for mobile header
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// ========== LIVE SEARCH CONTAINER ==========
.live-search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 300px;

  @media (max-width: 991px) {
    padding: 16px;
  }

  @media (max-width: 599px) {
    padding: 12px;
  }
}

// ========== LOADING STATE ==========
.live-search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: rgba(255, 255, 255, 0.8);
}

// ========== EMPTY STATE ==========
.live-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: rgba(255, 255, 255, 0.8);
}

// ========== RESULTS GRID ==========
.live-search-results {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-grid {
  display: grid;
  gap: 12px;

  // Desktop: 8 columns (tăng gấp đôi từ 4)
  grid-template-columns: repeat(8, 1fr);

  // Large tablet: 6 columns
  @media (max-width: 1400px) {
    grid-template-columns: repeat(6, 1fr);
  }

  // Tablet: 4 columns
  @media (max-width: 1023px) {
    grid-template-columns: repeat(4, 1fr);
  }

  // Mobile: 3 columns
  @media (max-width: 599px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

// ========== RESULT CARD ==========
.result-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.4);
    transform: translateY(-2px);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(0, 212, 255, 0.2);

    .result-title {
      color: #00d4ff;
    }
  }
}

// ========== RESULT POSTER ==========
.result-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;

  :deep(.q-img) {
    width: 100%;
    height: 100%;
  }
}

// ========== RESULT INFO ==========
.result-info {
  padding: 8px;

  @media (max-width: 599px) {
    padding: 6px;
  }
}

.result-title {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  font-size: 0.7rem;
  line-height: 1.3;
  margin: 0 0 4px 0;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  transition: color 0.3s ease;

  @media (max-width: 599px) {
    font-size: 0.65rem;
    height: 2.4em;
  }
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.75);

  @media (max-width: 599px) {
    font-size: 0.55rem;
  }
}

.result-status {
  font-weight: 600;
  color: #00d4ff;
}

.result-type {
  font-weight: 500;
  text-transform: uppercase;
}
</style>
