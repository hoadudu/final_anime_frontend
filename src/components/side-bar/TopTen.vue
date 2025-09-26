<template>
    <div class="top-ten-section">
        <q-card flat bordered class="top-ten-card">
            <!-- Header -->
            <q-card-section class="top-ten-header">
                <div class="row items-center justify-between no-wrap">
                    <h3 class="text-h6 text-weight-bold q-my-none title-text">{{ t('topTen.title') }}</h3>
                    <q-btn-group class="top-ten-tabs">
                        <q-btn v-for="option in tabOptions" :key="option.value"
                            :class="{ 'active-tab': activeTab === option.value }" :label="option.label" size="sm"
                            no-caps dense @click="onTabChange(option.value)" />
                    </q-btn-group>
                </div>
            </q-card-section>

            <!-- Loading State -->
            <div v-if="isLoading" class="loading-container text-center q-py-xl">
                <q-spinner-dots color="primary" size="40px" />
                <div class="loading-text q-mt-md text-grey-5">{{ t('topTen.loading') }}</div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container text-center q-py-xl">
                <q-icon name="error" color="negative" size="48px" />
                <div class="error-message q-mt-md text-subtitle2">{{ t('topTen.error') }}</div>
                <q-btn color="primary" flat @click="fetchTopTenData" class="q-mt-md" icon="refresh">
                    {{ t('common.retry') }}
                </q-btn>
            </div>

            <!-- Empty State -->
            <div v-else-if="!currentData || currentData.length === 0" class="empty-container text-center q-py-xl">
                <q-icon name="movie" color="grey-6" size="64px" />
                <div class="empty-message q-mt-md text-subtitle2 text-grey-5">{{ t('topTen.noData') }}</div>
            </div>

            <!-- Content -->
            <q-card-section v-else class="q-pa-none">
                <q-list separator>
                    <q-item v-for="anime in currentData" :key="anime.id" clickable class="top-ten-item"
                        @click="navigateToAnime(anime)">
                        <!-- Rank Number -->
                        <q-item-section avatar class="rank-section">
                            <div class="rank-number" :class="getRankClass(anime.rank)">
                                {{ String(anime.rank).padStart(2, '0') }}
                            </div>
                        </q-item-section>

                        <!-- Anime Poster -->
                        <q-item-section avatar class="poster-section">
                            <q-img :src="anime.poster" :alt="anime.title" ratio="2/3" class="anime-poster"
                                spinner-color="primary" @error="handleImageError">
                                <template v-slot:error>
                                    <div class="absolute-full flex flex-center bg-grey-8">
                                        <q-icon name="broken_image" size="24px" color="grey-5" />
                                    </div>
                                </template>
                            </q-img>
                        </q-item-section>

                        <!-- Anime Details -->
                        <q-item-section class="q-pa-md">
                            <q-item-label class="anime-title" lines="2">
                                {{ anime.title }}
                            </q-item-label>
                            <q-item-label caption class="anime-meta">
                                <div class="meta-badges">
                                    <q-badge v-if="anime.subCount" color="blue" text-color="white" class="meta-badge"
                                        size="xs">
                                        <q-icon name="closed_caption" size="10px" class="q-mr-xs" />
                                        {{ anime.subCount }}
                                    </q-badge>

                                    <q-badge v-if="anime.dubCount" color="green" text-color="white"
                                        class="meta-badge q-ml-xs" size="xs">
                                        <q-icon name="mic" size="10px" class="q-mr-xs" />
                                        {{ anime.dubCount }}
                                    </q-badge>

                                    <q-badge v-if="anime.totalEpisodes" color="orange" text-color="white"
                                        class="meta-badge q-ml-xs" size="xs">
                                        {{ anime.totalEpisodes }}
                                    </q-badge>
                                </div>
                                <div class="anime-type q-mt-xs">{{ anime.type }}</div>
                            </q-item-label>
                        </q-item-section>

                        <!-- Tooltip -->
                        <MovieTooltip :movie="transformAnimeForTooltip(anime)" />
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import MovieTooltip from 'src/components/MovieTooltip.vue'
import { useSiteSidebarTopTenStore } from 'src/stores/site-sidebar-top-ten-store'

// Composables
const router = useRouter()
const { t } = useI18n()
const topTenStore = useSiteSidebarTopTenStore()

// Reactive data
const activeTab = ref('month')

// Computed properties
const currentData = computed(() => {
    return topTenStore.topTenData[activeTab.value] || []
})

