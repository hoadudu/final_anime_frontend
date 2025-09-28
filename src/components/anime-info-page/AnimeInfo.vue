<template>
    <div class="anime-info-container">
        <!-- Breadcrumb Navigation -->
        <div class="breadcrumb-container" v-if="animeInfo">
            <div class="breadcrumb-wrapper">
                <q-breadcrumbs class="breadcrumb-nav" active-color="primary">
                    <q-breadcrumbs-el icon="home" label="Home" :to="{ name: 'site-home' }" class="breadcrumb-item" />
                    <q-breadcrumbs-el :icon="getBreadcrumbIcon(animeInfo.type)"
                        :label="getBreadcrumbType(animeInfo.type)" :to="getBreadcrumbTypeLink(animeInfo.type)"
                        class="breadcrumb-item" />
                    <q-breadcrumbs-el :label="animeInfo.title" class="breadcrumb-current" />
                </q-breadcrumbs>
            </div>
        </div>

        <!-- Hero Section with Background -->
        <div class="hero-section" v-if="animeInfo">
            <div class="hero-background" :style="{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }">
                <div class="hero-overlay"></div>
            </div>

            <div class="hero-content">
                <div class="row q-col-gutter-lg">
                    <!-- Anime Poster Card -->
                    <div class="col-12 col-sm-4 col-md-3">
                        <q-card class="poster-card shadow-8">
                            <div class="poster-wrapper">
                                <q-img :src="imageUrl" :alt="animeInfo.title" class="poster-image"
                                    spinner-color="primary" loading="lazy" @error="onImageError" fit="cover"
                                    no-ratio-style>
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
                                            {{ synonyms }}
                                        </div>
                                    </div>

                                    <!-- Status and Type Badges -->
                                    <div class="badges-row q-mb-md">
                                        <q-chip :color="getStatusColor(animeInfo.status)" text-color="white"
                                            icon="radio_button_checked" class="status-chip">
                                            {{ animeInfo.status }}
                                        </q-chip>
                                        <q-chip color="blue-grey-6" text-color="white" icon="tv" v-if="animeInfo.type">
                                            {{ animeInfo.type }}
                                        </q-chip>
                                        <q-chip color="purple-6" text-color="white" icon="schedule"
                                            v-if="animeInfo.episodes">
                                            {{ animeInfo.episodes }} Episodes
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
                                                    {{ animeInfo.members ? formatNumber(animeInfo.members) : 'N/A' }}
                                                </div>
                                                <div class="stat-label text-caption">Members</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div class="action-buttons q-mb-lg">
                                    <div class="row q-gutter-sm">
                                        <q-btn color="primary" icon="play_arrow" label="Watch Now" size="md"
                                            @click="navigateToWatch" class="watch-btn" />
                                        <q-btn color="secondary" icon="playlist_add" label="Add to List" outline
                                            size="md">
                                            <q-menu>
                                                <q-list>
                                                    <q-item v-for="listType in watchListTypes" :key="listType.value"
                                                        clickable @click="addToWatchList(listType.value)">
                                                        <q-item-section avatar>
                                                            <q-icon :name="listType.icon" />
                                                        </q-item-section>
                                                        <q-item-section>{{ t(listType.label) }}</q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-menu>
                                        </q-btn>
                                        <q-btn color="accent" icon="share" label="Share" outline size="md">
                                            <q-menu>
                                                <q-list>
                                                    <q-item v-for="platform in sharePlatforms" :key="platform.name"
                                                        clickable @click="shareOn(platform.name.toLowerCase())">
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

        <!-- Loading State -->
        <div v-else-if="isLoading" class="loading-container">
            <q-card class="loading-card">
                <q-card-section class="text-center q-pa-xl">
                    <q-spinner-dots size="50px" color="primary" />
                    <div class="q-mt-md text-h6">Loading anime information...</div>
                </q-card-section>
            </q-card>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <q-card class="error-card">
                <q-card-section class="text-center q-pa-xl">
                    <q-icon name="error" size="50px" color="negative" />
                    <div class="q-mt-md text-h6">Error loading anime information</div>
                    <q-btn color="primary" label="Retry" @click="refetch" class="q-mt-md" />
                </q-card-section>
            </q-card>
        </div>

        <!-- Tabbed Content Section -->
        <div class="content-tabs q-mt-xl" v-if="animeInfo">
            <q-card class="tabs-card shadow-2">
                <q-tabs v-model="activeTab" class="tabs-header" align="left" indicator-color="primary"
                    active-color="primary" narrow-indicator>
                    <q-tab name="overview" icon="info" label="Overview" />
                    <q-tab name="episodes" icon="playlist_play" label="Episodes" />
                    <q-tab name="characters" icon="people" label="Characters" />
                    <q-tab name="reviews" icon="rate_review" label="Reviews" />
                    <q-tab name="related" icon="device_hub" label="Related" />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="activeTab" animated>
                    <!-- Overview Tab -->
                    <q-tab-panel name="overview" class="q-pa-lg">
                        <div class="overview-content">
                            <div class="row q-col-gutter-lg">
                                <!-- Synopsis Card -->
                                <div class="col-12 col-md-8">
                                    <q-card flat bordered class="synopsis-card">
                                        <q-card-section>
                                            <div class="text-h6 q-mb-md">
                                                <q-icon name="description" class="q-mr-sm" />
                                                Synopsis
                                            </div>
                                            <div class="synopsis-text">
                                                <div v-if="isDescriptionLong && !showFullDescription">
                                                    {{ cleanDescription.substring(0, 200) }}...
                                                    <q-btn flat color="primary" label="Show more"
                                                        @click="toggleDescription" class="show-more-btn" />
                                                </div>
                                                <div v-else>
                                                    {{ cleanDescription }}
                                                    <q-btn v-if="isDescriptionLong && showFullDescription" flat
                                                        color="primary" label="Show less" @click="toggleDescription"
                                                        class="show-more-btn" />
                                                </div>
                                            </div>
                                        </q-card-section>
                                    </q-card>
                                </div>

                                <!-- Information Card -->
                                <div class="col-12 col-md-4">
                                    <q-card flat bordered class="info-details-card">
                                        <q-card-section>
                                            <div class="text-h6 q-mb-md">
                                                <q-icon name="info_outline" class="q-mr-sm" />
                                                Information
                                            </div>

                                            <div class="info-item" v-if="animeInfo.type">
                                                <div class="info-label">Type:</div>
                                                <div class="info-value">{{ animeInfo.type }}</div>
                                            </div>

                                            <div class="info-item" v-if="animeInfo.episodes">
                                                <div class="info-label">Episodes:</div>
                                                <div class="info-value">{{ animeInfo.episodes }}</div>
                                            </div>

                                            <div class="info-item" v-if="animeInfo.status">
                                                <div class="info-label">Status:</div>
                                                <div class="info-value">
                                                    <q-chip :color="getStatusColor(animeInfo.status)" text-color="white"
                                                        size="sm">
                                                        {{ animeInfo.status }}
                                                    </q-chip>
                                                </div>
                                            </div>

                                            <div class="info-item" v-if="airedString">
                                                <div class="info-label">Aired:</div>
                                                <div class="info-value">{{ airedString }}</div>
                                            </div>

                                            <div class="info-item" v-if="animeInfo.duration">
                                                <div class="info-label">Duration:</div>
                                                <div class="info-value">{{ animeInfo.duration }}</div>
                                            </div>

                                            <div class="info-item" v-if="animeInfo.rating">
                                                <div class="info-label">Rating:</div>
                                                <div class="info-value">{{ animeInfo.rating }}</div>
                                            </div>

                                            <div class="info-item" v-if="animeInfo.source">
                                                <div class="info-label">Source:</div>
                                                <div class="info-value">{{ animeInfo.source }}</div>
                                            </div>
                                        </q-card-section>
                                    </q-card>

                                    <!-- Genres Card -->
                                    <q-card flat bordered class="genres-card q-mt-md" v-if="animeInfo.genres?.length">
                                        <q-card-section>
                                            <div class="text-h6 q-mb-md">
                                                <q-icon name="category" class="q-mr-sm" />
                                                Genres
                                            </div>
                                            <div class="genres-list">
                                                <q-chip v-for="genre in animeInfo.genres" :key="genre.mal_id"
                                                    color="primary" text-color="white" clickable
                                                    @click="navigateToGenre(genre.name)" class="genre-chip">
                                                    {{ genre.name }}
                                                </q-chip>
                                            </div>
                                        </q-card-section>
                                    </q-card>
                                </div>
                            </div>
                        </div>
                    </q-tab-panel>

                    <!-- Episodes Tab -->
                    <q-tab-panel name="episodes" class="q-pa-lg">
                        <div class="episodes-content">
                            <div class="text-h6 q-mb-md">Episodes</div>
                            <q-card flat bordered>
                                <q-card-section class="text-center q-pa-xl">
                                    <q-icon name="construction" size="50px" color="grey" />
                                    <div class="q-mt-md">Episodes list coming soon...</div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </q-tab-panel>

                    <!-- Characters Tab -->
                    <q-tab-panel name="characters" class="q-pa-lg">
                        <div class="characters-content">
                            <div class="text-h6 q-mb-md">Characters</div>
                            <q-card flat bordered>
                                <q-card-section class="text-center q-pa-xl">
                                    <q-icon name="construction" size="50px" color="grey" />
                                    <div class="q-mt-md">Characters list coming soon...</div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </q-tab-panel>

                    <!-- Reviews Tab -->
                    <q-tab-panel name="reviews" class="q-pa-lg">
                        <div class="reviews-content">
                            <div class="text-h6 q-mb-md">Reviews</div>
                            <q-card flat bordered>
                                <q-card-section class="text-center q-pa-xl">
                                    <q-icon name="construction" size="50px" color="grey" />
                                    <div class="q-mt-md">Reviews coming soon...</div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </q-tab-panel>

                    <!-- Related Tab -->
                    <q-tab-panel name="related" class="q-pa-lg">
                        <div class="related-content">
                            <div class="text-h6 q-mb-md">Related Anime</div>
                            <q-card flat bordered>
                                <q-card-section class="text-center q-pa-xl">
                                    <q-icon name="construction" size="50px" color="grey" />
                                    <div class="q-mt-md">Related anime coming soon...</div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </q-card>
        </div>
    </div>
