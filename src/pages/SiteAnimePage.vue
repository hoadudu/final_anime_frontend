<template>
  <q-page class="anime-page">
    <div class="page-container q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%">
      <!-- Loading state -->
      <div v-if="isLoading" class="full-height flex flex-center column">
        <q-spinner size="50px" color="primary" />
        <div class="q-mt-md">{{ t('common.loading') }}</div>
      </div>

      <!-- Error state -->
      <div v-else-if="hasError" class="full-height flex flex-center column">
        <q-icon name="error" size="50px" color="negative" />
        <div class="q-mt-md">{{ t('common.error') }}</div>
      </div>

      <div v-else>
        <!-- Main Anime Info - Show when anime data is loaded -->
        <AnimeInfo v-if="animeInfo" :animeInfo="animeInfo" :slugWithId="slugWithId" />

        <!-- Loading state for anime info specifically -->
        <div v-else-if="isLoadingAnimeInfo" class="full-height flex flex-center column">
          <q-spinner size="50px" color="primary" />
          <div class="q-mt-md">{{ t('animePage.loadingAnimeInfo') }}</div>
        </div>

        <!-- Additional Content with Sidebar Layout -->
        <div class="additional-content q-mt-xl" v-if="animeInfo">
          <div class="row q-col-gutter-lg">
            <!-- Extended Content Area -->
            <div class="col-12 col-lg-9">
              <!-- Show loading for recommendations if still loading -->
              <div v-if="isLoadingRecommendations" class="flex flex-center q-pa-md">
                <q-spinner size="30px" color="primary" class="q-mr-sm" />
                <span>{{ t('animePage.loadingRecommendations') }}</span>
              </div>
              <RecommendationAnimes v-else :anime-id="animeId" :recommendations="recommendations" />
            </div>

            <!-- Enhanced Sidebar -->
            <div class="col-12 col-lg-3">
              <div class="sidebar-content">
                <!-- Top Anime Card -->
                <TopTen />

                <!-- Recent Reviews Card -->
                <q-card flat bordered class="sidebar-card q-mb-lg">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="rate_review" class="q-mr-sm" />
                      {{ t('animePage.recentReviews') }}
                    </div>
                    <div class="text-center q-pa-md">
                      <q-icon name="construction" size="30px" color="grey" />
                      <div class="q-mt-sm text-caption">{{ t('animePage.comingSoon') }}</div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- News Card -->
                <q-card flat bordered class="sidebar-card">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="article" class="q-mr-sm" />
                      {{ t('animePage.latestNews') }}
                    </div>
                    <div class="text-center q-pa-md">
                      <q-icon name="construction" size="30px" color="grey" />
                      <div class="q-mt-sm text-caption">{{ t('animePage.comingSoon') }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed, watchEffect } from 'vue'
import { useMeta } from 'quasar'
import { useAnimeInfoPageData, useAnimeRecommendationsData } from 'src/composables/anime-info-page/useAnimeInfoPageData'
import AnimeInfo from 'src/components/anime-info-page/AnimeInfo.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'
import RecommendationAnimes from 'src/components/anime-info-page/components/RecommendationAnimes.vue'
import { APP_NAME } from 'src/config/api.js'




const { t } = useI18n()
const route = useRoute()
const slugWithId = computed(() => route.params.slugWithId)
const animeId = computed(() => {
  const slugWithId = route.params.slugWithId
  const match = slugWithId.match(/-(\d+)$/)
  return match ? match[1] : null
})

// Top-down data fetching
const { data: animeInfoData, isLoading: isLoadingAnimeInfo, error: animeInfoError } = useAnimeInfoPageData(animeId)
const { data: recommendationsData, isLoading: isLoadingRecommendations } = useAnimeRecommendationsData(animeId)

// Provide data to child components
const animeInfo = computed(() => {
  // The composable already extracts the data, so animeInfoData.value should be the anime object directly
  const result = animeInfoData.value || null
  return result
})

const recommendations = computed(() => {
  const raw = recommendationsData?.value
  if (!raw) return []
  return Array.isArray(raw) ? raw : raw.data || raw.items || []
})

// Handle loading states
const isLoading = computed(() => isLoadingAnimeInfo && !animeInfo.value) // Only block on anime info initial load
// const hasError = computed(() => animeInfoError)
const hasError = computed(() => !!animeInfoError.value)




