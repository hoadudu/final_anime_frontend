<template>
  <q-dialog
    v-model="isOpen"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="dark-mode-modal"
  >
    <q-card class="modal-card dark-card">
      <!-- Header with Gradient -->
      <q-card-section class="modal-header row items-center q-pb-md">
        <div class="header-content">
          <div class="text-h4 text-weight-bold flex items-center">
            <span class="header-emoji">🎭</span>
            <span>{{ t('genres.selectGenres') }}</span>
          </div>
          <div class="text-subtitle2 text-grey-4 q-mt-xs">
            ✨ {{ t('genres.pickYourFavorite') || 'Pick your favorite genres' }}
          </div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" class="close-btn" size="md" @click="closeModal" />
      </q-card-section>

      <!-- Search bar with Dark Style -->
      <q-card-section class="search-section q-pt-none q-pb-sm">
        <q-input
          v-model="searchQuery"
          filled
          dark
          :placeholder="'🔍 ' + t('genres.searchGenres')"
          class="search-input"
          bg-color="grey-9"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" color="purple-4" />
          </template>
        </q-input>
      </q-card-section>

      <!-- Genre tabs with Emoji -->
      <q-card-section class="tabs-section q-pt-none q-pb-sm">
        <q-tabs
          v-model="activeTab"
          dense
          class="genre-tabs"
          active-color="purple-4"
          indicator-color="purple-4"
          align="left"
          no-caps
        >
          <q-tab name="all" class="tab-item">
            <div class="tab-content">
              <span class="tab-emoji">🌟</span>
              <span>{{ t('common.all') }}</span>
            </div>
          </q-tab>
          <q-tab name="genres" class="tab-item">
            <div class="tab-content">
              <span class="tab-emoji">🎬</span>
              <span>{{ t('genres.genres') }}</span>
            </div>
          </q-tab>
          <q-tab name="explicit" class="tab-item">
            <div class="tab-content">
              <span class="tab-emoji">🔞</span>
              <span>{{ t('genres.explicit') }}</span>
            </div>
          </q-tab>
          <q-tab name="themes" class="tab-item">
            <div class="tab-content">
              <span class="tab-emoji">🎨</span>
              <span>{{ t('genres.themes') }}</span>
            </div>
          </q-tab>
          <q-tab name="demographics" class="tab-item">
            <div class="tab-content">
              <span class="tab-emoji">👥</span>
              <span>{{ t('genres.demographics') }}</span>
            </div>
          </q-tab>
        </q-tabs>
      </q-card-section>

      <!-- Loading state -->
      <div v-if="genreStore.isLoading" class="loading-state flex flex-center q-pa-xl">
        <div class="loading-content text-center">
          <div class="loading-emoji">🎬</div>
          <q-spinner-dots color="purple-4" size="50px" class="q-my-md" />
          <div class="text-h6 text-grey-4">{{ t('genres.loadingGenres') }}</div>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="genreStore.error" class="error-state flex flex-center q-pa-xl">
        <q-banner class="error-banner" rounded>
          <div class="flex items-center">
            <span class="error-emoji">⚠️</span>
            <span>{{ genreStore.error }}</span>
          </div>
          <template v-slot:action>
            <q-btn
              flat
              :label="t('common.retry')"
              color="purple-4"
              @click="genreStore.fetchGenres"
            />
          </template>
        </q-banner>
      </div>

      <!-- Genre grid -->
      <q-card-section
        class="genre-grid-section q-pt-none"
        style="max-height: 55vh; overflow-y: auto"
      >
        <div class="genre-grid">
          <q-card
            v-for="genre in filteredGenres"
            :key="genre.id"
            flat
            bordered
            clickable
            :class="[
              'genre-card',
              selectedGenres.includes(genre.id) ? 'genre-selected' : 'genre-unselected',
            ]"
            @click="toggleGenre(genre)"
          >
            <q-card-section class="genre-card-content q-pa-md">
              <div class="genre-emoji">{{ getGenreEmoji(genre.slug) }}</div>
              <div class="genre-name text-weight-bold">{{ genre.name }}</div>
              <div class="genre-count">
                <q-icon name="movie" size="12px" class="q-mr-xs" />
                {{ genre.posts_count }}
              </div>
              <div v-if="selectedGenres.includes(genre.id)" class="selected-overlay">
                <q-icon name="check_circle" size="32px" class="check-icon" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <!-- Selected genres summary -->
      <q-card-section
        v-if="selectedGenres.length > 0 || isAtMaxLimit"
        class="selected-section q-pt-sm"
      >
        <div class="selected-header text-subtitle1 text-weight-bold q-mb-sm">
          <span class="selected-emoji">✅</span>
          {{ t('genres.selectedGenres') }}
          <q-badge :color="isAtMaxLimit ? 'red' : 'purple-4'" class="q-ml-sm">
            {{ selectedGenres.length }}/{{ MAX_GENRES }}
          </q-badge>
        </div>

        <!-- Thông báo giới hạn -->
        <div v-if="isAtMaxLimit" class="limit-warning text-caption text-red q-mb-md">
          <q-icon name="warning" class="q-mr-xs" />
          Đã đạt giới hạn tối đa {{ MAX_GENRES }} thể loại. Bỏ chọn bớt để chọn thể loại khác.
        </div>
        <div class="selected-chips row q-gutter-sm">
          <q-chip
            v-for="genreId in selectedGenres"
            :key="genreId"
            removable
            class="selected-chip"
            text-color="white"
            icon="label"
            @remove="removeGenre(genreId)"
          >
            <span class="chip-emoji">{{ getGenreEmoji(getGenreSlug(genreId)) }}</span>
            {{ getGenreName(genreId) }}
          </q-chip>
        </div>
      </q-card-section>

      <!-- Footer actions -->
      <q-card-actions class="footer-actions q-pa-md" align="right">
        <q-btn
          flat
          class="action-btn clear-btn"
          :label="'🗑️ ' + t('common.clearAll')"
          @click="clearAllGenres"
          :disable="selectedGenres.length === 0"
        />
        <q-btn flat class="action-btn cancel-btn" :label="t('common.cancel')" @click="closeModal" />
        <q-btn
          unelevated
          class="action-btn apply-btn"
          :label="'✨ ' + t('common.apply')"
          @click="applyGenres"
          :disable="selectedGenres.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGenreStore } from 'src/stores/site-genre'

