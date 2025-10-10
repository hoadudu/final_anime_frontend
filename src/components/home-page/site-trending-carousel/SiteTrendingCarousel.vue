<template>
  <div class="trending-section">
    <h2 class="trending-title">{{ t('trending.trendingTitle') }}</h2>

    <div v-if="isLoading" class="loading-state">
      <q-spinner-dots color="primary" size="40px" />
      <div class="loading-text">{{ t('trending.loadingTrendingAnime') }}</div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">{{ error }}</div>
      <q-btn color="primary" flat @click="refreshTrending">{{ t('trending.retry') }}</q-btn>
    </div>

    <div v-else class="trending-container">
      <q-btn
        round
        flat
        dense
        class="nav-button nav-button-left"
        icon="chevron_left"
        @click="scrollLeft"
        :disable="!canScrollLeft"
      />

      <div
        class="trending-scroll"
        ref="scrollContainer"
        @scroll="updateScrollButtons"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startDragTouch"
        @touchmove="onDragTouch"
        @touchend="endDrag"
      >
        <q-list class="trending-items" dense>
          <q-item v-if="!trendingMovies || trendingMovies.length === 0" class="no-data-message">
            {{ t('trending.noTrendingAnime') }}
          </q-item>
          <q-item
            v-for="(item, index) in trendingMovies"
            :key="item.id || index"
            clickable
            class="trending-item q-pa-none"
            @click="handleItemClick(item)"
          >
            <q-card flat bordered class="item-image full-width">
              <q-img
                :src="getItemImage(item)"
                :alt="item.title"
                referrerpolicy="no-referrer"
                @error="handleImageError"
                height="280px"
                fit="cover"
                class="full-height"
              >
                <div class="item-overlay absolute-bottom">
                  <div class="item-number">{{ String(index + 1).padStart(2, '0') }}</div>
                  <div class="item-title">{{ item.title }}</div>
                </div>
                <MovieTooltip :movie="transformItemForTooltip(item)" />
              </q-img>
            </q-card>
          </q-item>
        </q-list>
      </div>

      <q-btn
        round
        flat
        dense
        class="nav-button nav-button-right"
        icon="chevron_right"
        @click="scrollRight"
        :disable="!canScrollRight"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useHomePageTrendingCarouselData } from 'src/composables/home-page/useHomePageData'
import MovieTooltip from 'src/components/MovieTooltip.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { QSpinnerDots, QBtn, QCard, QImg, QItem, QList } from 'quasar'

const router = useRouter()
const {
  data: trendingMovies,
  isLoading,
  error,
  refetch: fetchTrendingMovies,
} = useHomePageTrendingCarouselData()

const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const fallbackImage = 'https://dummyimage.com/200x280/333333/ffffff?text=Not+Available'

// Thêm biến cho tính năng drag
const isDragging = ref(false)
const startX = ref(0)
const startScrollLeft = ref(0)
const isClick = ref(true) // Để phân biệt giữa click và drag

onMounted(() => {
  nextTick(() => {
    updateScrollButtons()
    setupScrollListener()
  })
})

function setupScrollListener() {
  window.addEventListener('resize', updateScrollButtons)
  return () => window.removeEventListener('resize', updateScrollButtons)
}

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

function updateScrollButtons() {
  const container = scrollContainer.value
  if (container) {
    canScrollLeft.value = container.scrollLeft > 0
    canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 10
  }
}

function refreshTrending() {
  fetchTrendingMovies()
}

function handleImageError(event) {
  event.target.src = fallbackImage
}

function getItemImage(item) {
  // Try different possible image properties
  return item.posterUrl || item.poster || item.thumbnail || item.image || fallbackImage
}

function transformItemForTooltip(item) {
  return {
    title: item.title,
    titles: item.titles || [], // Thêm hỗ trợ cho trường titles
    description: item.description || item.summary || item.overview || '',
    aired: item.year ? `${item.year}` : item.release_date || item.aired || '',
    rank: item.rating ? `${item.rating}/10` : '',
    genres: item.genres || [],
  }
}