// Computed properties for dynamic meta data
const pageTitle = computed(() => {
  if (!animeInfo.value) return t('animePage.title', 'Anime Info')
  const anime = animeInfo.value
  const year = anime.year || anime.aired?.from?.split('-')[0] || ''
  return year ? `${anime.title} (${year})` : anime.title
})

const pageDescription = computed(() => {
  if (!animeInfo.value) return t('animePage.defaultDescription', 'Watch anime online with high quality')

  const anime = animeInfo.value
  let description = anime.description || anime.synopsis || ''

  // Truncate description for meta tag (160 characters recommended)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  // Add genre information if available
  if (anime.genres && anime.genres.length > 0) {
    const genres = anime.genres.slice(0, 3).map(g => g.name).join(', ')
    description = `${description} Genres: ${genres}.`
  }

  return description
})

const pageKeywords = computed(() => {
  if (!animeInfo.value) return 'anime, manga, watch anime online'

  const anime = animeInfo.value
  const keywords = ['anime', anime.title]

  // Add genres as keywords
  if (anime.genres) {
    keywords.push(...anime.genres.map(g => g.name.toLowerCase()))
  }

  // Add type and status
  if (anime.type) keywords.push(anime.type.toLowerCase())
  if (anime.status) keywords.push(anime.status.toLowerCase())
  if (anime.year) keywords.push(anime.year)

  return keywords.slice(0, 10).join(', ')
})

const ogImage = computed(() => {
  return animeInfo.value?.poster || animeInfo.value?.cover || '/favicon.ico'
})

// Setup dynamic page meta information
const metaData = computed(() => ({
  title: pageTitle.value,
  titleTemplate: title => `${title} - ${process.env.APP_NAME || APP_NAME}`,

  meta: {
    description: {
      name: 'description',
      content: pageDescription.value
    },
    keywords: {
      name: 'keywords',
      content: pageKeywords.value
    },
    equiv: {
      'http-equiv': 'Content-Type',
      content: 'text/html; charset=UTF-8'
    },

    // Open Graph meta tags
    ogTitle: {
      property: 'og:title',
      content: pageTitle.value
    },
    ogDescription: {
      property: 'og:description',
      content: pageDescription.value
    },
    ogImage: {
      property: 'og:image',
      content: ogImage.value
    },
    ogType: {
      property: 'og:type',
      content: 'video.tv_show'
    },
    ogUrl: {
      property: 'og:url',
      content: process.env.CLIENT ? `${window.location.origin}${route.fullPath}` : route.fullPath
    },

    // Twitter Card meta tags
    twitterCard: {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    twitterTitle: {
      name: 'twitter:title',
      content: pageTitle.value
    },
    twitterDescription: {
      name: 'twitter:description',
      content: pageDescription.value
    },
    twitterImage: {
      name: 'twitter:image',
      content: ogImage.value
    }
  },

  link: {
    canonical: {
      rel: 'canonical',
      href: process.env.CLIENT ? `${window.location.origin}${route.fullPath}` : route.fullPath
    }
  },

  script: {
    ldJson: {
      type: 'application/ld+json',
      innerHTML: computed(() => {
        if (!animeInfo.value) return '{}'

        const anime = animeInfo.value
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "TVSeries",
          "name": anime.title,
          "description": anime.description || anime.synopsis || '',
          "image": anime.poster || anime.cover,
          "datePublished": anime.aired?.from,
          "genre": anime.genres?.map(g => g.name) || [],
          "numberOfEpisodes": anime.episodes?.total || 0,
          "contentRating": anime.rating || 'Not Rated',
          "aggregateRating": anime.malScore ? {
            "@type": "AggregateRating",
            "ratingValue": anime.malScore,
            "ratingCount": 1
          } : undefined,
          "productionCompany": anime.studios?.map(s => ({
            "@type": "Organization",
            "name": s.titles || s.name
          })) || [],
          "url": process.env.CLIENT ? `${window.location.origin}${route.fullPath}` : route.fullPath
        }

        return JSON.stringify(structuredData)
      }).value
    }
  },

  htmlAttr: {
    lang: 'en'
  },

  bodyAttr: {
    itemscope: '',
    itemtype: 'https://schema.org/WebPage'
  }
}))

// Apply meta data reactively
watchEffect(() => {
  useMeta(metaData.value)
})
</script>