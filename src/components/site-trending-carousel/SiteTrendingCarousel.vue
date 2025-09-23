<template>
    <div class="trending-carousel-section q-py-lg">
        <div class="container q-px-md">
            <!-- Section Header -->
            <div class="section-header q-mb-lg text-center">
                <h2 class="text-h4 text-weight-bold text-white q-mb-sm gradient-title">
                    {{ t('trending') }}
                </h2>
                <p class="text-subtitle1 text-grey-4">
                    {{ t('trendingDescription') }}
                </p>
            </div>
            <!-- Loading State -->
            <div v-if="trendingStore.isLoading" class="flex flex-center q-py-xl">
                <div class="text-center">
                    <q-spinner-dots color="primary" size="40px" />
                    <div class="text-white q-mt-md">{{ t('loadingTrending') }}</div>
                </div>
            </div>
            <!-- Error State -->
            <div v-if="trendingStore.error" class="flex flex-center q-py-xl">
                <q-banner class="bg-negative text-white">
                    <q-icon name="error" size="md" class="q-mr-md" />
                    {{ trendingStore.error }}
                    <template v-slot:action>
                        <q-btn flat :label="t('retry')" @click="trendingStore.fetchTrendingMovies" />
                    </template>
                </q-banner>
            </div>
            <!-- Trending Carousel -->
            <div v-if="!trendingStore.isLoading && !trendingStore.error">
                <q-carousel v-model="slide" animated arrows infinite :autoplay="autoplay" transition-prev="slide-right"
                    transition-next="slide-left" class="trending-carousel-container" swipeable
                    @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay">
                    <q-carousel-slide v-for="(chunk, index) in movieChunks" :key="index" :name="index" class="q-px-sm">
                        <div class="row q-col-gutter-md">
                            <div v-for="movie in chunk" :key="movie.id" class="col-xs-6 col-sm-4 col-md-3 col-lg-2"
                                @click="navigateToMovie(movie)">
                                <q-card flat class="trending-card cursor-pointer">

                                    <!-- Poster Image -->
                                    <div class="poster-container">
                                        <!-- Rank Badge - di chuyển vào trong poster-container -->
                                        <div class="rank-badge">
                                            <span class="rank-number">{{ String(movie.rank).padStart(2, '0') }}</span>
                                        </div>

                                        <q-img :src="movie.posterUrl" :alt="movie.title" class="poster-image"
                                            loading="lazy" :ratio="2 / 3" spinner-color="primary" spinner-size="40px">
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
                                    <q-card-section class="q-pa-sm text-center">
                                        <div
                                            class="text-subtitle2 text-weight-medium text-black line-clamp-2 movie-title">
                                            {{ movie.title }}
                                        </div>
                                    </q-card-section>
                                    <!-- Tooltip with detailed info -->
                                    <q-tooltip class="bg-dark text-white" :offset="[10, 10]" max-width="300px">
                                        <div class="tooltip-content">
                                            <div class="text-weight-bold q-mb-xs">{{ movie.title }}</div>
                                            <div v-if="movie.description" class="text-caption q-mb-sm">
                                                {{ truncateDescription(movie.description) }}
                                            </div>
                                            <div class="tooltip-meta">
                                                <div v-if="movie.releaseDate" class="q-mb-xs">
                                                    <strong>{{ t('releaseDate') }}:</strong> {{ movie.releaseDate }}
                                                </div>
                                                <div v-if="movie.rating" class="q-mb-xs">
                                                    <strong>{{ t('rating') }}:</strong> {{ movie.rating }}
                                                </div>
                                                <div v-if="movie.genres && movie.genres.length" class="q-mb-xs">
                                                    <strong>{{ t('genres') }}:</strong>
                                                    <div class="row q-gutter-xs q-mt-xs">
                                                        <q-chip v-for="genre in movie.genres.slice(0, 3)" :key="genre"
                                                            dense color="primary" text-color="white" size="sm">
                                                            {{ genre }}
                                                        </q-chip>
                                                        <q-chip v-if="movie.genres.length > 3" dense outline
                                                            color="grey" text-color="grey" size="sm">
                                                            +{{ movie.genres.length - 3 }}
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTrendingCarouselStore } from '../../stores/site-collections-store'

