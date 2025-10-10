<template>
  <div class="anime-groups-container" v-if="animeGroups && animeGroups.length > 0">
    <q-card class="anime-groups-card shadow-2" dark>
      <q-card-section class="groups-header">
        <div class="row items-center justify-between">
          <div class="col">
            <h5 class="groups-title text-h5 text-bold q-ma-none">
              <q-icon name="video_library" class="q-mr-sm" color="primary" />
              {{ $t('animeInfo.relatedSeries') }}
            </h5>
            <p class="groups-subtitle text-grey-6 q-ma-none q-mt-xs">
              {{ $t('animeInfo.relatedSeriesDescription') }}
            </p>
          </div>
          <div class="col-auto">
            <q-chip
              outline
              color="primary"
              text-color="primary"
              size="sm"
              icon="collections"
              :label="`${animeGroups.length} ${animeGroups.length > 1 ? 'groups' : 'group'}`"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="groups-content">
        <div v-for="group in sortedAnimeGroups" :key="group.id" class="anime-group q-mb-xl">
          <!-- Group Header -->
          <div class="group-header q-mb-md">
            <div class="row items-center justify-between">
              <div class="col">
                <h6 class="group-name text-h6 text-bold q-ma-none">
                  {{ group.name }}
                </h6>
                <p v-if="group.description" class="group-description text-grey-6 q-ma-none q-mt-xs">
                  {{ group.description }}
                </p>
              </div>
              <div class="col-auto">
                <q-chip
                  outline
                  color="primary"
                  text-color="primary"
                  size="sm"
                  :label="`${group.posts.length} ${group.posts.length > 1 ? 'series' : 'series'}`"
                />
                <q-chip
                  v-if="group.posts.length <= 2"
                  outline
                  color="secondary"
                  text-color="secondary"
                  size="sm"
                  icon="star"
                  class="q-ml-xs"
                >
                  {{ group.posts.length === 1 ? 'Standalone' : 'Mini Series' }}
                </q-chip>
              </div>
            </div>
          </div>

          <!-- Group Posts - Card Grid -->
          <div class="posts-grid">
            <div class="posts-flex-container" :class="getContainerJustifyClass(group.posts.length)">
              <div
                v-for="post in group.posts"
                :key="post.id"
                class="post-item"
                :class="getItemSizeClass(group.posts.length)"
              >
                <q-card
                  class="grid-card cursor-pointer full-height"
                  @click="navigateToAnime(post)"
                  :class="{ 'current-anime': isCurrentAnime(post.id) }"
                >
                  <!-- Card Header with Position Badge -->
                  <div class="card-header">
                    <q-chip
                      :color="getPositionColor(post.position)"
                      text-color="white"
                      size="xl"
                      dense
                      class="position-badge"
                    >
                      #{{ post.position }}
                    </q-chip>

                    <!-- Type Badge -->
                    <q-chip
                      :color="getTypeColor(post.type)"
                      text-color="white"
                      size="md"
                      dense
                      class="type-badge"
                    >
                      {{ post.type }}
                    </q-chip>
                  </div>

                  <!-- Poster Image -->
                  <div class="poster-container">
                    <q-img
                      :src="getImageUrl(post)"
                      :alt="post.title"
                      class="poster-image"
                      ratio="3/4"
                      spinner-color="primary"
                      loading="lazy"
                      fit="cover"
                    >
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                          <div class="text-center">
                            <q-icon name="image" size="40px" />
                            <div class="text-caption q-mt-xs">No Image</div>
                          </div>
                        </div>
                      </template>

                      <!-- Overlay on hover -->
                      <div class="poster-overlay">
                        <q-btn
                          round
                          color="white"
                          text-color="primary"
                          icon="play_arrow"
                          size="lg"
                          class="play-button"
                          @click.stop="navigateToAnime(post)"
                        />
                      </div>
                    </q-img>

                    <!-- Current anime indicator -->
                    <div v-if="isCurrentAnime(post.id)" class="current-indicator">
                      <q-icon name="visibility" color="white" size="sm" />
                      <span class="text-caption text-white q-ml-xs">Đang xem</span>
                    </div>
                  </div>

                  <!-- Card Content -->
                  <q-card-section class="card-content">
                    <!-- Title -->
                    <h6 class="post-title text-subtitle1 text-bold q-ma-none">
                      {{ post.title }}
                    </h6>

                    <!-- Note/Description -->
                    <p
                      v-if="post.note"
                      class="post-note text-caption text-grey-6 q-ma-none q-mt-xs"
                    >
                      {{ post.note }}
                    </p>

                    <!-- Watch Order Info -->
                    <div class="watch-order-info q-mt-sm" v-if="group.posts.length > 1">
                      <q-linear-progress
                        :value="post.position / group.posts.length"
                        color="primary"
                        size="3px"
                        rounded
                        class="q-mb-xs"
                      />
                      <div class="text-caption text-grey-6">
                        {{ $t('animeInfo.watchOrder') }}: {{ post.position }} /
                        {{ group.posts.length }}
                      </div>
                    </div>
                  </q-card-section>

                  <!-- Card Actions -->
                  <q-card-actions class="card-actions">
                    <q-btn
                      color="primary"
                      :label="$t('animeInfo.viewDetails')"
                      size="sm"
                      dense
                      no-caps
                      class="full-width"
                      @click.stop="navigateToAnime(post)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