// Thêm các hàm xử lý drag chuột
function startDrag(e) {
  if (!scrollContainer.value) return

  isDragging.value = true
  isClick.value = true
  startX.value = e.pageX
  startScrollLeft.value = scrollContainer.value.scrollLeft
  scrollContainer.value.style.cursor = 'grabbing'
  scrollContainer.value.style.userSelect = 'none'
  e.preventDefault()
}

function onDrag(e) {
  if (!isDragging.value || !scrollContainer.value) return

  const x = e.pageX
  const distance = x - startX.value

  // Nếu khoảng cách kéo lớn hơn 5px, xem như là drag không phải click
  if (Math.abs(distance) > 5) {
    isClick.value = false
  }

  scrollContainer.value.scrollLeft = startScrollLeft.value - distance
  e.preventDefault()
}

function endDrag() {
  isDragging.value = false
  if (scrollContainer.value) {
    scrollContainer.value.style.cursor = 'grab'
    scrollContainer.value.style.removeProperty('user-select')
  }
}

// Thêm các hàm xử lý touch events cho mobile
function startDragTouch(e) {
  if (!scrollContainer.value || !e.touches[0]) return

  isDragging.value = true
  isClick.value = true
  startX.value = e.touches[0].pageX
  startScrollLeft.value = scrollContainer.value.scrollLeft
}

function onDragTouch(e) {
  if (!isDragging.value || !scrollContainer.value || !e.touches[0]) return

  const x = e.touches[0].pageX
  const distance = x - startX.value

  // Nếu khoảng cách kéo lớn hơn 5px, xem như là drag không phải click
  if (Math.abs(distance) > 5) {
    isClick.value = false
  }

  scrollContainer.value.scrollLeft = startScrollLeft.value - distance

  // Ngăn chặn scroll trang khi drag carousel
  if (Math.abs(distance) > 10) {
    e.preventDefault()
  }
}

function handleItemClick(item) {
  // Chỉ điều hướng nếu đây là click chứ không phải drag
  if (!isClick.value) return

  // Navigate to anime detail page
  if (item.link) {
    // Check if route exists
    router.push({ path: item.link })
  }
}
</script>

<style scoped>
.trending-section {
  width: 100%;
  min-height: 350px;
  position: relative;
}

.trending-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  margin-top: 0;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #ff5722, #ff8a65);
    border-radius: 2px;
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 280px;
  width: 100%;
  gap: 1rem;
}

.loading-text,
.error-message,
.no-data-message {
  color: #ffffff;
  font-size: 1rem;
  opacity: 0.8;
}

.trending-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-button:hover:not([disabled]) {
  background: rgba(0, 0, 0, 0.9) !important;
  transform: translateY(-50%) scale(1.1);
}

.nav-button[disabled] {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-button i {
  font-size: 20px;
}

.nav-button-left {
  left: -24px;
}

.nav-button-right {
  right: -24px;
}

.trending-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  /* Thêm cursor grab để hiển thị là có thể kéo */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  scroll-behavior: smooth;
}

.trending-scroll::-webkit-scrollbar {
  display: none;
}

.trending-items {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: transparent;
}

.trending-item {
  flex-shrink: 0;
  width: 220px;
  cursor: pointer;
  transition: transform 0.3s ease;
  background: transparent;
}

.trending-item:hover {
  transform: translateY(-8px);
}

.item-image {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: transparent;
  transition: transform 0.3s ease;
}

.trending-item:hover .item-image {
  transform: scale(1.05);
}

.item-overlay {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem 1rem 1rem;
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-number {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 3rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1;
  z-index: 2;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.3;
  margin-top: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  position: absolute;
  right: 1rem;
  top: 1rem;
  bottom: 1rem;
  width: 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 2;
}

@media (max-width: 768px) {
  .trending-title {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .trending-container {
    margin: 0 -20px;
    padding: 0 20px;
  }

  .nav-button {
    display: none !important;
  }

  .trending-items {
    gap: 0.3rem;
  }

  .trending-item {
    width: 160px !important;
  }

  .item-image {
    height: 220px !important;
  }

  .item-number {
    font-size: 2.5rem;
  }

  .item-title {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .trending-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    padding-left: 0.75rem;

    &::before {
      width: 3px;
      height: 18px;
    }
  }

  .trending-item {
    width: 140px;
  }

  .item-image {
    height: 200px;
  }

  .item-number {
    font-size: 2rem;
  }
}
</style>
