<template>
    <div class="trending-carousel-section q-px-lx">
        <div class="container-fluid">
            <!-- Section Header -->
            <div class="section-header q-mb-lg">
                <h2 class="section-title text-h4 text-weight-bold text-white q-mb-sm">
                    {{ t('trending') }}
                </h2>
                <p class="section-subtitle text-grey-4">
                    {{ t('trendingDescription') }}
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="trendingStore.isLoading" class="loading-section flex flex-center q-py-xl">
                <div class="text-center">
                    <q-spinner-dots color="primary" size="40px" />
                    <div class="text-white q-mt-md">{{ t('loadingTrending') }}</div>
                </div>
            </div>

            <!-- Error State -->
            <div v-if="trendingStore.error" class="error-section flex flex-center q-py-xl">
                <q-banner class="bg-negative text-white">
                    <q-icon name="error" size="md" class="q-mr-md" />
                    {{ trendingStore.error }}
                    <template v-slot:action>
                        <q-btn flat :label="t('retry')" @click="trendingStore.fetchTrendingMovies" />
                    </template>
                </q-banner>
            </div>

            <!-- Trending Carousel -->
            <div v-if="!trendingStore.isLoading && !trendingStore.error" class="trending-carousel">
                <q-carousel v-model="slide" animated arrows infinite :autoplay="autoplay" transition-prev="slide-right"
                    transition-next="slide-left" class="trending-carousel-container" height="auto" swipeable drag>
                    <q-carousel-slide :name="0" class="trending-slide">
                        <div class="trending-grid">
                            <div v-for="anime in trendingStore.trendingMovies" :key="anime.id" class="trending-item"
                                @click="navigateToAnime(anime)">
                                <q-card flat class="trending-card cursor-pointer" @mouseenter="pauseAutoplay"
                                    @mouseleave="resumeAutoplay">
                                    <!-- Rank Badge -->
                                    <div class="rank-badge">
                                        <span class="rank-number">{{ String(anime.rank).padStart(2, '0') }}</span>
                                    </div>

                                    <!-- Poster Image -->
                                    <div class="poster-container">
                                        <q-img :src="anime.posterUrl" :alt="anime.title" class="poster-image"
                                            loading="lazy" :ratio="3 / 4" spinner-color="primary" spinner-size="40px">
                                            <template v-slot:error>
                                                <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                                                    <q-icon name="broken_image" size="60px" />
                                                </div>
                                            </template>
                                        </q-img>

                                        <!-- Hover Overlay -->
                                        <div class="hover-overlay absolute-full flex flex-center">
                                            <q-btn round color="primary" icon="play_arrow" size="lg"
                                                class="play-button" />
                                        </div>
                                    </div>

                                    <!-- Title -->
                                    <q-card-section class="q-pa-sm">
                                        <div class="anime-title text-weight-medium text-white text-center">
                                            {{ anime.title }}
                                        </div>
                                    </q-card-section>

                                    <!-- Tooltip with detailed info -->
                                    <q-tooltip class="bg-dark text-white" :offset="[10, 10]" max-width="300px">
                                        <div class="tooltip-content">
                                            <div class="text-weight-bold q-mb-xs">{{ anime.title }}</div>
                                            <div v-if="anime.description" class="text-caption q-mb-sm">
                                                {{ truncateDescription(anime.description) }}
                                            </div>
                                            <div class="tooltip-meta">
                                                <div v-if="anime.aired" class="q-mb-xs">
                                                    <strong>{{ t('aired') }}:</strong> {{ anime.aired }}
                                                </div>
                                                <div v-if="anime.status" class="q-mb-xs">
                                                    <strong>{{ t('status') }}:</strong> {{ formatStatus(anime.status) }}
                                                </div>
                                                <div v-if="anime.genres && anime.genres.length" class="q-mb-xs">
                                                    <strong>{{ t('genres') }}:</strong>
                                                    <div class="row q-gutter-xs q-mt-xs">
                                                        <q-chip v-for="genre in anime.genres.slice(0, 3)" :key="genre"
                                                            dense color="primary" text-color="white" size="sm">
                                                            {{ genre }}
                                                        </q-chip>
                                                        <q-chip v-if="anime.genres.length > 3" dense outline
                                                            color="grey" text-color="grey" size="sm">
                                                            +{{ anime.genres.length - 3 }}
                                                        </q-chip>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </q-tooltip>
                                </q-card>
                            </div>
                        </div>
                    </q-carousel-slide>
                </q-carousel>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTrendingCarouselStore } from '../../stores/site-collections-store'