const { t } = useI18n()
const trendingStore = useTrendingCarouselStore()

// State
const slide = ref(0)
const autoplay = ref(true)
let autoplayTimer = null
const windowWidth = ref(window.innerWidth) // Thêm reactive window width
const itemsPerSlide = ref({
    xs: 2, // mobile
    sm: 3, // tablet
    md: 4, // desktop medium
    lg: 6, // desktop large
})

// Computed
const movieChunks = computed(() => {
    const movies = trendingStore.trendingMovies
    const chunkSize = getChunkSize()
    const chunks = []
    for (let i = 0; i < movies.length; i += chunkSize) {
        chunks.push(movies.slice(i, i + chunkSize))
    }
    return chunks
})

const getChunkSize = () => {
    const width = windowWidth.value // Sử dụng reactive width
    if (width <= 600) return itemsPerSlide.value.xs
    if (width <= 1024) return itemsPerSlide.value.sm
    if (width <= 1440) return itemsPerSlide.value.md
    return itemsPerSlide.value.lg
}

// Methods
const handleResize = () => {
    windowWidth.value = window.innerWidth
}

const navigateToMovie = (movie) => {
    console.log('Navigating to movie:', movie.title)
    // router.push(`/movie/${movie.id}`)
}

const truncateDescription = (description, maxLength = 120) => {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).trim() + '...'
}

const pauseAutoplay = () => {
    autoplay.value = false
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
    }
}

const resumeAutoplay = () => {
    if (!autoplayTimer) {
        autoplay.value = true
        startAutoplay()
    }
}

const startAutoplay = () => {
    autoplayTimer = setInterval(() => {
        slide.value = (slide.value + 1) % movieChunks.value.length
    }, 5000)
}

// Lifecycle
onMounted(async () => {
    // Thêm resize listener
    window.addEventListener('resize', handleResize)

    await trendingStore.fetchTrendingMovies()
    if (movieChunks.value.length > 1) {
        startAutoplay()
    }
})

onBeforeUnmount(() => {
    // Cleanup
    if (autoplayTimer) {
        clearInterval(autoplayTimer)
    }
    window.removeEventListener('resize', handleResize)
})
</script>


<style lang="scss" scoped>
.trending-carousel-section {
    background: transparent;
    min-height: 400px;
}

.trending-carousel-container {
    .q-carousel__arrow {
        background-color: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        color: white;
        transition: all 0.3s ease;

        &:hover {
            background-color: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        &--left {
            left: 10px;
        }

        &--right {
            right: 10px;
        }
    }
}

.trending-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%; // Đảm bảo tất cả card có cùng chiều cao
    min-height: 320px; // Tăng min-height để chứa title 2 dòng
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 107, 107, 0.4);

        .hover-overlay {
            opacity: 1;
        }

        .rank-badge {
            transform: scale(1.05);
        }

        .poster-image {
            transform: scale(1.03);
        }
    }
}


.rank-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    transition: transform 0.3s ease;
    box-sizing: border-box;
}


.poster-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px 8px 0 0;
    aspect-ratio: 2/3;
    flex: 1; // Cho phép poster container chiếm không gian còn lại
}

// Thêm CSS cho line-clamp và movie title
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.movie-title {
    height: 2.6em; // Cố định chiều cao cho 2 dòng (1.3em * 2)
    min-height: 2.6em;
    max-height: 2.6em;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
}

// Đảm bảo card-section có kích thước cố định
.q-card-section {
    flex-shrink: 0; // Không cho phép section này co lại
    min-height: 60px; // Đảm bảo có đủ không gian cho 2 dòng text
}

.hover-overlay {
    background: rgba(0, 0, 0, 0.7);
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(4px);
}

.gradient-title {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
</style>