const { t } = useI18n()
const router = useRouter()
const $q = useQuasar()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'apply'])

// Store
const genreStore = useGenreStore()

// State
const searchQuery = ref('')
const activeTab = ref('all')
const selectedGenres = ref([])
const MAX_GENRES = 3 // Giới hạn tối đa thể loại được chọn

// Genre emoji mapping
const genreEmojiMap = {
  // Genres
  action: '⚔️',
  adventure: '🗺️',
  comedy: '😂',
  drama: '🎭',
  fantasy: '🧙',
  horror: '👻',
  mystery: '🔍',
  psychological: '🧠',
  romance: '💕',
  'sci-fi': '🚀',
  'slice-of-life': '🌸',
  sports: '⚽',
  supernatural: '✨',
  thriller: '😱',

  // Explicit
  ecchi: '🔥',
  erotica: '💋',
  hentai: '🔞',

  // Themes
  anthropomorphic: '🐾',
  cgdct: '👧',
  childcare: '🍼',
  'combat-sports': '🥊',
  crossdressing: '👗',
  delinquents: '😎',
  detective: '🕵️',
  educational: '📚',
  gag: '🤪',
  gore: '🩸',
  gourmet: '🍜',
  harem: '💐',
  'high-stakes-game': '🎲',
  historical: '🏛️',
  idols: '🎤',
  isekai: '🌌',
  iyashikei: '🍃',
  'love-polygon': '💔',
  'magical-sex-shift': '🔮',
  'mahou-shoujo': '✨',
  'martial-arts': '🥋',
  mecha: '🤖',
  medical: '⚕️',
  military: '🎖️',
  music: '🎵',
  mythology: '🐉',
  organized: '💼',
  otaku: '🎮',
  parody: '😜',
  performing: '🎪',
  pets: '🐕',
  racing: '🏎️',
  reincarnation: '♻️',
  'reverse-harem': '🌹',
  romantic: '❤️',
  samurai: '⚔️',
  school: '🏫',
  showbiz: '🎬',
  space: '🌠',
  strategy: '♟️',
  'super-power': '💪',
  survival: '🏕️',
  'team-sports': '🏀',
  'time-travel': '⏰',
  vampire: '🧛',
  'video-game': '🎮',
  'visual-arts': '🎨',
  workplace: '💼',

  // Demographics
  josei: '👩',
  kids: '👶',
  seinen: '👨',
  shoujo: '👧',
  shounen: '👦',
}

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const filteredGenres = computed(() => {
  let genres = genreStore.genres

  // Filter by tab
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'explicit') {
      genres = genres.filter((g) => g.category === 'explicit_genres')
    } else {
      genres = genres.filter((g) => g.category === activeTab.value)
    }
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    genres = genres.filter((g) => g.name.toLowerCase().includes(query))
  }

  return genres.sort((a, b) => b.posts_count - a.posts_count)
})

// Computed để kiểm tra trạng thái
const isAtMaxLimit = computed(() => selectedGenres.value.length >= MAX_GENRES)

