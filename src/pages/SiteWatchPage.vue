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
          <!-- Left: Episode List (col-3 on desktop, col-4 on tablet, full on mobile) -->
          <div
            class="col-12 col-md-4 col-lg-3 episode-list-column episode-list-wrapper"
            :class="{ 'cinema-dimmable': isCinemaMode }"
          >
            <EpisodeList
              :episodes="episodes"
              :active-episode-id="episode?.id || null"
              :slug="slug"
            />
          </div>

          <!-- Center: Player + Controls + Navigation (col-6 or col-9 when expanded) -->
          <div
            :class="isExpanded ? 'col-12 col-md-8 col-lg-9' : 'col-12 col-md-8 col-lg-6'"
            class="player-column"
          >
            <div :class="{ 'cinema-player-highlight': isCinemaMode }">
              <WatchPlayer v-if="episode" :episode="episode" />
            </div>

            <PlayerControls
              v-if="episode"
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
                  <div class="q-mt-sm">{{ $t('common.comingSoon') || 'Coming soon...' }}</div>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta, Notify } from 'quasar'
import TopTen from 'src/components/side-bar/TopTen.vue'
import {
  useWatchPageDataSingleEpisode,
  useWatchPageDataListEpisodes,
} from 'src/composables/watch-anime/useWatchPageData'

// Lazy local components (will create shortly in components/watch-anime)
import BreadcrumbNavigation from 'src/components/watch-anime/BreadcrumbNavigation.vue'
import WatchPlayer from 'src/components/watch-anime/WatchPlayer.vue'
import PlayerControls from 'src/components/watch-anime/PlayerControls.vue'
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

const metaData = computed(() => ({
  title: pageTitle.value,
}))

// Use useMeta directly with computed value
useMeta(metaData)
</script>

<style scoped>
.watch-page {
  min-height: 60vh;
  transition: background-color 0.3s ease;
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
}

.anime-info-card:hover {
  transform: translateY(-2px);
}

/* Episode list wrapper - match height with player column */
.episode-list-wrapper {
  max-height: 800px;
  overflow-y: auto;
  overflow-x: hidden;
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