// Composables
const { t } = useI18n()
const trendingStore = useTrendingCarouselStore()

// State
const slide = ref(0)
const autoplay = ref(false) // Disable autoplay since we only have one slide
let autoplayTimer = null

// Methods
const navigateToAnime = (anime) => {
    console.log('Navigating to anime:', anime.title)
    // You can implement actual navigation logic here
    // router.push(`/anime/${anime.id}`)
}

const truncateDescription = (description, maxLength = 120) => {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).trim() + '...'
}

const formatStatus = (status) => {
    switch (status?.toLowerCase()) {
        case 'ongoing':
            return t('ongoing', 'Ongoing')
        case 'completed':
            return t('completed', 'Completed')
        case 'upcoming':
            return t('upcoming', 'Upcoming')
        default:
            return status || t('unknown', 'Unknown')
    }
}

// Autoplay controls (not needed for single slide but keeping for future use)
const pauseAutoplay = () => {
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
    }
}

const resumeAutoplay = () => {
    if (!autoplayTimer && autoplay.value) {
        startAutoplay()
    }
}

const startAutoplay = () => {
    // Since we only have one slide, no autoplay needed
    return
}

// Lifecycle
onMounted(async () => {
    await trendingStore.fetchTrendingMovies()
})

onBeforeUnmount(() => {
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
    }
})
</script>

<style lang="scss" scoped>
.trending-carousel-section {
    background: transparent;
    min-height: 400px;
    margin: 0;
    padding: 20px 0;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-header {
    text-align: center;
    margin-bottom: 20px;

    .section-title {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
    }
}

.trending-carousel {
    .trending-carousel-container {
        .q-carousel__slides-container {
            min-height: 400px;
        }

        .q-carousel__arrow {
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            color: white;
            transition: all 0.3s ease;
            z-index: 15;

            &:hover {
                background-color: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            &--left {
                left: 10px;
            }

            &--right {
                right: 10px;
            }
        }

        .trending-slide {
            padding: 0;
        }
    }
}

.trending-grid {
    display: grid;
    gap: 20px;
    padding: 0;
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

    // Mobile - exactly 2 columns
    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        min-height: auto;
    }

    // Tablet - 4 columns
    @media (min-width: 769px) and (max-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
    }

    // Desktop medium - 6 columns
    @media (min-width: 1025px) and (max-width: 1440px) {
        grid-template-columns: repeat(6, 1fr);
        gap: 20px;
    }

    // Desktop large - 8 columns
    @media (min-width: 1441px) {
        grid-template-columns: repeat(8, 1fr);
        gap: 20px;
    }
}

.trending-item {
    position: relative;
    min-width: 0; // Prevent grid items from overflowing
}

.trending-card {
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 107, 107, 0.5);

        .hover-overlay {
            opacity: 1;
        }

        .rank-badge {
            transform: scale(1.1);
        }

        .poster-image {
            transform: scale(1.05);
        }
    }
}

.rank-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    transition: transform 0.3s ease;

    @media (max-width: 480px) {
        width: 35px;
        height: 35px;
        font-size: 12px;
        top: 8px;
        left: 8px;
    }

    .rank-number {
        font-family: 'Roboto Mono', monospace;
    }
}

.poster-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px 8px 0 0;
    flex: 1;

    .poster-image {
        transition: transform 0.3s ease;
        width: 100%;
        height: 100%;
    }
}

.hover-overlay {
    background: rgba(0, 0, 0, 0.7);
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(4px);

    .play-button {
        transform: scale(0.8);
        transition: transform 0.3s ease;

        &:hover {
            transform: scale(1);
        }
    }
}

.anime-title {
    font-size: 14px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
    min-height: 36px;
    text-align: center;
    padding: 8px 12px;
    flex-shrink: 0;

    @media (max-width: 480px) {
        font-size: 13px;
        padding: 6px 8px;
        min-height: 32px;
    }
}

.tooltip-content {
    .tooltip-meta {
        font-size: 12px;
        line-height: 1.4;
    }
}

// Loading and error states
.loading-section,
.error-section {
    min-height: 300px;
}

// Responsive adjustments for container
@media (max-width: 480px) {
    .container {
        padding: 0 15px;
    }

    .trending-carousel-section {
        padding: 15px 0;
    }

    .section-header {
        margin-bottom: 15px;
    }
}

// Ensure proper spacing from elements above
.trending-carousel-section {
    // Remove any negative margins that could cause gaps
    margin-top: 0;

    // Ensure it stays close to previous element
    &:first-child {
        margin-top: 0;
    }
}
</style>
