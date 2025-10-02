<template>
  <q-page class="watch-page" :class="{ 'cinema-mode': isCinemaMode }">
    <!-- Cinema mode overlay -->
    <div v-if="isCinemaMode" class="cinema-overlay"></div>

    <div
      class="page-container q-mx-auto q-px-lg"
      :class="{ 'cinema-content': isCinemaMode }"
      :style="isCinemaMode ? 'max-width: 100%; width: 100%' : 'max-width: 1600px; width: 100%'"
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
            class="col-12 col-md-4 col-lg-2 episode-list-column episode-list-wrapper"
            :class="{ 'cinema-dimmable': isCinemaMode }"
          >
            <EpisodeList
              :episodes="episodes"
              :active-episode-id="episode?.id || null"
              :slug="slug"
              :last-watched-id="lastWatchedEpisodeId"
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

            <div class="q-mt-md">
              <EpisodeNavigation
                :prev="episode?.prev_episode || null"
                :next="episode?.next_episode || null"
                :slug="slug"
              />
            </div>
          </div>

          <!-- Right: Anime Info (hidden when expanded) -->
          <div
            v-if="!isExpanded"
            class="col-12 col-lg-3 anime-info-column"
            :class="{ 'cinema-dimmable': isCinemaMode }"
          >
            <q-card flat bordered v-if="episode?.anime" class="anime-info-card">
              <q-img
                :src="episode.anime.thumbnail || episode.anime.poster || '/favicon.ico'"
                :ratio="3 / 4"
                fit="cover"
              >
                <div class="absolute-bottom text-subtitle2 text-center">
                  {{ episode.anime.title }}
                </div>
              </q-img>
              <q-card-section>
                <div class="text-caption text-grey">
                  {{ episode.title || 'Episode ' + (episode.number || '') }}
                </div>
              </q-card-section>
            </q-card>
            <TopRight />
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
import { useMeta, Notify } from 'quasar'
import TopTen from 'src/components/side-bar/TopTen.vue'
import TopRight from 'src/components/watch-anime/TopRight.vue'
import {
  useWatchPageDataSingleEpisode,
  useWatchPageDataListEpisodes,
} from 'src/composables/watch-anime/useWatchPageData'

// Lazy local components (will create shortly in components/watch-anime)
import BreadcrumbNavigation from 'src/components/watch-anime/BreadcrumbNavigation.vue'
import WatchPlayer from 'src/components/watch-anime/WatchPlayer.vue'
// import PlayerControls from 'src/components/watch-anime/PlayerControls.vue'
import EpisodeList from 'src/components/watch-anime/EpisodeList.vue'
import EpisodeNavigation from 'src/components/watch-anime/EpisodeNavigation.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

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
const postIdString = computed(() => String(postId.value || ''))

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
const episodes = computed(() => listEpisodesData?.value || [])

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
const watchProgress = ref({})
const progressLoaded = ref(false)

const WATCH_PROGRESS_KEY = 'watch-progress-v1'

const progressKey = computed(() => {
  const animeId = episode.value?.anime?.id
  if (animeId) return `anime-${animeId}`
  if (slug.value) return `slug-${slug.value}`
  return null
})

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
  isInWatchlist.value = !isInWatchlist.value
  // TODO: Implement actual API call to save/remove from watchlist
  Notify.create({
    message: isInWatchlist.value
      ? t('watch.addedToWatchlist', 'Added to watchlist')
      : t('watch.removedFromWatchlist', 'Removed from watchlist'),
    color: isInWatchlist.value ? 'positive' : 'info',
    position: 'top',
    timeout: 2000,
  })
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
  background: radial-gradient(circle at top, #1b1f3a 0%, #0f1223 60%, #060713 100%);
  color: #e4e8ff;
}

/* Cinema Mode */
.watch-page.cinema-mode {
  background-color: #000;
  position: relative;
}

.watch-page.cinema-mode .page-container {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.page-container {
  background: rgba(12, 14, 28, 0.7);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(3, 5, 15, 0.8);
}

.cinema-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  pointer-events: none;
}

.cinema-content {
  position: relative;
  z-index: 1001;
}

.cinema-player-highlight {
  position: relative;
  z-index: 1002;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.cinema-player-highlight :deep(.watch-player),
.cinema-player-highlight :deep(.watch-player iframe) {
  border-radius: 12px;
  overflow: hidden;
}

.cinema-dimmable {
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;
}

.watch-page.cinema-mode .cinema-dimmable {
  opacity: 0.2;
  filter: blur(1px);
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
/* Episode List (33%) | Player (67%) on same row, Anime Info below player full width */
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
  }
}

/* Anime info card styling */
.anime-info-card {
  transition: transform 0.2s;
  background: linear-gradient(145deg, rgba(36, 41, 68, 0.9), rgba(23, 25, 44, 0.95));
  border: 1px solid rgba(125, 133, 190, 0.3);
}

.anime-info-card:hover {
  transform: translateY(-2px);
}

/* Episode list wrapper - match height with player column */
.episode-list-wrapper {
  max-height: 800px;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(160deg, rgba(28, 32, 58, 0.9), rgba(20, 23, 45, 0.95));
  border: 1px solid rgba(120, 130, 200, 0.25);
  border-radius: 12px;
  margin-top: 15px;
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

/* Match episode list height with player on desktop */
@media (min-width: 1024px) {
  .episode-list-wrapper {
    position: sticky;
    top: 20px;
    align-self: flex-start;
  }
}

/* On mobile, remove height restriction */
@media (max-width: 767px) {
  .episode-list-wrapper {
    max-height: none;
    overflow: visible;
  }
}
</style>