/* i18n available globally in template */

const props = defineProps({
  animeGroups: {
    type: Array,
    default: () => [],
  },
  currentAnimeId: {
    type: [String, Number],
    default: null,
  },
})

const router = useRouter()
/* no local i18n usage in script */

// Methods
const navigateToAnime = (post) => {
  if (post.link) {
    router.push(`${post.link}`)
  }
}

const getImageUrl = (post) => {
  return post.poster || post.image || '/images/placeholder-anime.jpg'
}

const getPositionColor = (position) => {
  if (position === 1) return 'green'
  if (position === 2) return 'blue'
  if (position === 3) return 'orange'
  if (position === 4) return 'purple'
  return 'blue-grey'
}

const getTypeColor = (type) => {
  const typeColors = {
    TV: 'blue',
    Movie: 'purple',
    OVA: 'orange',
    ONA: 'teal',
    Special: 'pink',
    Music: 'indigo',
  }
  return typeColors[type] || 'grey'
}

const isCurrentAnime = (animeId) => {
  return props.currentAnimeId && props.currentAnimeId.toString() === animeId.toString()
}

// Layout optimization methods
const getContainerJustifyClass = (itemCount) => {
  if (itemCount <= 2) return 'justify-center'
  return 'justify-start'
}

const getItemSizeClass = (itemCount) => {
  if (itemCount === 1) return 'single-item'
  if (itemCount === 2) return 'two-items'
  return ''
}

// Computed
const sortedAnimeGroups = computed(() => {
  return props.animeGroups.map((group) => ({
    ...group,
    posts: [...group.posts].sort((a, b) => a.position - b.position),
  }))
})
</script>

<style lang="scss" scoped>
.anime-groups-container {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
}

.anime-groups-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  overflow: hidden;
}

.groups-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.groups-title {
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 1.5rem;
  line-height: 1.4;
}

.groups-subtitle {
  font-size: 0.875rem;
  margin-top: 4px;
}

.groups-content {
  padding: 24px;
}