</template>

<script setup>

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAnimeInfoPageData } from 'src/composables/anime-info-page/useAnimeInfoPageData'
import { unref } from 'vue'


const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Reactive data
const showFullDescription = ref(false)
const activeTab = ref('overview')

// Extract anime ID from route params
const extractIdFromSlug = (slugWithId) => {
    const match = slugWithId.match(/(\d+)$/)
    return match ? match[1] : null
}

const animeId = computed(() => {
    return extractIdFromSlug(route.params.slugWithId)
})

// Vue Query data fetching
const { data: animeInfoData, isLoading, error, refetch } = useAnimeInfoPageData(animeId)

// Computed properties
const animeInfo = computed(() => {
    const data = unref(animeInfoData)
    console.log('Component animeInfo data:', data) // Debug log
    if (data) {
        console.log('Image URL:', data.poster || data.image || data.image_url) // Debug image
    }
    return data
})

// Image URL computed property for fallback handling
const imageUrl = computed(() => {
    if (!animeInfo.value) return null

    const possibleUrls = [
        animeInfo.value.poster,
        animeInfo.value.image,
        animeInfo.value.image_url,
        animeInfo.value.coverImage,
        animeInfo.value.thumbnail
    ]

    const validUrl = possibleUrls.find(url => url && url.trim() !== '')
    console.log('Final image URL:', validUrl)
    return validUrl
})


