<template>
    <div class="site-anime-featured q-py-lg">
        <div class="q-container q-px-md">
            <div class="row q-col-gutter-md">
                <!-- Top Airing -->
                <div class="col-12 col-sm-6 col-md-3">
                    <q-card flat bordered class="anime-featured-card">
                        <q-card-section class="featured-header">
                            <h5 class="q-my-none">{{ t('featured.topAiring') }}</h5>
                        </q-card-section>
                        <q-list class="featured-items" padding>
                            <q-item v-for="(anime, index) in topAiring" :key="`airing-${index}`" class="featured-item"
                                clickable @click="navigateToAnime(anime)">
                                <q-item-section avatar>
                                    <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                                    <q-item-label caption>
                                        <div class="item-meta">
                                            <span class="meta-tag sub-tag">
                                                <q-icon name="closed_caption" size="xs" />
                                                <span>{{ anime.sub }}</span>
                                            </span>
                                            <span class="meta-tag dub-tag" v-if="anime.dub">
                                                <q-icon name="mic" size="xs" />
                                                <span>{{ anime.dub }}</span>
                                            </span>
                                            <span class="meta-tag type-tag text-uppercase">{{ anime.type }}</span>
                                        </div>
                                    </q-item-label>
                                </q-item-section>
                                <MovieTooltip :movie="transformItemForTooltip(anime)" />
                            </q-item>
                        </q-list>
                        <div class="view-more-container">
                            <q-btn flat no-caps color="primary" class="full-width view-more-btn"
                                icon-right="chevron_right" :label="t('common.viewMore')"
                                @click="navigateToSection('top-airing')" />
                        </div>
                    </q-card>
                </div>

                <!-- Most Popular -->
                <div class="col-12 col-sm-6 col-md-3">
                    <q-card flat bordered class="anime-featured-card">
                        <q-card-section class="featured-header">
                            <h5 class="q-my-none">{{ t('featured.mostPopular') }}</h5>
                        </q-card-section>
                        <q-list class="featured-items" padding>
                            <q-item v-for="(anime, index) in mostPopular" :key="`popular-${index}`"
                                class="featured-item" clickable @click="navigateToAnime(anime)">
                                <q-item-section avatar>
                                    <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                                    <q-item-label caption>
                                        <div class="item-meta">
                                            <span class="meta-tag sub-tag">
                                                <q-icon name="closed_caption" size="xs" />
                                                <span>{{ anime.sub }}</span>
                                            </span>
                                            <span class="meta-tag dub-tag" v-if="anime.dub">
                                                <q-icon name="mic" size="xs" />
                                                <span>{{ anime.dub }}</span>
                                            </span>
                                            <span class="meta-tag type-tag">{{ anime.type }}</span>
                                        </div>
                                    </q-item-label>
                                </q-item-section>
                                <MovieTooltip :movie="transformItemForTooltip(anime)" />
                            </q-item>
                        </q-list>
                        <div class="view-more-container">
                            <q-btn flat no-caps color="primary" class="full-width view-more-btn"
                                icon-right="chevron_right" :label="t('common.viewMore')"
                                @click="navigateToSection('most-popular')" />
                        </div>
                    </q-card>
                </div>

                <!-- Most Liked -->
                <div class="col-12 col-sm-6 col-md-3">
                    <q-card flat bordered class="anime-featured-card">
                        <q-card-section class="featured-header">
                            <h5 class="q-my-none">{{ t('featured.mostLiked') }}</h5>
                        </q-card-section>
                        <q-list class="featured-items" padding>
                            <q-item v-for="(anime, index) in mostLiked" :key="`liked-${index}`" class="featured-item"
                                clickable @click="navigateToAnime(anime)">
                                <q-item-section avatar>
                                    <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                                    <q-item-label caption>
                                        <div class="item-meta">
                                            <span class="meta-tag sub-tag">
                                                <q-icon name="closed_caption" size="xs" />
                                                <span>{{ anime.sub }}</span>
                                            </span>
                                            <span class="meta-tag dub-tag" v-if="anime.dub">
                                                <q-icon name="mic" size="xs" />
                                                <span>{{ anime.dub }}</span>
                                            </span>
                                            <span class="meta-tag type-tag">{{ anime.type }}</span>
                                        </div>
                                    </q-item-label>
                                </q-item-section>
                                <MovieTooltip :movie="transformItemForTooltip(anime)" />
                            </q-item>
                        </q-list>
                        <div class="view-more-container">
                            <q-btn flat no-caps color="primary" class="full-width view-more-btn"
                                icon-right="chevron_right" :label="t('common.viewMore')"
                                @click="navigateToSection('most-favorite')" />
                        </div>
                    </q-card>
                </div>

                <!-- Latest Completed -->
                <div class="col-12 col-sm-6 col-md-3">
                    <q-card flat bordered class="anime-featured-card">
                        <q-card-section class="featured-header">
                            <h5 class="q-my-none">{{ t('featured.latestCompleted') }}</h5>
                        </q-card-section>
                        <q-list class="featured-items" padding>
                            <q-item v-for="(anime, index) in latestCompleted" :key="`completed-${index}`"
                                class="featured-item" clickable @click="navigateToAnime(anime)">
                                <q-item-section avatar>
                                    <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                                    <q-item-label caption>
                                        <div class="item-meta">
                                            <span class="meta-tag sub-tag">
                                                <q-icon name="closed_caption" size="xs" />
                                                <span>{{ anime.sub }}</span>
                                            </span>
                                            <span class="meta-tag dub-tag" v-if="anime.dub">
                                                <q-icon name="mic" size="xs" />
                                                <span>{{ anime.dub }}</span>
                                            </span>
                                            <span class="meta-tag type-tag">{{ anime.type }}</span>
                                        </div>
                                    </q-item-label>
                                </q-item-section>
                                <MovieTooltip :movie="transformItemForTooltip(anime)" />
                            </q-item>

                        </q-list>
                        <div class="view-more-container">
                            <q-btn flat no-caps color="primary" class="full-width view-more-btn"
                                icon-right="chevron_right" :label="t('common.viewMore')"
                                @click="navigateToSection('latest-completed')" />
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
    useHomePageAnimeFeaturedTopAiringData,
    useHomePageAnimeFeaturedMostPopularData,
    useHomePageAnimeFeaturedMostLikedData,
    useHomePageAnimeFeaturedLatestCompletedData
} from 'src/composables/home-page/useHomePageData'