.anime-group {
  margin-bottom: 48px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-header {
  margin-bottom: 24px;
}

.group-name {
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1.4;
}

.group-description {
  font-size: 0.875rem;
  margin-top: 4px;
}

// Posts Grid Layout - Responsive 8 columns to 2 columns
.posts-grid {
  width: 100%;
}

.posts-flex-container {
  display: grid;
  gap: 16px;

  // Desktop: 8 columns max
  @media (min-width: 1920px) {
    grid-template-columns: repeat(8, 1fr);
  }

  // Large desktop: 6 columns
  @media (min-width: 1600px) and (max-width: 1919px) {
    grid-template-columns: repeat(6, 1fr);
  }

  // Medium desktop: 5 columns
  @media (min-width: 1400px) and (max-width: 1599px) {
    grid-template-columns: repeat(5, 1fr);
  }

  // Desktop: 4 columns
  @media (min-width: 1024px) and (max-width: 1399px) {
    grid-template-columns: repeat(4, 1fr);
  }

  // Tablet landscape: 3 columns
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // Tablet portrait: 2 columns
  @media (min-width: 480px) and (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Mobile: 2 columns
  @media (max-width: 479px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

// Post item với tỷ lệ 3:4
.post-item {
  width: 100%;
  aspect-ratio: 3 / 4;
  position: relative;
}

// Card Styles - absolute fill parent
.grid-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, #2a2a3e 0%, #1f1f2e 100%);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border-color: rgba(var(--q-primary-rgb), 0.5);

    .poster-overlay {
      opacity: 1;
    }
  }

  &.current-anime {
    border-color: var(--q-primary);
    box-shadow: 0 0 20px rgba(var(--q-primary-rgb), 0.3);
  }
}

// Poster container - chiếm 55% chiều cao của card
.poster-container {
  position: relative;
  width: 100%;
  height: 55%;
  background: #1a1a2e;
  overflow: hidden;
  flex-shrink: 0;
}

// FIX: Override Quasar's absolute positioning
.poster-image {
  display: block;
  width: 100%;
  height: 100%;
  position: relative !important;

  :deep(.q-img__container) {
    position: relative !important;
    width: 100%;
    height: 100%;
  }

  :deep(.q-img__image) {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center; // Hiển thị phần trên của ảnh
  }

  :deep(.q-img__content) {
    position: absolute !important;
  }
}

// Card header - absolute so với poster-container
.card-header {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  pointer-events: none;

  .q-chip {
    pointer-events: auto;
  }
}

.position-badge,
.type-badge {
  font-weight: 600;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

// Overlay - sẽ nằm trong q-img__content
.poster-overlay {
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 5;
  width: 100%;
  height: 100%;
}

.play-button {
  transform: scale(0.8);
  transition: transform 0.3s ease;

  .grid-card:hover & {
    transform: scale(1);
  }
}

// Current indicator - absolute so với poster-container
.current-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 6px 10px;
  display: flex;
  align-items: center;
  z-index: 11;
}

// Card content - chiếm phần còn lại
.card-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #2a2a3e 0%, #1f1f2e 100%);
  overflow: hidden;
  min-height: 0;
}

.post-title {
  color: #ffffff;
  font-size: 0.875rem;
  line-height: 1.3;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.post-note {
  font-size: 0.75rem;
  line-height: 1.3;
  color: #b0b0b0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.watch-order-info {
  margin-top: auto;
  padding-top: 6px;
}

// Card actions - compact
.card-actions {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

// Mobile optimizations
@media (max-width: 479px) {
  .anime-groups-container {
    padding: 12px;
  }

  .groups-content {
    padding: 16px;
  }

  .anime-group {
    margin-bottom: 32px;
  }

  .group-name {
    font-size: 1.1rem;
  }

  .poster-container {
    height: 60%; // Tăng tỷ lệ ảnh trên mobile
  }

  .post-title {
    font-size: 0.8rem;
    -webkit-line-clamp: 2;
  }

  .post-note {
    font-size: 0.7rem;
    -webkit-line-clamp: 1;
  }

  .card-header {
    top: 6px;
    left: 6px;
    right: 6px;
    gap: 4px;
  }

  .position-badge,
  .type-badge {
    font-size: 0.65rem;
    height: 18px;
    padding: 0 6px;
  }

  .card-content {
    padding: 10px;
  }

  .card-actions {
    padding: 6px 10px;

    .q-btn {
      font-size: 0.7rem;
      padding: 4px 8px;
    }
  }

  .current-indicator {
    padding: 4px 8px;

    .q-icon {
      font-size: 14px;
    }

    .text-caption {
      font-size: 0.65rem;
    }
  }
}

// Tablet optimizations
@media (min-width: 480px) and (max-width: 1023px) {
  .groups-content {
    padding: 20px;
  }

  .poster-container {
    height: 58%;
  }

  .post-title {
    font-size: 0.85rem;
  }

  .post-note {
    font-size: 0.75rem;
  }
}

// Desktop optimizations
@media (min-width: 1024px) {
  .poster-container {
    height: 55%;
  }
}
</style>
