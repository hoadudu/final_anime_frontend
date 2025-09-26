<template>
    <div class="hero-section">
        <q-carousel v-model="slide" animated :navigation="false" infinite arrows transition-prev="slide-right"
            transition-next="slide-left" height="650px" class="bg-black" @mouseenter="pauseAutoplay"
            @mouseleave="resumeAutoplay">
            <q-carousel-slide v-for="(movie, index) in heroSectionStore.featuredMovies" :key="index" :name="index"
                :img-src="movie.backdropImage" class="column no-wrap flex-center">
                <div class="hero-content absolute-bottom text-left q-pa-xl">
                    <div class="hero-overlay"></div>
                    <div class="hero-text-content relative-position z-top">
                        <!-- Status badges -->
                        <div class="row items-center q-mb-md">
                            <q-badge v-if="movie.spotlight && parseInt(movie.spotlight) <= 3" color="red"
                                text-color="white" class="q-mr-sm text-weight-bold" icon="trending_up">
                                {{ t('hero.trendingBadge') }}
                            </q-badge>
                            <q-badge v-if="movie.quality" color="orange" text-color="white"
                                class="q-mr-sm text-weight-bold">
                                {{ movie.quality }}
                            </q-badge>
                            <q-badge v-if="movie.mediaType === 'movie'" color="purple" text-color="white"
                                class="q-mr-sm text-weight-bold">
                                {{ t('hero.movieBadge') }}
                            </q-badge>
                            <q-badge v-if="movie.ageRating" color="grey-7" text-color="white" class="q-mr-sm">
                                {{ movie.ageRating }}
                            </q-badge>
                        </div>

                        <!-- Title -->
                        <div class="hero-title text-h2 text-white text-weight-bold q-mb-md">
                            {{ movie.title }}
                            <span v-if="movie.season" class="text-subtitle1 text-grey-4 q-ml-sm">
                                {{ t('hero.seasonLabel') }} {{ movie.season }}
                            </span>
                        </div>

                        <!-- Meta information -->
                        <div class="hero-meta row items-center q-mb-md text-white">
                            <div class="rating-section q-mr-lg">
                                <q-icon name="star" color="yellow" size="sm" />
                                <span class="text-h6 q-ml-xs">{{ movie.rating }}/10</span>
                            </div>
                            <div class="release-date q-mr-lg">{{ movie.releaseDate }}</div>
                            <div class="duration q-mr-lg">{{ movie.duration }}</div>
                        </div>

                        <!-- Genres -->
                        <div class="genres q-mb-lg">
                            <q-chip v-for="genre in movie.genres" :key="genre" outline color="white" text-color="white"
                                class="q-mr-xs" size="sm">
                                {{ genre }}
                            </q-chip>
                        </div>

                        <!-- Description -->
                        <div class="hero-description text-white text-subtitle1 q-mb-xl"
                            v-html="getCleanDescription(movie.description)">
                        </div>

                        <!-- Characters -->
                        <div v-if="movie.character" class="characters text-grey-4 text-caption q-mb-md">
                            <strong>{{ t('hero.castLabel') }}</strong> {{ movie.character }}
                        </div>
                        <!-- Action buttons -->
                        <div class="hero-actions q-gutter-md">
                            <q-btn color="red" :label="t('hero.watchNow')" push icon="play_arrow" size="lg"
                                class="text-weight-bold" @click="watchMovie(movie)" />
                            <q-btn flat round color="white" icon="info" size="lg" @click="showInfo(movie)">
                                <q-tooltip>{{ t('hero.moreInfo') }}</q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-carousel-slide>

            <!-- Custom navigation controls -->
            <template v-slot:control>
                <q-carousel-control position="bottom-right" :offset="[18, 18]">
                    <div class="carousel-indicators row q-gutter-xs">
                        <q-btn v-for="(movie, index) in heroSectionStore.featuredMovies" :key="index" flat dense
                            :class="slide === index ? 'active-indicator' : 'inactive-indicator'" @click="slide = index">
                            <div class="indicator-content">
                                <div class="indicator-progress" :style="getProgressStyle(index)"></div>
                            </div>
                        </q-btn>
                    </div>
                </q-carousel-control>
            </template>
        </q-carousel>

        <!-- Loading state -->
        <div v-if="heroSectionStore.isLoading" class="loading-overlay absolute-full flex flex-center bg-black">
            <div class="text-center">
                <q-spinner-dots color="red" size="40px" />
                <div class="text-white q-mt-md">{{ t('hero.loadingFeaturedAnime') }}</div>
            </div>
        </div>

        <!-- Error state -->
        <div v-if="heroSectionStore.error" class="error-overlay absolute-full flex flex-center bg-black">
            <q-banner class="bg-negative text-white q-ma-lg">
                <q-icon name="error" size="md" class="q-mr-md" />
                {{ heroSectionStore.error }}
                <template v-slot:action>
                    <q-btn flat :label="t('hero.retry')" @click="heroSectionStore.fetchFeaturedMovies" />
                </template>
            </q-banner>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useHeroSectionStore } from 'src/stores/site-collections-store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const heroSectionStore = useHeroSectionStore()
