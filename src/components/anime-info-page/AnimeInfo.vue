<template>
  <div class="anime-info-container">
    <!-- Breadcrumb Navigation -->
    <BreadcrumbNavigation v-if="safeAnimeInfo" :animeInfo="safeAnimeInfo" />

    <!-- Hero Section with Background -->
    <div class="hero-section" v-if="safeAnimeInfo">
      <div
        class="hero-background"
        :style="{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }"
      >
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <!-- Mobile optimized layout -->
        <div class="mobile-layout">
          <div class="mobile-header">
            <!-- Compact poster + basic info in one row -->
            <div class="mobile-poster-section">
              <q-card class="mobile-poster-card">
                <q-img
                  :src="imageUrl"
                  :alt="animeInfo.title"
                  class="mobile-poster-image"
                  spinner-color="primary"
                  loading="lazy"
                  @error="onImageError"
                  fit="cover"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                      <q-icon name="image" size="30px" />
                    </div>
                  </template>
                </q-img>
                <div class="mobile-rating-badge" :class="getRatingColorClass(animeInfo.score)">
                  <q-icon name="star" size="14px" class="q-mr-xs" />
                  {{ animeInfo.score || 'N/A' }}
                </div>
              </q-card>
            </div>

            <!-- Essential info beside poster -->
            <div class="mobile-info-section">
              <h1 class="mobile-title">{{ animeInfo.title }}</h1>
              <div class="mobile-meta">
                <div class="mobile-badges q-mb-sm">
                  <q-chip :color="getStatusColor(animeInfo.status)" text-color="white" size="sm">
                    {{ animeInfo.status }}
                  </q-chip>
                  <q-chip color="blue-grey-6" text-color="white" size="sm" v-if="animeInfo.type">
                    {{ animeInfo.type }}
                  </q-chip>
                  <q-chip color="purple-6" text-color="white" size="sm" v-if="animeInfo.episodes">
                    {{ animeInfo.episodes }} EP
                  </q-chip>
                </div>
                <div
                  class="mobile-badges q-mb-sm"
                  v-if="Array.isArray(animeInfo.genres) && animeInfo.genres.length"
                >
                  <q-chip
                    v-for="(genre, index) in animeInfo.genres"
                    :key="genre.id || genre.mal_id || index"
                    :color="getColorForGenre(index)"
                    text-color="white"
                    clickable
                    @click="navigateToGenre(genre.link || `/genre/${genre.name}`)"
                    class="genre-chip"
                  >
                    {{ genre.name }}
                  </q-chip>
                </div>

                <!-- Quick stats in 2x2 grid -->
                <div class="mobile-quick-stats">
                  <div class="mobile-stat">
                    <div class="stat-value">{{ animeInfo.score || 'N/A' }}</div>
                    <div class="stat-label">Score</div>
                  </div>
                  <div class="mobile-stat">
                    <div class="stat-value">
                      {{ animeInfo.rank ? `#${animeInfo.rank}` : 'N/A' }}
                    </div>
                    <div class="stat-label">Ranked</div>
                  </div>
                  <div class="mobile-stat">
                    <div class="stat-value">{{ animeInfo.popularity || 'N/A' }}</div>
                    <div class="stat-label">Popularity</div>
                  </div>
                  <div class="mobile-stat">
                    <div class="stat-value">
                      {{ animeInfo.views ? formatNumber(animeInfo.views) : 'N/A' }}
                    </div>
                    <div class="stat-label">Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile action buttons -->
          <div class="mobile-actions">
            <q-btn
              color="primary"
              icon="play_arrow"
              :label="t('animeInfo.watchNow')"
              @click="navigateToWatch"
              class="mobile-watch-btn"
            />
            <q-btn color="secondary" icon="playlist_add" outline class="mobile-list-btn">
              <q-menu>
                <q-list>
                  <q-item
                    v-for="listType in watchListTypes"
                    :key="listType.value"
                    clickable
                    @click="addToWatchList(listType.value)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="listType.icon" size="sm" />
                    </q-item-section>
                    <q-item-section>{{ t(listType.label) }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn color="accent" icon="share" outline class="mobile-share-btn">
              <q-menu>
                <q-list>
                  <q-item
                    v-for="platform in sharePlatforms"
                    :key="platform.name"
                    clickable
                    @click="shareOn(platform.name.toLowerCase())"
                  >
                    <q-item-section avatar>
                      <q-icon :name="platform.icon" :color="platform.color" size="sm" />
                    </q-item-section>
                    <q-item-section>{{ platform.name }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>

        <!-- Desktop/Tablet layout (existing) -->
        <div class="desktop-layout">
          <div class="row q-col-gutter-lg">
            <!-- Anime Poster Card -->
            <div class="col-12 col-sm-4 col-md-3">
              <q-card class="poster-card shadow-8">
                <div class="poster-wrapper">
                  <q-img
                    :src="imageUrl"
                    :alt="animeInfo.title"
                    class="poster-image"
                    spinner-color="primary"
                    loading="lazy"
                    @error="onImageError"
                    fit="cover"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                        <div class="text-center">
                          <q-icon name="image" size="50px" />
                          <div>No Image Available</div>
                        </div>
                      </div>
                    </template>
                  </q-img>
                  <div class="rating-badge" :class="getRatingColorClass(animeInfo.score)">
                    <q-icon name="star" class="q-mr-xs" />
                    {{ animeInfo.score || 'N/A' }}
                  </div>
                </div>
              </q-card>
            </div>

            <!-- Main Info Card -->
            <div class="col-12 col-sm-8 col-md-9">
              <q-card class="main-info-card shadow-4" flat>
                <q-card-section>
                  <!-- Title Section -->
                  <div class="title-section q-mb-md">
                    <h1 class="anime-title text-h3 text-bold q-mb-xs">
                      {{ animeInfo.title }}
                    </h1>
                    <div class="title-variants q-mb-sm" v-if="japaneseTitle || synonyms">
                      <div v-if="japaneseTitle" class="japanese-title text-subtitle1 text-grey-6">
                        {{ japaneseTitle }}
                      </div>
                      <div v-if="synonyms" class="synonyms text-caption text-grey-5">
                        {{ t('animeInfo.synonyms') + ': ' + synonyms }}
                      </div>
                    </div>

                    <!-- Status and Type Badges -->
                    <div class="badges-row q-mb-md">
                      <q-chip
                        :color="getStatusColor(animeInfo.status)"
                        text-color="white"
                        icon="radio_button_checked"
                        class="status-chip"
                      >
                        {{ animeInfo.status }}
                      </q-chip>
                      <q-chip
                        color="blue-grey-6"
                        text-color="white"
                        icon="tv"
                        v-if="animeInfo.type"
                      >
                        {{ animeInfo.type }}
                      </q-chip>
                      <div class="episode-chips" v-if="animeInfo.episodes">
                        <q-chip
                          color="purple-6"
                          text-color="white"
                          icon="schedule"
                          v-if="typeof animeInfo.episodes === 'object' && animeInfo.episodes.total"
                        >
                          {{ animeInfo.episodes.total }} Episodes
                        </q-chip>
                        <q-chip
                          color="blue-6"
                          text-color="white"
                          icon="subtitles"
                          v-if="typeof animeInfo.episodes === 'object' && animeInfo.episodes.sub"
                        >
                          {{ animeInfo.episodes.sub }} Sub
                        </q-chip>
                        <q-chip
                          color="orange-6"
                          text-color="white"
                          icon="volume_up"
                          v-if="typeof animeInfo.episodes === 'object' && animeInfo.episodes.dub"
                        >
                          {{ animeInfo.episodes.dub }} Dub
                        </q-chip>
                        <q-chip
                          color="purple-6"
                          text-color="white"
                          icon="schedule"
                          v-if="typeof animeInfo.episodes === 'number'"
                        >
                          {{ animeInfo.episodes }} Episodes
                        </q-chip>
                      </div>
                    </div>
                    <!-- Genres and Type Badges -->
                    <div
                      class="badges-row q-mb-md"
                      v-if="Array.isArray(animeInfo.genres) && animeInfo.genres.length"
                    >
                      <q-chip
                        v-for="(genre, index) in animeInfo.genres"
                        :key="genre.id || genre.mal_id || index"
                        :color="getColorForGenre(index)"
                        text-color="white"
                        clickable
                        @click="navigateToGenre(genre.link || `/genre/${genre.name}`)"
                        class="genre-chip"
                      >
                        {{ genre.name }}
                      </q-chip>
                    </div>
                  </div>

                  <!-- Quick Stats Row -->
                  <div class="stats-row q-mb-lg">
                    <div class="row q-col-gutter-md">
                      <div class="col-6 col-sm-3">
                        <div class="stat-card">
                          <div class="stat-value text-h6 text-bold">
                            {{ animeInfo.score || 'N/A' }}
                          </div>
                          <div class="stat-label text-caption">MAL Score</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="stat-card">
                          <div class="stat-value text-h6 text-bold">
                            {{ animeInfo.rank ? `#${animeInfo.rank}` : 'N/A' }}
                          </div>
                          <div class="stat-label text-caption">Ranked</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="stat-card">
                          <div class="stat-value text-h6 text-bold">
                            {{ animeInfo.popularity ? `#${animeInfo.popularity}` : 'N/A' }}
                          </div>
                          <div class="stat-label text-caption">Popularity</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="stat-card">
                          <div class="stat-value text-h6 text-bold">
                            {{ animeInfo.views ? formatNumber(animeInfo.views) : 'N/A' }}
                          </div>
                          <div class="stat-label text-caption">Views</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="action-buttons q-mb-lg">
                    <div class="row q-gutter-sm">
                      <q-btn
                        color="primary"
                        icon="play_arrow"
                        :label="t('animeInfo.watchNow')"
                        size="md"
                        @click="navigateToWatch"
                        class="watch-btn"
                      />
                      <q-btn
                        color="secondary"
                        icon="playlist_add"
                        :label="t('animeInfo.addToList')"
                        outline
                        size="md"
                      >
                        <q-menu>
                          <q-list>
                            <q-item
                              v-for="listType in watchListTypes"
                              :key="listType.value"
                              clickable
                              @click="addToWatchList(listType.value)"
                            >
                              <q-item-section avatar>
                                <q-icon :name="listType.icon" />
                              </q-item-section>
                              <q-item-section>{{ t(listType.label) }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn
                        color="accent"
                        icon="share"
                        :label="t('animeInfo.shareAnime')"
                        outline
                        size="md"
                      >
                        <q-menu>
                          <q-list>
                            <q-item
                              v-for="platform in sharePlatforms"
                              :key="platform.name"
                              clickable
                              @click="shareOn(platform.name.toLowerCase())"
                            >
                              <q-item-section avatar>
                                <q-icon :name="platform.icon" :color="platform.color" />
                              </q-item-section>
                              <q-item-section>{{ platform.name }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- States removed as data is now fetched in parent component -->

      <!-- Tabbed Content Section -->
      <AnimeTabbedContent v-if="animeInfo" :animeData="animeInfo" />

      <!-- Anime Groups Section -->
      <AnimeGroups
        v-if="animeInfo && animeInfo.animeGroups"
        :animeGroups="animeInfo.animeGroups"
        :currentAnimeId="animeInfo.id"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { linkWatch } from 'src/utils/helper'
// import removed as we now receive the data as a prop
import BreadcrumbNavigation from './components/BreadcrumbNavigation.vue'
import AnimeTabbedContent from './components/AnimeTabbedContent.vue'
import AnimeGroups from './components/AnimeGroups.vue'

// Define props
const props = defineProps({
  slugWithId: {
    type: String,
    required: false, // Make it optional to handle both prop-based and route-based scenarios
  },
  animeInfo: {
    type: Object,
    required: false, // Required when using top-down state approach
  },
})

// Helper function to safely access animeInfo data, handling proxy objects
const safeAnimeInfo = computed(() => {
  // The animeInfo prop should already be the anime data object
  // No need to extract .data since the parent component handles that
  const result = props.animeInfo
  return result
})

// Emits
const emit = defineEmits(['animeInfoLoaded'])

// const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const colors = computed(() => [
  'blue-4',
  'blue-5',
  'blue-6',
  'blue-7',
  'blue-8',
  'blue-9',
  'blue-10',
  'orange-6',
  'orange-7',
  'orange-8',
  'orange-9',
  'orange-10',
  'red-6',
  'red-7',
  'red-8',
  'red-9',
  'red-10',
  'yellow-6',
  'yellow-7',
  'yellow-8',
  'yellow-9',
  'yellow-10',
])

const getColorForGenre = (index) => {
  return colors.value[index % colors.value.length]
}

const progressKey = computed(() => {
  const info = safeAnimeInfo.value
  if (!info) return null
  if (info.id) return `anime-${info.id}`
  if (info.slug) return `slug-${info.slug}`
  return null
})

// Functions below are commented out as they're no longer needed with the top-down state approach
// Extract anime ID from route params - kept for reference
// const extractIdFromSlug = (slugWithId) => {
//   const match = slugWithId?.match(/(\d+)$/)
//   return match ? match[1] : null
// }

// We no longer need animeId as data is passed via props
// const animeId = computed(() => {
//   const slugWithId = props.slugWithId || route.params.slugWithId
//   return extractIdFromSlug(slugWithId)
// })

// Notify parent once data is available - kept for backwards compatibility
const notifyParent = (data) => {
  if (data && typeof data === 'object') {
    emit('animeInfoLoaded', data)
  }
}

onMounted(() => {
  if (props.animeInfo) {
    notifyParent(props.animeInfo)
  }
})

watch(
  () => props.animeInfo,
  (val) => {
    if (val) {
      notifyParent(val)
    }
  },
  { immediate: true },
)

// Image URL computed property for fallback handling
const imageUrl = computed(() => {
  if (!safeAnimeInfo.value) return null

  const possibleUrls = [
    safeAnimeInfo.value.poster,
    safeAnimeInfo.value.image,
    safeAnimeInfo.value.image_url,
    safeAnimeInfo.value.coverImage,
    safeAnimeInfo.value.thumbnail,
  ]

  const validUrl = possibleUrls.find((url) => url && url.trim() !== '')
  return validUrl
})

const japaneseTitle = computed(() => {
  // API response has 'titles' array instead of 'otherNames'
  const titles = safeAnimeInfo.value?.titles || []
  const japanese = titles.find(
    (title) =>
      title.language === 'jp' ||
      title.language === 'ja' ||
      title.title.includes('日本') ||
      /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(title.title),
  )
  return japanese?.title || null
})

const synonyms = computed(() => {
  const titles = safeAnimeInfo.value?.titles || []
  const synonymTitles = titles
    .filter((title) => title.language === 'en' && title.title !== safeAnimeInfo.value?.title)
    .map((title) => title.title)
  return synonymTitles.length > 0 ? synonymTitles.join(', ') : null
})

// Watch list types with icons
const watchListTypes = ref([
  { value: 'watching', label: 'currentlyWatching', icon: 'visibility' },
  { value: 'completed', label: 'completed', icon: 'check_circle' },
  { value: 'on-hold', label: 'onHold', icon: 'pause_circle' },
  { value: 'dropped', label: 'dropped', icon: 'cancel' },
  { value: 'plan-to-watch', label: 'planToWatch', icon: 'event_available' },
])

// Share platforms with updated icons
const sharePlatforms = ref([
  { name: 'Facebook', icon: 'fab fa-facebook', color: 'blue-9' },
  { name: 'Twitter', icon: 'fab fa-twitter', color: 'light-blue-5' },
  { name: 'Reddit', icon: 'fab fa-reddit-alien', color: 'orange-9' },
  { name: 'Telegram', icon: 'fab fa-telegram-plane', color: 'blue-7' },
  { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'green-7' },
  { name: 'Discord', icon: 'fab fa-discord', color: 'purple-6' },
])

// Rating color methods
const getRatingColorClass = (rating) => {
  if (!rating) return 'rating-default'
  const score = parseFloat(rating)
  if (score >= 8.5) return 'rating-excellent'
  if (score >= 7.5) return 'rating-good'
  if (score >= 6.0) return 'rating-average'
  return 'rating-poor'
}

// Status color
const getStatusColor = (status) => {
  if (!status) return 'grey'
  const statusLower = status.toLowerCase()
  if (statusLower.includes('airing') || statusLower.includes('ongoing')) return 'green'
  if (statusLower.includes('completed') || statusLower.includes('finished')) return 'blue'
  if (statusLower.includes('upcoming') || statusLower.includes('not yet aired')) return 'purple'
  return 'grey'
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Navigation methods
const navigateToWatch = () => {
  if (!safeAnimeInfo.value) return

  let targetUrl = null

  if (process.env.CLIENT) {
    try {
      const stored = localStorage.getItem('watch-progress-v1')
      if (stored) {
        const progress = JSON.parse(stored)
        const entry = progress?.[progressKey.value]
        if (entry?.currentEpisodeId && safeAnimeInfo.value?.slug) {
          const number = entry.currentEpisodeNumber || entry.currentEpisodeSort
          targetUrl = linkWatch(
            safeAnimeInfo.value.slug,
            safeAnimeInfo.value.id,
            number,
            entry.currentEpisodeId,
          )
        }
      }
    } catch (err) {
      console.error('Failed to read watch progress', err)
    }
  }

  if (!targetUrl) {
    targetUrl = safeAnimeInfo.value.watchUrl
  }

  if (targetUrl) {
    router.push(targetUrl)
  }
}

const navigateToGenre = (genreLink) => {
  router.push(genreLink)
}

// Action methods
const addToWatchList = (listType) => {
  // Implement watch list logic
  console.log(`Adding to watch list: ${listType}`)
}

const shareOn = (platform) => {
  const url = window.location.href
  const title = safeAnimeInfo.value?.title || 'Anime Details'

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  }

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank')
  }
}

// Image error handling
const onImageError = (event) => {
  // Handle image loading errors silently
  console.log('Failed to load image:', event.target.src)
}
</script>
