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
                      size="sm"
                      dense
                      class="position-badge"
                    >
                      #{{ post.position }}
                    </q-chip>

                    <!-- Type Badge -->
                    <q-chip
                      :color="getTypeColor(post.type)"
                      text-color="white"
                      size="sm"
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
  margin: 20px 0;
}

.anime-groups-card {
  border-radius: 12px;
  overflow: hidden;
}

.groups-header {
  background: linear-gradient(135deg, #1e1f25 0%, #2a2c34 100%);
  border-bottom: 1px solid #2f323a;
}

.groups-title {
  color: #90caf9;
}

.groups-subtitle {
  font-size: 0.875rem;
  color: #b0bec5;
}

.anime-group {
  &:not(:last-child) {
    border-bottom: 2px solid #2f323a;
    padding-bottom: 24px;
  }
}

.group-header {
  padding: 0 4px;
}

.group-name {
  color: #e0e0e0;
}

.group-description {
  font-size: 0.875rem;
  color: #b0bec5;
}

.posts-grid {
  .posts-flex-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    /* Căn giữa khi ít items */

    /* Căn trái khi có nhiều items (3+ items) */
    &.justify-start {
      justify-content: flex-start;
    }

    /* Căn giữa đẹp hơn khi có 1-2 items */
    &.justify-center {
      justify-content: center;
    }
  }
}

.post-item {
  flex: 1 1 calc(50% - 6px);
  /* Tối thiểu 2 cột, trừ gap */
  min-width: 140px;
  max-width: 200px;

  /* Tối ưu cho single item */
  &.single-item {
    flex: 0 0 auto;
    max-width: 280px;
    min-width: 220px;

    .grid-card {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
      }
    }
  }

  /* Tối ưu cho 2 items */
  &.two-items {
    flex: 0 0 auto;
    max-width: 240px;
    min-width: 180px;

    .grid-card {
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.grid-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #2b2d35;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);

    .poster-overlay {
      opacity: 1;
    }
  }

  &.current-anime {
    border: 1px solid rgba(25, 118, 210, 0.5);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.14) inset;
  }
}

.card-header {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.position-badge {
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.55) !important;
  font-size: 0.68rem;
  min-height: 16px;
}

.type-badge {
  backdrop-filter: blur(6px);
  font-size: 0.68rem;
  min-height: 16px;
}

.poster-container {
  position: relative;
  flex-shrink: 0;
}

.poster-image {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 8px 8px 0 0;
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px 8px 0 0;
}

.play-button {
  transform: scale(0.72);
  transition: transform 0.25s ease;

  &:hover {
    transform: scale(0.78);
  }
}

.current-indicator {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(144, 202, 249, 0.9);
  backdrop-filter: blur(10px);
  padding: 2px 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-size: 0.7rem;
}

.card-content {
  flex-grow: 1;
  padding: 12px 8px;
}

.post-title {
  color: #e0e0e0;
  line-height: 1.25;
  font-size: 0.82rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.post-note {
  line-height: 1.3;
  font-size: 0.72rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #b0bec5;
}

.watch-order-info {
  margin-top: auto;

  .q-linear-progress {
    height: 3px;
  }

  .text-caption {
    font-size: 0.65rem;
  }
}

.card-actions {
  padding: 6px 8px 8px;
  margin-top: auto;
}

.card-actions .q-btn {
  font-size: 0.7rem;
  min-height: 24px;
}

// Responsive Design với Flexbox
@media (max-width: 599px) {
  .anime-groups-container {
    margin: 16px 0;
  }

  .groups-header {
    padding: 16px;
  }

  .groups-title {
    font-size: 1.2rem;
  }

  .anime-group {
    margin-bottom: 24px !important;

    &:not(:last-child) {
      padding-bottom: 16px;
    }
  }

  .posts-flex-container {
    gap: 8px;

    &.justify-center {
      justify-content: center;
    }
  }

  .post-item {
    flex: 1 1 calc(50% - 4px);
    /* 2 cột trên mobile */
    min-width: 150px;
    max-width: 170px;

    &.single-item {
      flex: 0 0 auto;
      max-width: 200px;
      min-width: 160px;
    }

    &.two-items {
      flex: 0 0 auto;
      max-width: 180px;
      min-width: 160px;
    }
  }

  .card-content {
    padding: 8px 6px;
  }

  .post-title {
    font-size: 0.8rem;
  }

  .post-note {
    font-size: 0.7rem;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .post-item {
    flex: 1 1 calc(33.333% - 8px);
    /* 3 cột trên tablet nhỏ */
    min-width: 140px;
    max-width: 180px;

    &.single-item {
      flex: 0 0 auto;
      max-width: 300px;
      min-width: 240px;
    }

    &.two-items {
      flex: 0 0 auto;
      max-width: 240px;
      min-width: 200px;
    }
  }
}

@media (min-width: 960px) and (max-width: 1279px) {
  .post-item {
    flex: 1 1 calc(25% - 9px);
    /* 4 cột trên tablet lớn */
    min-width: 150px;
    max-width: 190px;

    &.single-item {
      flex: 0 0 auto;
      max-width: 350px;
      min-width: 280px;
    }

    &.two-items {
      flex: 0 0 auto;
      max-width: 280px;
      min-width: 220px;
    }
  }
}

@media (min-width: 1280px) and (max-width: 1599px) {
  .post-item {
    flex: 1 1 calc(20% - 9.6px);
    /* 5 cột trên desktop nhỏ */
    min-width: 160px;
    max-width: 200px;
  }
}

@media (min-width: 1600px) and (max-width: 1919px) {
  .post-item {
    flex: 1 1 calc(16.666% - 10px);
    /* 6 cột trên desktop trung */
    min-width: 170px;
    max-width: 210px;
  }
}

@media (min-width: 1920px) and (max-width: 2399px) {
  .post-item {
    flex: 1 1 calc(14.286% - 10.3px);
    /* 7 cột trên desktop lớn */
    min-width: 180px;
    max-width: 220px;
  }
}

@media (min-width: 2400px) {
  .post-item {
    flex: 1 1 calc(12.5% - 10.5px);
    /* 8 cột trên ultra wide */
    min-width: 190px;
    max-width: 240px;
  }
}

// Dark mode support
.body--dark {
  .groups-header {
    background: linear-gradient(135deg, #263238 0%, #37474f 100%);
    border-bottom-color: #424242;
  }

  .groups-title {
    color: #64b5f6;
  }

  .group-header {
    background-color: transparent;
  }

  .group-name {
    color: #e0e0e0;
  }

  .anime-group {
    &:not(:last-child) {
      border-bottom-color: #424242;
    }
  }

  .grid-card {
    background-color: #424242;

    &.current-anime {
      border-color: #64b5f6;
      box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
    }
  }

  .post-title {
    color: #e0e0e0;
  }

  .current-indicator {
    background: rgba(100, 181, 246, 0.9);
  }
}
</style>