const isLoading = computed(() => topTenStore.isLoading)
const error = computed(() => topTenStore.error)

// Tab options
const tabOptions = computed(() => [
    { label: t('topTen.today'), value: 'day' },
    { label: t('topTen.week'), value: 'week' },
    { label: t('topTen.month'), value: 'month' },
    { label: t('topTen.year'), value: 'year' },
    { label: t('topTen.all'), value: 'all' }
])

// Methods
const fetchTopTenData = () => {
    topTenStore.fetchTopTen()
}


const onTabChange = (newTab) => {
    activeTab.value = newTab
    // Could add analytics or other side effects here
}

const getRankClass = (rank) => {
    if (rank <= 3) return 'rank-top'
    if (rank <= 5) return 'rank-high'
    return 'rank-normal'
}

const navigateToAnime = (anime) => {
    if (anime.slug) {
        router.push(`/anime/${anime.slug}`)
    } else if (anime.id) {
        router.push(`/anime/${anime.id}`)
    }
}

const handleImageError = (event) => {
    console.warn('Failed to load image:', event.target.src)
}

const transformAnimeForTooltip = (anime) => {
    return {
        title: anime.title,
        titles: [], // Could be extended with alternative titles
        description: anime.description || '',
        aired: anime.year || '',
        rank: anime.rank ? `#${anime.rank}` : '',
        genres: anime.genres || []
    }
}

// Lifecycle
onMounted(() => {
    topTenStore.fetchTopTen()
})
</script>

<style lang="scss" scoped>
.top-ten-section {
    width: 100%;
}

.top-ten-card {
    background-color: #1e1e2a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.top-ten-header {
    background-color: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem;

    .title-text {
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
        flex-shrink: 0;
        margin-right: 1rem;
    }

    .row {
        gap: 1rem;
    }
}

.top-ten-tabs {
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;

    .q-btn {
        font-size: 0.7rem;
        min-width: 35px;
        padding: 4px 6px;
        border-radius: 0;
        margin: 0;
        border: none;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        background: transparent;
        color: rgba(255, 255, 255, 0.7);

        &:first-child {
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
        }

        &:last-child {
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            border-right: none;
        }

        &.active-tab {
            background-color: var(--q-primary);
            color: white;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }

        &.active-tab:hover {
            background-color: var(--q-primary);
        }
    }
}

.loading-container,
.error-container,
.empty-container {
    background-color: #1e1e2a;
    color: white;
}

.top-ten-item {
    background-color: #1e1e2a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    &:last-child {
        border-bottom: none;
    }
}

.rank-section {
    min-width: 40px;
    max-width: 40px;
    padding-right: 0.5rem;
}

.rank-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.85rem;
    color: white;

    &.rank-top {
        background: linear-gradient(135deg, #ff6b6b, #feca57);
    }

    &.rank-high {
        background: linear-gradient(135deg, #48cae4, #0096c7);
    }

    &.rank-normal {
        background: rgba(255, 255, 255, 0.2);
    }
}

.poster-section {
    min-width: 50px;
    max-width: 50px;
    padding-right: 0.75rem;
}

.anime-poster {
    width: 50px;
    height: 75px;
    border-radius: 4px;
    overflow: hidden;
}

.anime-title {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.3;
    word-break: break-word;
}

.anime-meta {
    margin-top: 0.25rem;
}

.meta-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
}

.meta-badge {
    font-size: 0.7rem;

    .q-icon {
        font-size: 10px;
    }
}

.anime-type {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 500;
}

// Responsive adjustments
@media (max-width: 768px) {
    .top-ten-header {
        padding: 0.75rem;

        .title-text {
            font-size: 1.1rem;
            margin-right: 0.5rem;
        }

        .row {
            gap: 0.5rem;
        }
    }

    .top-ten-tabs {
        .q-btn {
            font-size: 0.65rem;
            min-width: 28px;
            padding: 2px 4px;
        }
    }

    .anime-poster {
        width: 40px;
        height: 60px;
    }

    .poster-section {
        min-width: 40px;
        max-width: 40px;
    }

    .anime-title {
        font-size: 0.85rem;
    }

    .rank-number {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
    }
}

// Dark theme overrides
:deep(.q-item__section--avatar) {
    .q-img {
        border-radius: 4px;
    }
}

:deep(.q-list--separator > .q-item-type + .q-item-type) {
    border-top-color: rgba(255, 255, 255, 0.05);
}
</style>