<template>
  <q-page :class="[pagePadding, 'flex-center', { 'cinema-mode': isCinemaMode }]">
    <!-- Cinema mode overlay -->
    <div v-if="isCinemaMode" class="cinema-overlay"></div>

    <div
      class="page-container q-mx-auto"
      :class="{ 'cinema-content': isCinemaMode }"
      :style="isCinemaMode ? 'max-width: 100%; width: 100%' : 'max-width: 1920px; width: 100%'"
    >
      <div v-if="isLoading" class="full-height flex flex-center column">
        <q-spinner size="50px" color="primary" />
        <div class="q-mt-md">{{ t('common.loading') }}</div>
      </div>

      <div v-else-if="hasError" class="full-height flex flex-center column">
        <q-icon name="error" size="50px" color="negative" />
        <div class="q-mt-md">{{ t('common.error') }}</div>
      </div>

      <div v-else>
        <!-- Breadcrumb full width -->
        <div :class="{ 'cinema-dimmable': isCinemaMode }">
          <BreadcrumbNavigation
            v-if="episode"
            :anime="episode?.anime || null"
            :episode="episode"
            :slug="slug"
          />
        </div>

        <!-- 3-column responsive layout -->
        <div class="row q-col-gutter-md q-mt-sm watch-content">
          <!-- Left: Episode List (col-2 on desktop, col-4 on tablet, full on mobile) -->
          <div
            class="col-12 col-md-4 col-lg-3 episode-list-column episode-list-wrapper"
            :class="{ 'cinema-dimmable': isCinemaMode }"
          >
            <EpisodeList
              :episodes="episodes"
              :active-episode-id="episode?.id || null"
              :slug="slug"
              :last-watched-id="lastWatchedEpisodeId"
              :watched-episode-ids="watchedEpisodeIds"
            />
          </div>

          <!-- Center: Player + Controls + Navigation (col-6 or col-9 when expanded) -->
          <div
            :class="isExpanded ? 'col-12 col-md-8 col-lg-9' : 'col-12 col-md-8 col-lg-7'"
            class="player-column"
          >
            <div :class="{ 'cinema-player-highlight': isCinemaMode }">
              <WatchPlayer
                v-if="episode"
                :episode="episode"
                :has-prev="!!episode?.prev_episode"
                :has-next="!!episode?.next_episode"
                :is-expanded="isExpanded"
                :is-cinema-mode="isCinemaMode"
                :auto-play="autoPlay"
                :auto-next="autoNext"
                :auto-skip-intro="autoSkipIntro"
                :is-in-watchlist="isInWatchlist"
                @go-prev="goToPrev"
                @go-next="goToNext"
                @toggle-expand="isExpanded = !isExpanded"
                @toggle-cinema="isCinemaMode = !isCinemaMode"
                @toggle-auto-play="autoPlay = !autoPlay"
                @toggle-auto-next="autoNext = !autoNext"
                @toggle-auto-skip-intro="autoSkipIntro = !autoSkipIntro"
                @toggle-watchlist="toggleWatchlist"
              />
            </div>

            <!-- <div class="q-mt-md">
              <EpisodeNavigation :prev="episode?.prev_episode || null" :next="episode?.next_episode || null"
                :slug="slug" />
            </div> -->
          </div>

          <!-- Right: Anime Info (hidden when expanded) -->
          <div
            v-if="!isExpanded"
            class="col-12 col-md-12 col-lg-2 anime-info-column"
            :class="{ 'cinema-dimmable': isCinemaMode }"
          >
            <q-card flat bordered v-if="episode?.anime" class="anime-info-card compact-design">
              <!-- Compact Header with Small Poster -->
              <div class="anime-header">
                <div class="anime-poster-small">
                  <q-img
                    :src="episode.anime.thumbnail || episode.anime.poster || '/favicon.ico'"
                    :ratio="3 / 4"
                    fit="cover"
                    class="small-poster"
                  />
                </div>
                <div class="anime-header-info">
                  <div class="anime-title-compact">
                    {{ episode.anime.title }}
                  </div>
                  <div class="anime-meta">
                    <q-badge
                      v-if="episode.anime.status"
                      :color="episode.anime.status === 'Ongoing' ? 'positive' : 'info'"
                      :label="episode.anime.status"
                      size="xs"
                    />
                    <span v-if="episode.anime.type" class="anime-type-compact">
                      {{ episode.anime.type }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Compact Details -->
              <q-card-section class="anime-details-compact">
                <!-- Current Episode Info -->
                <div class="current-episode-compact">
                  <q-icon name="play_circle" size="14px" class="q-mr-xs" color="primary" />
                  <span class="text-caption text-grey-6"
                    >{{ $t('watch.currentEpisode', 'Current Episode') }}:</span
                  >
                  <span class="text-body2 text-weight-medium q-ml-xs">
                    {{ episode.title || 'Episode ' + (episode.number || '') }}
                  </span>
                </div>

                <!-- Genres Compact -->
                <div
                  class="genres-compact q-mt-sm"
                  v-if="episode.anime.genres && episode.anime.genres.length"
                >
                  <div class="text-caption text-grey-6 q-mb-xs">
                    <q-icon name="category" size="12px" class="q-mr-xs" />
                    {{ $t('animePage.genres', 'Genres') }}
                  </div>
                  <div class="genres-container-compact">
                    <q-chip
                      v-for="genre in episode.anime.genres.slice(0, 3)"
                      :key="genre.id"
                      size="xs"
                      color="primary"
                      text-color="white"
                      class="genre-chip-compact"
                      clickable
                      @click="$router.push(genre.link)"
                    >
                      {{ genre.name }}
                    </q-chip>
                    <q-chip
                      v-if="episode.anime.genres.length > 3"
                      size="xs"
                      outline
                      color="grey-6"
                      class="genre-chip-compact"
                    >
                      +{{ episode.anime.genres.length - 3 }}
                    </q-chip>
                  </div>
                </div>

                <!-- Description Compact -->
                <div class="description-compact q-mt-sm" v-if="episode.anime.description">
                  <div class="text-caption text-grey-6 q-mb-xs">
                    <q-icon name="description" size="12px" class="q-mr-xs" />
                    {{ $t('animePage.description', 'Description') }}
                  </div>
                  <div class="text-body2 anime-description-compact">
                    {{ episode.anime.description }}
                  </div>
                </div>

                <!-- Compact Action Buttons -->
                <div class="action-buttons-compact q-mt-md">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="info"
                    :label="$t('watch.animeInfo', 'Info')"
                    size="sm"
                    class="compact-btn q-mr-xs"
                    @click="$router.push(episode.anime.link)"
                  />
                  <q-btn
                    flat
                    dense
                    :color="isInWatchlist ? 'positive' : 'grey-6'"
                    :icon="isInWatchlist ? 'bookmark' : 'bookmark_border'"
                    :label="isInWatchlist ? $t('watch.saved', 'Saved') : $t('watch.save', 'Save')"
                    size="sm"
                    class="compact-btn"
                    @click="toggleWatchlist"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- Top Right Component -->
            <div class="q-mt-md">
              <TopRight :post-id="postIdString" @reaction-changed="onReactionChanged" />
            </div>
          </div>
        </div>

        <!-- Bottom section: Comments & Features | Sidebar -->
        <div class="row q-col-gutter-md q-mt-lg" :class="{ 'cinema-dimmable': isCinemaMode }">
          <!-- Left: Comments, Recommendations, etc (wider) -->
          <div class="col-12 col-lg-9">
            <!-- Comments Section -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="comment" class="q-mr-sm" />
                  {{ $t('watch.comments') || 'Comments' }}
                </div>
                <div class="text-center q-pa-md text-grey">
                  <q-icon name="chat_bubble_outline" size="40px" />
                  <div class="q-mt-sm">{{ $t('watch.noComments') || 'No comments yet' }}</div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Recommended Section -->
            <q-card flat bordered class="q-mt-md">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="recommend" class="q-mr-sm" />
                  {{ $t('watch.recommended') || 'Recommended for You' }}
                </div>
                <div class="text-center q-pa-md text-grey">
                  <q-icon name="auto_awesome" size="40px" />
                  <div class="q-mt-sm">{{ $t('animePage.comingSoon') || 'Coming soon...' }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Right: Sidebar (TopTen) -->
          <div class="col-12 col-lg-3">
            <TopTen />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta, Notify, useQuasar } from 'quasar'
import TopTen from 'src/components/side-bar/TopTen.vue'
import TopRight from 'src/components/watch-anime/TopRight.vue'
import { api } from 'boot/axios'
import { useAutoWatchStatus } from 'src/composables/crud/useAutoWatchStatus'
import {
  useWatchPageDataSingleEpisode,
  useWatchPageDataListEpisodes,
} from 'src/composables/watch-anime/useWatchPageData'
const $q = useQuasar()

const pagePadding = computed(() => {
  if ($q.screen.lt.sm) return 'q-px-sm'
  if ($q.screen.lt.md) return 'q-px-md'
  return 'q-px-lg'
})

// Lazy local components (will create shortly in components/watch-anime)
import BreadcrumbNavigation from 'src/components/watch-anime/BreadcrumbNavigation.vue'
import WatchPlayer from 'src/components/watch-anime/WatchPlayer.vue'
// import PlayerControls from 'src/components/watch-anime/PlayerControls.vue'
import EpisodeList from 'src/components/watch-anime/EpisodeList.vue'
// import EpisodeNavigation from 'src/components/watch-anime/EpisodeNavigation.vue'
import { useAuth } from 'src/composables/auth/useAuth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const slug = computed(() => route.params.slug)
const episodeNumber = computed(() => route.params.number)
const episodeId = computed(() => route.params.id)

// Derive post id from slug tail if available: {post->slug}-{postId}
const postId = computed(() => {
  const value = slug.value
  if (!value) return null
  const match = String(value).match(/-(\d+)$/)
  return match ? match[1] : null
})

// Convert to string values for API calls
const episodeIdString = computed(() => String(episodeId.value || ''))
const postIdString = computed(() => {
  const pid = postId.value
  // Only return string if postId is valid, otherwise return null to disable query
  return pid ? String(pid) : null
})

const {
  data: singleEpisodeData,
  isLoading: isLoadingEpisode,
  error: errorEpisode,
} = useWatchPageDataSingleEpisode(episodeIdString)
const {
  data: listEpisodesData,
  isLoading: isLoadingList,
  error: errorList,
} = useWatchPageDataListEpisodes(postIdString)

const episode = computed(() => singleEpisodeData?.value || null)
const episodes = computed(() => {
  const data = listEpisodesData?.value
  // API returns { groups: [...] } structure, pass it through to EpisodeList
  return data || { groups: [] }
})

const isLoading = computed(() => isLoadingEpisode.value || isLoadingList.value)
const hasError = computed(() => !!errorEpisode?.value || !!errorList?.value)

// Guard: if route params missing, redirect to home
// Note: Route validation is handled by the router itself

// UI State
const isExpanded = ref(false)
const isCinemaMode = ref(false)
const autoPlay = ref(false)
const autoNext = ref(false)
const autoSkipIntro = ref(false)
const isInWatchlist = ref(false)
const lastWatchedEpisodeId = ref(null)
const watchedEpisodeIds = ref([])
const watchProgress = ref({})
const progressLoaded = ref(false)

const WATCH_PROGRESS_KEY = 'watch-progress-v1'

const progressKey = computed(() => {
  const animeId = episode.value?.anime?.id
  if (animeId) return `anime-${animeId}`
  if (slug.value) return `slug-${slug.value}`
  return null
})

// Create computed ref for anime ID to track watch status
const animeId = computed(() => episode.value?.anime?.id)

// Initialize auto watch status composable at top level
const { syncStatus } = useAutoWatchStatus(api, animeId, user)

onMounted(() => {
  if (!process.env.CLIENT) return
  try {
    const stored = localStorage.getItem(WATCH_PROGRESS_KEY)
    if (stored) {
      watchProgress.value = JSON.parse(stored)
    }
  } catch (err) {
    console.error('Failed to parse watch progress', err)
  } finally {
    progressLoaded.value = true
  }
})

// Load watched episode IDs when progressKey or watchProgress changes
watch(
  () => ({ key: progressKey.value, progress: watchProgress.value, loaded: progressLoaded.value }),
  ({ key, progress, loaded }) => {
    if (!loaded || !key) return
    const entry = progress[key]
    watchedEpisodeIds.value = entry?.watchedEpisodeIds || []
  },
  { immediate: true },
)

watch(
  () => ({
    key: progressKey.value,
    episodeId: episode.value?.id,
    loaded: progressLoaded.value,
  }),
  ({ key, episodeId, loaded }) => {
    if (!loaded || !key || !episodeId || !process.env.CLIENT) return

    const progress = { ...watchProgress.value }
    const entry = { ...(progress[key] || {}) }

    if (entry.currentEpisodeId !== episodeId) {
      if (entry.currentEpisodeId) {
        entry.lastEpisodeId = entry.currentEpisodeId
        entry.lastEpisodeNumber = entry.currentEpisodeNumber
      }
      entry.currentEpisodeId = episodeId
      entry.currentEpisodeNumber =
        episode.value?.number || episode.value?.sort_number || entry.currentEpisodeNumber || null
      entry.currentEpisodeSort = episode.value?.sort_number || entry.currentEpisodeSort || null
    }

    // Track all watched episode IDs (giống visited links)
    if (!entry.watchedEpisodeIds) {
      entry.watchedEpisodeIds = []
    }
    if (!entry.watchedEpisodeIds.includes(episodeId)) {
      entry.watchedEpisodeIds.push(episodeId)
    }

    lastWatchedEpisodeId.value = entry.lastEpisodeId || null
    entry.updatedAt = Date.now()
    progress[key] = entry
    watchProgress.value = progress

    try {
      localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(progress))
    } catch (err) {
      console.error('Failed to save watch progress', err)
    }
  },
  { immediate: true },
)
// Auto-sync watch status when anime changes
let lastAnimeId = null