const slide = ref(0)
const autoplay = ref(true)
let timer = null

const setupAutoplay = () => {
    if (timer) clearInterval(timer)

    timer = setInterval(() => {
        if (autoplay.value && heroSectionStore.featuredMovies.length > 0) {
            const nextIndex = (slide.value + 1) % heroSectionStore.featuredMovies.length
            slide.value = nextIndex
        }
    }, 6000)
    // 6 seconds interval 6000
}

const pauseAutoplay = () => {
    autoplay.value = false
}

const resumeAutoplay = () => {
    autoplay.value = true
}

const getProgressStyle = (index) => {
    return {
        width: slide.value === index ? '100%' : '0%',
        transition: 'width 6s linear'
    }
}

const getCleanDescription = (description) => {
    if (!description) return ''
    // Remove HTML tags and limit length
    const cleanText = description.replace(/<[^>]*>/g, '').trim()
    return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText
}

// Action handlers
const watchMovie = (movie) => {
    console.log('Watching:', movie.title)
    if (movie.playLink) {
        // Navigate to movie page
        window.location.href = movie.playLink
    }
}

const showInfo = (movie) => {
    console.log('Show info for:', movie.title)
    // Implement show info functionality
    // Show detailed movie information modal
}

onMounted(async () => {
    await heroSectionStore.fetchFeaturedMovies()

    if (heroSectionStore.featuredMovies.length > 0) {
        slide.value = 0
        setupAutoplay()
    }
})

onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})
</script>
<style lang="scss" scoped>
.hero-section {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.hero-content {
    width: 100%;
    max-width: 1200px;
}

.hero-overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 80%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0));
    z-index: 1;
}

.hero-text-content {
    position: relative;
    max-width: 800px;
}

.hero-title {
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1.1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.hero-description {
    max-width: 600px;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.hero-meta {
    font-size: 1.1rem;

    .rating-section {
        display: flex;
        align-items: center;
    }
}

.hero-actions {
    .q-btn {
        min-width: 140px;
    }
}

.carousel-indicators {
    .active-indicator {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;

        .indicator-content {
            width: 60px;
            height: 4px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 2px;
            overflow: hidden;

            .indicator-progress {
                height: 100%;
                background: #ff5722;
                border-radius: 2px;
            }
        }
    }

    .inactive-indicator {
        .indicator-content {
            width: 60px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
        }
    }
}

.loading-overlay,
.error-overlay {
    backdrop-filter: blur(10px);
}


// Responsive adjustments
@media (max-width: 768px) {
    .hero-content {
        padding: 1rem !important;
    }

    .hero-title {
        font-size: 2rem;
    }

    .hero-actions {
        .q-btn {
            min-width: 120px;
        }
    }
}
</style>