// Methods
const closeModal = () => {
  isOpen.value = false
}

const toggleGenre = (genre) => {
  const wasEmpty = selectedGenres.value.length === 0
  const index = selectedGenres.value.indexOf(genre.id)

  if (index > -1) {
    // Bỏ chọn genre
    selectedGenres.value.splice(index, 1)
  } else {
    // Kiểm tra giới hạn trước khi thêm
    if (selectedGenres.value.length >= MAX_GENRES) {
      $q.notify({
        type: 'warning',
        message: `Chỉ được chọn tối đa ${MAX_GENRES} thể loại`,
        position: 'top',
        timeout: 2000,
      })
      return
    }
    selectedGenres.value.push(genre.id)
  }

  // Nếu vừa chọn genre đầu tiên, scroll xuống footer actions
  if (wasEmpty && selectedGenres.value.length === 1) {
    nextTick(() => {
      scrollToFooterActions()
    })
  }
  // Nếu bỏ chọn hết, không cần scroll
}

const removeGenre = (genreId) => {
  const index = selectedGenres.value.indexOf(genreId)
  if (index > -1) {
    selectedGenres.value.splice(index, 1)
  }
}

const getGenreName = (genreId) => {
  const genre = genreStore.genres.find((g) => g.id === genreId)
  return genre ? genre.name : ''
}

const getGenreSlug = (genreId) => {
  const genre = genreStore.genres.find((g) => g.id === genreId)
  return genre ? genre.slug : ''
}

const getGenreEmoji = (slug) => {
  return genreEmojiMap[slug] || '🎬'
}

const scrollToFooterActions = () => {
  // Delay nhỏ để đảm bảo DOM đã render xong
  setTimeout(() => {
    // Tìm element có class footer-actions trong DOM
    const footerElement = document.querySelector('.footer-actions')
    if (footerElement) {
      footerElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    } else {
      // Dự phòng: scroll xuống cuối modal
      const modalCard = document.querySelector('.modal-card')
      if (modalCard) {
        modalCard.scrollTop = modalCard.scrollHeight
      }
    }
  }, 100)
}

const clearAllGenres = () => {
  selectedGenres.value = []
}

const applyGenres = () => {
  const selectedGenreObjects = genreStore.genres.filter((g) => selectedGenres.value.includes(g.id))

  // Nếu chỉ chọn 1 thể loại → navigate đến route genres với slug
  if (selectedGenres.value.length === 1) {
    const genre = selectedGenreObjects[0]
    router.push({
      name: 'site-genres',
      params: { slug: genre.slug },
    })
  }
  // Nếu chọn từ 2 thể loại trở lên → navigate đến route filter với query
  else if (selectedGenres.value.length >= 2) {
    router.push({
      name: 'site-filter',
      query: { genres: selectedGenres.value.join(',') },
    })
  }

  emit('apply', {
    ids: selectedGenres.value,
    genres: selectedGenreObjects,
  })

  closeModal()
}

// Watch for modal open/close
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Reset state when opening
      searchQuery.value = ''
      activeTab.value = 'all'
      // Load genres if not already loaded
      if (genreStore.genres.length === 0) {
        genreStore.fetchGenres()
      }
    }
  },
)

onMounted(() => {
  // Load genres on component mount
  if (genreStore.genres.length === 0) {
    genreStore.fetchGenres()
  }
})
</script>

<style lang="scss" scoped>
// ========== Dark Mode Variables ==========
$dark-bg: #0f0f1e;
$dark-card-bg: #1a1a2e;
$dark-card-elevated: #252539;
$dark-border: rgba(138, 92, 246, 0.15);
$dark-border-hover: rgba(138, 92, 246, 0.4);
$purple-accent: #a78bfa;
$purple-bright: #c4b5fd;
$gradient-start: #6366f1;
$gradient-end: #8b5cf6;

// ========== Main Card ==========
.dark-mode-modal {
  :deep(.q-dialog__backdrop) {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
  }
}

.modal-card {
  min-height: 92vh;
  background: $dark-bg;
  background-image:
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
  border: 1px solid $dark-border;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

// ========== Header ==========
.modal-header {
  background: linear-gradient(135deg, $gradient-start 0%, $gradient-end 100%);
  color: white;
  border-bottom: 1px solid $dark-border;
  padding: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgba(255,255,255,0.05)"></path></svg>')
      repeat-x;
    background-size: cover;
    opacity: 0.3;
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .header-emoji {
    font-size: 2.5rem;
    margin-right: 12px;
    animation: float 3s ease-in-out infinite;
  }

  .close-btn {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
  }
}

// ========== Search Section ==========
.search-section {
  padding: 0 24px;
  margin-top: 16px;
}

.search-input {
  :deep(.q-field__control) {
    background: $dark-card-elevated;
    border: 1px solid $dark-border;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $dark-border-hover;
    }

    &::before {
      border: none;
    }
  }

  :deep(.q-field__native) {
    color: white;
    font-size: 1rem;
  }
}