watch(
  () => episode.value?.anime?.id,
  (newAnimeId) => {
    if (newAnimeId && newAnimeId !== lastAnimeId) {
      syncStatus('continue', { silent: true })
      lastAnimeId = newAnimeId
    }
  },
)

// Navigation functions
function goToPrev() {
  const prev = episode.value?.prev_episode
  if (!prev) return
  const number = prev.number || prev.sort_number || ''
  router.push({ name: 'site-watch', params: { slug: slug.value, number, id: prev.id } })
}

function goToNext() {
  const next = episode.value?.next_episode
  if (!next) return
  const number = next.number || next.sort_number || ''
  router.push({ name: 'site-watch', params: { slug: slug.value, number, id: next.id } })
}

function toggleWatchlist() {
  // Check if user is logged in
  if (!user.value?.id) {
    Notify.create({
      message: t('animeInfo.pleaseLoginFirst', 'Please login first'),
      color: 'warning',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  // Check if anime ID is available
  if (!animeId.value) {
    Notify.create({
      message: t('watch.animeNotAvailable', 'Anime information not available'),
      color: 'warning',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  // Store previous state for rollback if needed
  const previousState = isInWatchlist.value

  // Toggle state optimistically
  isInWatchlist.value = !isInWatchlist.value

  // Determine status based on watchlist state
  // Bật (add to watchlist) → watching
  // Tắt (remove from watchlist) → continue
  const status = isInWatchlist.value ? 'watching' : 'continue'

  // Sync with API using useAutoWatchStatus
  try {
    syncStatus(status, { silent: true })
  } catch (err) {
    // Rollback on error
    isInWatchlist.value = previousState
    console.error('Failed to toggle watchlist:', err)
  }
}

// Handle reaction change events from PostReactions component
function onReactionChanged(data) {
  console.log('Reaction changed in watch page:', data)
  // You can add additional logic here, such as:
  // - Analytics tracking
  // - Updating other UI elements
  // - Showing custom notifications
}

// Meta
const pageTitle = computed(() => {
  if (!episode.value) return t('watch.title', 'Watch')
  const e = episode.value
  const animeTitle = e?.anime?.title || 'Anime'
  return `${animeTitle} - ${e.title || 'Episode ' + (e.number || episodeNumber.value)}`
})

const pageDescription = computed(() => {
  if (!episode.value) {
    return t(
      'watch.pageDescription',
      'Stream anime episodes online with multiple servers and subtitles.',
    )
  }
  const e = episode.value
  const animeTitle = e?.anime?.title || ''
  const episodeTitle = e?.title || `${t('watch.episode', 'Episode')} ${e?.number || ''}`
  const baseDescription =
    e?.description ||
    t(
      'watch.defaultEpisodeDescription',
      'Watch {episodeTitle} of {animeTitle} in high quality with multiple servers.',
      {
        episodeTitle,
        animeTitle,
      },
    )
  return baseDescription
})

const pageKeywords = computed(() => {
  if (!episode.value) return 'anime, watch anime, stream anime'
  const e = episode.value
  const animeTitle = e?.anime?.title || 'anime'
  const episodeTokens = [t('watch.episode', 'episode'), String(e?.number || '')].filter(Boolean)
  return ['anime streaming', animeTitle, episodeTokens.join(' '), 'sub', 'dub', 'watch online']
    .filter(Boolean)
    .join(', ')
})

const ogImage = computed(() => {
  return episode.value?.thumbnail || episode.value?.anime?.thumbnail || '/favicon.ico'
})

const structuredData = computed(() => {
  if (!episode.value) return null

  const e = episode.value
  const anime = e?.anime || {}

  return {
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    name: e.title || `${t('watch.episode', 'Episode')} ${e.number || ''}`,
    episodeNumber: e.number || e.sort_number,
    description:
      e.description ||
      t(
        'watch.defaultEpisodeDescription',
        'Watch {episodeTitle} of {animeTitle} in high quality with multiple servers.',
        {
          episodeTitle: e.title || `${t('watch.episode', 'Episode')} ${e.number || ''}`,
          animeTitle: anime.title || '',
        },
      ),
    image: ogImage.value,
    partOfSeries: {
      '@type': 'TVSeries',
      name: anime.title || '',
      url: anime.link
        ? anime.link.startsWith('http')
          ? anime.link
          : `${process.env.CLIENT ? window.location.origin : ''}${anime.link}`
        : undefined,
    },
    uploadDate: e.released_at || undefined,
    url: process.env.CLIENT ? `${window.location.origin}${route.fullPath}` : route.fullPath,
  }
})

const metaData = computed(() => ({
  title: pageTitle.value,
  meta: {
    description: {
      name: 'description',
      content: pageDescription.value,
    },
    keywords: {
      name: 'keywords',
      content: pageKeywords.value,
    },
    ogTitle: {
      property: 'og:title',
      content: pageTitle.value,
    },
    ogDescription: {
      property: 'og:description',
      content: pageDescription.value,
    },
    ogImage: {
      property: 'og:image',
      content: ogImage.value,
    },
    ogType: {
      property: 'og:type',
      content: 'video.episode',
    },
    twitterCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    twitterTitle: {
      name: 'twitter:title',
      content: pageTitle.value,
    },
    twitterDescription: {
      name: 'twitter:description',
      content: pageDescription.value,
    },
    twitterImage: {
      name: 'twitter:image',
      content: ogImage.value,
    },
  },
  link: {
    canonical: {
      rel: 'canonical',
      href: process.env.CLIENT ? `${window.location.origin}${route.fullPath}` : route.fullPath,
    },
  },
  script: structuredData.value
    ? {
        ldJson: {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(structuredData.value),
        },
      }
    : undefined,
}))

// Use useMeta directly with computed value
useMeta(() => metaData.value)
</script>

<style scoped>
.watch-page {
  min-height: 60vh;
  transition: background-color 0.3s ease;
  background: radial-gradient(circle at top, #1a1a1a 0%, #141414 60%, #0a0a0a 100%);
  color: #e8e8e8;
}

/* Cinema Mode */
.q-page.cinema-mode {
  background-color: #000 !important;
  position: relative;
}

.cinema-mode .page-container {
  padding-left: 0 !important;
  padding-right: 0 !important;
  background: rgba(0, 0, 0, 0.7) !important;
}

.page-container {
  background: rgba(18, 18, 18, 0.5);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.cinema-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.96);
  z-index: 6000;
  pointer-events: none;
  backdrop-filter: blur(3px);
  animation: fadeInOverlay 0.4s ease-in-out;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
}

.cinema-content {
  position: relative;
  z-index: 6001;
}

.cinema-player-highlight {
  position: relative;
  z-index: 6002;
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.9),
    0 0 80px rgba(0, 0, 0, 0.7);
  transition: all 0.4s ease;
}

.cinema-player-highlight :deep(.watch-player) {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.4s ease;
}

.cinema-player-highlight :deep(.watch-player iframe),
.cinema-player-highlight :deep(.jw-player-container) {
  transition: all 0.3s ease;
}

.cinema-dimmable {
  transition:
    opacity 0.4s ease,
    filter 0.4s ease,
    transform 0.3s ease;
}

.q-page.cinema-mode .cinema-dimmable {
  opacity: 0.05;
  filter: blur(3px) brightness(0.2);
  pointer-events: none;
  user-select: none;
}

/* 3-column layout - Desktop (>= 1024px) */
/* Episode List (25%) | Player (50% or 75% when expanded) | Anime Info (25%) */
@media (min-width: 1024px) {
  .watch-content {
    display: flex;
    flex-wrap: wrap;
  }

  .episode-list-column {
    order: 1;
  }

  .player-column {
    order: 2;
    transition:
      flex 0.3s ease,
      max-width 0.3s ease;
  }

  .anime-info-column {
    order: 3;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }
}

/* Tablet (768px - 1023px) */
/* Episode List (33%) | Player (67%) | Anime Info full width below */
@media (min-width: 768px) and (max-width: 1023px) {
  .watch-content {
    display: flex;
    flex-wrap: wrap;
  }

  .episode-list-column {
    order: 1;
    flex: 0 0 33.33%;
    max-width: 33.33%;
  }

  .player-column {
    order: 2;
    flex: 0 0 66.67%;
    max-width: 66.67%;
  }

  .anime-info-column {
    order: 3;
    flex: 0 0 100%;
    max-width: 100%;
    margin-top: 1rem;
    position: static;
    z-index: 0;
  }
}

/* Mobile (< 768px) */
/* Stack vertically: Player → Episode List → Anime Info */
@media (max-width: 767px) {
  .watch-content {
    display: flex;
    flex-direction: column;
  }

  .player-column {
    order: 1;
  }

  .episode-list-column {
    order: 2;
  }

  .anime-info-column {
    order: 3;
    /* Prevent overlapping and ensure proper scroll behavior */
    position: static;
    margin-top: 1rem;
    z-index: 0;
  }
}

/* Anime info card styling */
.anime-info-card {
  transition: transform 0.2s;
  background: linear-gradient(145deg, rgba(22, 22, 22, 0.95), rgba(18, 18, 18, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  position: relative;
}

.anime-info-card:hover {
  transform: translateY(-2px);
}

/* Episode list wrapper - base styles */
.episode-list-wrapper {
  background: linear-gradient(160deg, rgba(20, 20, 20, 0.95), rgba(18, 18, 18, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-top: 15px;
  position: relative;
  overflow-x: hidden;
  z-index: 100;
}

/* Custom scrollbar for episode list */
.episode-list-wrapper::-webkit-scrollbar {
  width: 8px;
}

.episode-list-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.episode-list-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.episode-list-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Firefox scrollbar */
.episode-list-wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
}

/* Episode list responsive styles */
@media (min-width: 768px) {
  .episode-list-wrapper {
    max-height: 800px;
    overflow-y: auto;
  }

  .episode-list-column {
    position: relative;
    z-index: 100;
    isolation: isolate;
    background: transparent;
  }
}

@media (max-width: 767px) {
  .episode-list-wrapper {
    max-height: none;
    overflow: visible;
  }

  /* Disable transforms on mobile */
  .episode-list-wrapper *,
  .episode-list-wrapper *:hover {
    transform: none !important;
  }

  .episode-list-column {
    position: relative;
    z-index: 100;
    isolation: isolate;
    background: transparent;
  }

  .anime-info-column {
    z-index: 1 !important;
  }
}

/* Prevent anime info from being sticky on small screens */
@media (max-width: 1023px) {
  .anime-info-card {
    position: static;
    transform: none !important;
    will-change: auto !important;
  }

  .anime-info-column {
    position: static !important;
    transform: none !important;
  }

  /* Disable all transforms and stacking contexts in anime info */
  .anime-info-column *,
  .anime-info-column *:hover {
    transform: none !important;
  }

  /* Add containment to prevent layout issues */
  .anime-info-card {
    contain: layout style;
  }
}

/* Compact Design */
.compact-design {
  border-radius: 12px;
}

/* Compact Header with Small Poster */
.anime-header {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.anime-poster-small {
  flex-shrink: 0;
  width: 60px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.small-poster {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.small-poster:hover {
  transform: scale(1.1);
}

.anime-header-info {
  flex: 1;
  min-width: 0;
}

.anime-title-compact {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: #e8e8e8;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.anime-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.anime-type-compact {
  font-size: 11px;
  color: rgba(232, 232, 232, 0.8);
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Compact Details */
.anime-details-compact {
  padding: 12px;
}

.current-episode-compact {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid #888;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Compact Genres */
.genres-compact .text-caption {
  font-size: 11px;
  display: flex;
  align-items: center;
}

.genres-container-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.genre-chip-compact {
  font-size: 10px;
  height: 20px;
  transition: transform 0.2s;
}

.genre-chip-compact:hover {
  transform: scale(1.05);
}

/* Compact Description */
.description-compact .text-caption {
  font-size: 11px;
  display: flex;
  align-items: center;
}

.anime-description-compact {
  line-height: 1.4;
  color: rgba(232, 232, 232, 0.9);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

/* Compact Action Buttons */
.action-buttons-compact {
  display: flex;
  gap: 8px;
}

.compact-btn {
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 11px;
  flex: 1;
  min-width: 0;
}

.compact-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.15);
}
</style>