const japaneseTitle = computed(() => {
    // API response has 'titles' array instead of 'otherNames'
    const titles = animeInfo.value?.titles || []
    const japanese = titles.find(title =>
        title.language === 'jp' ||
        title.language === 'ja' ||
        title.title.includes('日本') ||
        /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(title.title)
    )
    return japanese?.title || null
})

const synonyms = computed(() => {
    const titles = animeInfo.value?.titles || []
    const synonymTitles = titles.filter(title =>
        title.language === 'en' &&
        title.title !== animeInfo.value?.title
    ).map(title => title.title)
    return synonymTitles.length > 0 ? synonymTitles.join(', ') : null
})

const airedString = computed(() => {
    const aired = animeInfo.value?.aired
    if (!aired) return 'N/A'

    if (aired.from && aired.to) {
        return `${aired.from} to ${aired.to}`
    } else if (aired.from) {
        return `From ${aired.from}`
    }
    return 'N/A'
})

const isDescriptionLong = computed(() => {
    const desc = animeInfo.value?.description
    if (!desc) return false
    // Strip HTML tags for length calculation
    const plainText = desc.replace(/<[^>]*>/g, '')
    return plainText.length > 200
})

const cleanDescription = computed(() => {
    const desc = animeInfo.value?.description
    if (!desc) return ''
    // Strip HTML tags and decode HTML entities
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
})