// ========== Tabs Section ==========
.tabs-section {
  padding: 0 24px;
  margin-top: 12px;
}

.genre-tabs {
  background: $dark-card-elevated;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid $dark-border;

  :deep(.q-tab) {
    color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    transition: all 0.3s ease;
    min-height: 42px;

    &:hover {
      background: rgba(167, 139, 250, 0.1);
      color: $purple-bright;
    }

    &.q-tab--active {
      background: linear-gradient(135deg, $gradient-start, $gradient-end);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  }

  :deep(.q-tabs__content) {
    gap: 6px;
  }
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-emoji {
  font-size: 1.1rem;
}

// ========== Loading & Error States ==========
.loading-state {
  min-height: 400px;
  color: white;
}

.loading-emoji {
  font-size: 4rem;
  animation: bounce 1.5s ease-in-out infinite;
}

.error-state {
  min-height: 300px;
}

.error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;

  .error-emoji {
    font-size: 1.5rem;
    margin-right: 12px;
  }
}

// ========== Genre Grid ==========
.genre-grid-section {
  padding: 16px 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $dark-card-bg;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, $gradient-start, $gradient-end);
    border-radius: 4px;

    &:hover {
      background: linear-gradient(180deg, $purple-accent, $purple-bright);
    }
  }
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.genre-card {
  position: relative;
  background: $dark-card-elevated;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);

    &::before {
      opacity: 1;
    }
  }
}

.genre-unselected {
  border: 1px solid $dark-border;

  &:hover {
    border-color: $purple-accent;
  }
}

.genre-selected {
  border: 2px solid $purple-accent;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  box-shadow:
    0 8px 32px rgba(99, 102, 241, 0.4),
    inset 0 0 20px rgba(167, 139, 250, 0.1);

  &::before {
    opacity: 1;
  }
}

.genre-card-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.genre-emoji {
  font-size: 2.5rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

.genre-name {
  font-size: 0.95rem;
  color: white;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.genre-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.selected-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease;

  .check-icon {
    color: white;
    filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.6));
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

// ========== Selected Section ==========
.selected-section {
  padding: 16px 24px;
  background: rgba(167, 139, 250, 0.05);
  border-top: 1px solid $dark-border;
  border-bottom: 1px solid $dark-border;
}

.selected-header {
  color: white;
  display: flex;
  align-items: center;
}

.selected-emoji {
  font-size: 1.3rem;
  margin-right: 8px;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
}

.selected-chip {
  background: linear-gradient(135deg, $gradient-start, $gradient-end);
  border: 1px solid $purple-accent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  }

  .chip-emoji {
    margin-right: 4px;
    font-size: 1.1rem;
  }

  :deep(.q-icon) {
    color: white;
  }
}

// ========== Footer Actions ==========
.footer-actions {
  background: $dark-card-elevated;
  border-top: 1px solid $dark-border;
  padding: 20px 24px;
  gap: 12px;
  scroll-margin-top: 20px; // Để có khoảng cách khi scroll tới
}

.action-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 10px;
  padding: 10px 24px;
  text-transform: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.clear-btn {
  color: #f87171;

  &:hover:not(:disabled) {
    background: rgba(248, 113, 113, 0.1);
  }

  &:disabled {
    opacity: 0.3;
  }
}

.cancel-btn {
  color: rgba(255, 255, 255, 0.7);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }
}

.apply-btn {
  background: linear-gradient(135deg, $gradient-start, $gradient-end);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  }

  &:disabled {
    background: rgba(99, 102, 241, 0.3);
    box-shadow: none;
  }
}

// ========== Animations ==========
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
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

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

// ========== Responsive Design ==========
@media (max-width: 1024px) {
  .genre-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .genre-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .modal-card {
    min-height: 100vh;
  }

  .modal-header {
    padding: 20px;

    .header-emoji {
      font-size: 2rem;
    }
  }

  .genre-emoji {
    font-size: 2rem;
  }

  .tab-emoji {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .genre-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
  }

  .genre-name {
    font-size: 0.85rem;
  }

  .genre-emoji {
    font-size: 1.8rem;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  .selected-section {
    padding: 12px 16px;
  }
}

// Giới hạn warning
.limit-warning {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .q-icon {
    color: #ef4444;
    font-size: 1.1rem;
  }
}
</style>