import MovieTooltip from 'src/components/MovieTooltip.vue'

const { t } = useI18n()
const router = useRouter()
const { data: topAiringResponse } = useHomePageAnimeFeaturedTopAiringData()
const { data: mostPopularResponse } = useHomePageAnimeFeaturedMostPopularData()
const { data: mostLikedResponse } = useHomePageAnimeFeaturedMostLikedData()
const { data: latestCompletedResponse } = useHomePageAnimeFeaturedLatestCompletedData()

// Extract the actual data arrays from the API response
const topAiring = computed(() => topAiringResponse.value?.data || [])
const mostPopular = computed(() => mostPopularResponse.value?.data || [])
const mostLiked = computed(() => mostLikedResponse.value?.data || [])
const latestCompleted = computed(() => latestCompletedResponse.value?.data || [])

// watchEffect(() => {
//     console.log('topAiring:', topAiring.value, 'Array?', Array.isArray(topAiring.value))
//     console.log('mostPopular:', mostPopular.value, 'Array?', Array.isArray(mostPopular.value))
//     console.log('mostLiked:', mostLiked.value, 'Array?', Array.isArray(mostLiked.value))
//     console.log('latestCompleted:', latestCompleted.value, 'Array?', Array.isArray(latestCompleted.value))
// })

function navigateToAnime(anime) {
    if (anime.slug) {
        router.push(`/anime/${anime.slug}`)
    }
}

function transformItemForTooltip(item) {
    return {
        title: item.title,
        titles: item.titles || [],  // Thêm hỗ trợ cho trường titles
        description: item.description || item.summary || item.overview || '',
        aired: item.year ? `${item.year}` : (item.release_date || item.aired || ''),
        rank: item.rating ? `${item.rating}/10` : '',
        genres: item.genres || []
    }
}

function navigateToSection(section) {
    router.push(`/anime/${section}`)
}


</script>

<style scoped>
.site-anime-featured {
    background-color: #1e1e2a;
    color: white;
    padding: 1.5rem 0;
}

.anime-featured-card {
    background-color: #1e1e2a;
    border: none !important;
    border-radius: 0;
    margin-bottom: 1rem;
}

.featured-header {
    padding: 0.5rem 0;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0;
}

/* Removed header-content style as it's no longer needed */

.featured-header h5 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #fff;
    margin: 0;
    padding: 0;
}

.featured-items {
    padding: 0;
}

.featured-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.5rem 0;
}

.anime-poster {
    width: 50px;
    height: 75px;
    border-radius: 4px;
    overflow: hidden;
}

.item-title {
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
}

.item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.meta-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.25rem;
    border-radius: 2px;
    background-color: rgba(255, 255, 255, 0.1);
    margin-right: 0.25rem;
}

.meta-tag i {
    margin-right: 0.25rem;
    font-size: 0.7rem;
}

.sub-tag {
    color: #4caf50;
}

.dub-tag {
    color: #2196f3;
}

.type-tag {
    color: #ff9800;
}

.view-more-container {
    padding: 0.5rem 0;
    margin-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.view-more-btn {
    font-size: 0.85rem;
    opacity: 0.8;
    transition: all 0.2s ease;
}

.view-more-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
}

/* Quasar customization */
.q-item {
    min-height: auto;
    padding: 0.5rem 0;
}

.q-item__section--avatar {
    min-width: 50px;
    padding-right: 0.75rem;
}

.q-item__section--side {
    padding-left: 0.75rem;
}

/* Responsive styling */
@media (max-width: 768px) {
    .q-item__section--avatar {
        min-width: 40px;
    }

    .anime-poster {
        width: 40px;
        height: 60px;
    }

    .item-title {
        font-size: 0.8rem;
    }

    .item-meta {
        font-size: 0.7rem;
    }
}
</style>