// Watch list types with icons
const watchListTypes = ref([
    { value: 'watching', label: 'currentlyWatching', icon: 'visibility' },
    { value: 'completed', label: 'completed', icon: 'check_circle' },
    { value: 'on-hold', label: 'onHold', icon: 'pause_circle' },
    { value: 'dropped', label: 'dropped', icon: 'cancel' },
    { value: 'plan-to-watch', label: 'planToWatch', icon: 'event_available' }
])

// Share platforms with updated icons
const sharePlatforms = ref([
    { name: 'Facebook', icon: 'fab fa-facebook', color: 'blue-9' },
    { name: 'Twitter', icon: 'fab fa-twitter', color: 'light-blue-5' },
    { name: 'Reddit', icon: 'fab fa-reddit-alien', color: 'orange-9' },
    { name: 'Telegram', icon: 'fab fa-telegram-plane', color: 'blue-7' },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'green-7' },
    { name: 'Discord', icon: 'fab fa-discord', color: 'purple-6' }
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

const toggleDescription = () => {
    showFullDescription.value = !showFullDescription.value
}

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

// Navigation methods
const navigateToWatch = () => {
    router.push(`/watch/${route.params.slugWithId}/ep-1`)
}

const navigateToGenre = (genreSlug) => {
    router.push(`/genre/${genreSlug}`)
}

// Action methods
const addToWatchList = (listType) => {
    console.log('Adding to list:', listType)
    // Implement watch list logic
}

const shareOn = (platform) => {
    const url = window.location.href
    const title = animeInfo.value?.title

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    }

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank')
    }
}

// Image error handling
const onImageError = (event) => {
    console.error('Image failed to load:', event)
    console.log('Available image URLs:', {
        poster: animeInfo.value?.poster,
        image: animeInfo.value?.image,
        image_url: animeInfo.value?.image_url
    })
}

// Breadcrumb helper methods
const getBreadcrumbIcon = (type) => {
    if (!type) return 'tv'
    const typeLower = type.toLowerCase()
    if (typeLower.includes('movie') || typeLower.includes('film')) return 'movie'
    if (typeLower.includes('tv') || typeLower.includes('series')) return 'tv'
    if (typeLower.includes('ova') || typeLower.includes('special')) return 'video_library'
    if (typeLower.includes('ona') || typeLower.includes('web')) return 'computer'
    return 'tv'
}

const getBreadcrumbType = (type) => {
    if (!type) return 'TV'
    const typeLower = type.toLowerCase()
    if (typeLower.includes('movie') || typeLower.includes('film')) return 'Movies'
    if (typeLower.includes('tv') || typeLower.includes('series')) return 'TV Shows'
    if (typeLower.includes('ova')) return 'OVA'
    if (typeLower.includes('ona')) return 'ONA'
    if (typeLower.includes('special')) return 'Specials'
    return 'TV Shows'
}

const getBreadcrumbTypeLink = (type) => {
    if (!type) return { name: 'site-home', query: { type: 'tv' } }
    const typeLower = type.toLowerCase()
    if (typeLower.includes('movie') || typeLower.includes('film')) {
        return { name: 'site-home', query: { type: 'movie' } }
    }
    if (typeLower.includes('ova')) {
        return { name: 'site-home', query: { type: 'ova' } }
    }
    if (typeLower.includes('ona')) {
        return { name: 'site-home', query: { type: 'ona' } }
    }
    if (typeLower.includes('special')) {
        return { name: 'site-home', query: { type: 'special' } }
    }
    return { name: 'site-home', query: { type: 'tv' } }
}
</script>
