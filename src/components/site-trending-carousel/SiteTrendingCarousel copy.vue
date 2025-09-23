<template>
    <q-section class="trending-section">
        <h2 class="trending-title">Trending</h2>

        <div v-if="trendingStore.isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="40px" />
            <div class="loading-text">Loading trending anime...</div>
        </div>

        <div v-else-if="trendingStore.error" class="error-state">
            <div class="error-message">{{ trendingStore.error }}</div>
            <q-btn color="primary" flat @click="refreshTrending">Retry</q-btn>
        </div>

        <div v-else class="trending-container">
            <q-btn round flat dense class="nav-button nav-button-left" icon="chevron_left" @click="scrollLeft"
                :disable="!canScrollLeft" />

            <div class="trending-scroll" ref="scrollContainer" @scroll="updateScrollButtons">
                <q-list class="trending-items" dense>
                    <q-item v-if="!trendingStore.trendingMovies || trendingStore.trendingMovies.length === 0"
                        class="no-data-message">
                        No trending anime available
                    </q-item>
                    <q-item v-for="(item, index) in trendingStore.trendingMovies" :key="item.id || index" clickable
                        class="trending-item q-pa-none" @click="handleItemClick(item)">
                        <q-card flat bordered class="item-image full-width">
                            <q-img :src="getItemImage(item)" :alt="item.title" referrerpolicy="no-referrer"
                                @error="handleImageError" height="280px" fit="cover" class="full-height">
                                <div class="item-overlay absolute-bottom">
                                    <div class="item-number">{{ String(index + 1).padStart(2, '0') }}</div>
                                    <div class="item-title">{{ item.title }}</div>
                                </div>
                            </q-img>
                        </q-card>
                    </q-item>
                </q-list>
            </div>

            <q-btn round flat dense class="nav-button nav-button-right" icon="chevron_right" @click="scrollRight"
                :disable="!canScrollRight" />
        </div>
    </q-section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTrendingCarouselStore } from 'src/stores/site-collections-store'
import {
    QSpinnerDots,
    QBtn,
    QCard,
    QImg,
    QItem,
    QList
} from 'quasar'

const router = useRouter()
const trendingStore = useTrendingCarouselStore()
// Fix: Don't destructure reactive refs from the store
// They need to be accessed as trendingStore.trendingMovies to maintain reactivity

const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const fallbackImage = 'https://dummyimage.com/200x280/333333/ffffff?text=Not+Available'



onMounted(async () => {
    console.log('Mounting SiteTrendingCarousel')
    await trendingStore.fetchTrendingMovies()
    console.log('Trending data fetched:', trendingStore.trendingMovies)

    // Use this to test with dummy data if the API doesn't return data
    // addDummyData()

    nextTick(() => {
        updateScrollButtons()
        setupScrollListener()
    })
})

function setupScrollListener() {
    window.addEventListener('resize', updateScrollButtons)
    return () => window.removeEventListener('resize', updateScrollButtons)
}

function scrollLeft() {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
    }
}

function scrollRight() {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
    }
}

function updateScrollButtons() {
    const container = scrollContainer.value
    if (container) {
        canScrollLeft.value = container.scrollLeft > 0
        canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
    }
}

function refreshTrending() {
    trendingStore.fetchTrendingMovies()
}

function handleImageError(event) {
    event.target.src = fallbackImage
}

function getItemImage(item) {
    // Try different possible image properties
    return item.posterUrl || item.poster || item.thumbnail || item.image || fallbackImage
}

function handleItemClick(item) {
    // Navigate to anime detail page
    if (item.id) {
        // Check if route exists
        try {
            router.push({ name: 'anime-detail', params: { id: item.id } })
        } catch (e) {
            console.error('Route navigation error:', e)
            // Try with slug as fallback
            if (item.slug) {
                router.push({ path: `/anime/${item.slug}` })
            }
        }
    } else if (item.slug) {
        router.push({ path: `/anime/${item.slug}` })
    }
}
</script>

<style scoped>
.trending-section {
    width: 100%;
    min-height: 350px;
    position: relative;
}

.trending-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: #0c5281;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 280px;
    width: 100%;
    gap: 1rem;
}

.loading-text,
.error-message,
.no-data-message {
    color: #ffffff;
    font-size: 1rem;
    opacity: 0.8;
}

.trending-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.7) !important;
    color: white !important;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.nav-button:hover:not([disabled]) {
    background: rgba(0, 0, 0, 0.9) !important;
    transform: translateY(-50%) scale(1.1);
}

.nav-button[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
}

.nav-button i {
    font-size: 20px;
}

.nav-button-left {
    left: -24px;
}

.nav-button-right {
    right: -24px;
}

.trending-scroll {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.trending-scroll::-webkit-scrollbar {
    display: none;
}

.trending-items {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
    background: transparent;
}

.trending-item {
    flex-shrink: 0;
    width: 220px;
    cursor: pointer;
    transition: transform 0.3s ease;
    background: transparent;
}

.trending-item:hover {
    transform: translateY(-8px);
}

.item-image {
    width: 100%;
    height: 280px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    background: transparent;
    transition: transform 0.3s ease;
}

.trending-item:hover .item-image {
    transform: scale(1.05);
}

.item-overlay {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 2rem 1rem 1rem;
    color: white;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.item-number {
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-size: 3rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    line-height: 1;
    z-index: 2;
}

.item-title {
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.3;
    margin-top: 0.5rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    writing-mode: vertical-rl;
    text-orientation: mixed;
    position: absolute;
    right: 1rem;
    top: 1rem;
    bottom: 1rem;
    width: 1.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 2;
}

@media (max-width: 768px) {
    .trending-container {
        margin: 0 -20px;
        padding: 0 20px;
    }

    .nav-button {
        display: none !important;
    }

    .trending-items {
        gap: 0.3rem;
    }

    .trending-item {
        width: 160px !important;
    }

    .item-image {
        height: 220px !important;
    }

    .item-number {
        font-size: 2.5rem;
    }

    .item-title {
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .trending-title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .trending-item {
        width: 140px;
    }

    .item-image {
        height: 200px;
    }

    .item-number {
        font-size: 2rem;
    }
}
</style>
