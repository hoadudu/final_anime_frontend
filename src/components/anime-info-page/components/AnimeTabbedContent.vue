<template>
    <div class="content-tabs q-mt-xl" v-if="animeInfo">
        <q-card class="tabs-card shadow-2">
            <q-tabs v-model="activeTab" class="tabs-header" align="left" indicator-color="primary"
                active-color="primary" narrow-indicator>
                <q-tab name="overview" icon="info" :label="t('animeInfo.overview')" />
                <q-tab name="episodes" icon="playlist_play" :label="t('anime.episodes')" />
                <q-tab name="characters" icon="people" :label="t('anime.characters')" />
                <q-tab name="videos" icon="video_library" :label="t('anime.trailers')" />
                <q-tab name="images-gallery" icon="image" :label="t('animePage.imagesGallery')" />
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
                                            {{ t('anime.synopsis') }}
                                        </div>
                                        <div class="synopsis-text">
                                            <div v-if="isDescriptionLong && !showFullDescription">
                                                {{ cleanDescription.substring(0, 200) }}...
                                                <q-btn flat color="primary" :label="t('common.showMore')"
                                                    @click="toggleDescription" class="show-more-btn" />
                                            </div>
                                            <div v-else>
                                                {{ cleanDescription }}
                                                <q-btn v-if="isDescriptionLong && showFullDescription" flat
                                                    color="primary" :label="t('common.showLess')"
                                                    @click="toggleDescription" class="show-more-btn" />
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
                                            {{ t('animeInfo.animeDetails') }}
                                        </div>

                                        <div class="info-item" v-if="animeInfo.type">
                                            <div class="info-label">{{ t('anime.type') }}:</div>
                                            <div class="info-value">{{ animeInfo.type }}</div>
                                        </div>

                                        <div class="info-item" v-if="animeInfo.episodes">
                                            <div class="info-label">{{ t('anime.episodes') }}:</div>
                                            <div class="info-value">
                                                <template v-if="typeof animeInfo.episodes === 'number'">
                                                    {{ animeInfo.episodes }}
                                                </template>
                                                <template v-else>
                                                    <span v-if="animeInfo.episodes.total">{{ animeInfo.episodes.total }}</span>
                                                    <span v-else>{{ animeInfo.episodes.sub || animeInfo.episodes.dub || 'N/A' }}</span>
                                                </template>
                                            </div>
                                        </div>

                                        <div class="info-item" v-if="animeInfo.status">
                                            <div class="info-label">{{ t('anime.status') }}:</div>
                                            <div class="info-value">
                                                <q-chip :color="getStatusColor(animeInfo.status)" text-color="white"
                                                    size="sm">
                                                    {{ animeInfo.status }}
                                                </q-chip>
                                            </div>
                                        </div>

                                        <div class="info-item" v-if="airedString">
                                            <div class="info-label">{{ t('anime.aired') }}:</div>
                                            <div class="info-value">{{ airedString }}</div>
                                        </div>

                                        <div class="info-item" v-if="animeInfo.duration">
                                            <div class="info-label">{{ t('anime.duration') }}:</div>
                                            <div class="info-value">{{ animeInfo.duration }}</div>
                                        </div>

                                        <div class="info-item" v-if="animeInfo.rating">
                                            <div class="info-label">{{ t('anime.rating') }}:</div>
                                            <div class="info-value">{{ animeInfo.rating }}</div>
                                        </div>

                                        <div class="info-item" v-if="animeInfo.source">
                                            <div class="info-label">{{ t('anime.source') }}:</div>
                                            <div class="info-value">{{ animeInfo.source }}</div>
                                        </div>
                                    </q-card-section>
                                </q-card>

                                <!-- Genres Card -->
                                <q-card flat bordered class="genres-card q-mt-md" v-if="Array.isArray(animeInfo.genres) && animeInfo.genres.length">
                                    <q-card-section>
                                        <div class="text-h6 q-mb-md">
                                            <q-icon name="category" class="q-mr-sm" />
                                            {{ t('genres.genre') }}
                                        </div>
                                        <div class="genres-list">
                                            <q-chip v-for="(genre, index) in animeInfo.genres" :key="genre.mal_id || genre.id || index"
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
                    <AnimeEpisodesListContent :episodeList="animeInfo.episodeList || []" />
                </q-tab-panel>

                <!-- Characters Tab -->
                <q-tab-panel name="characters" class="q-pa-lg">
                    <AnimeCharactersListContent :characters="animeInfo.characters || []" />
                </q-tab-panel>

                <!-- Videos Tab -->
                <q-tab-panel name="videos" class="q-pa-lg">
                    <AnimeVideosListContent :videos="animeInfo.videos || []" />
                </q-tab-panel>

                <!-- Images Gallery Tab -->
                <q-tab-panel name="images-gallery" class="q-pa-lg">
                    <AnimeImagesListContent :images="animeInfo.images || []" />

                </q-tab-panel>
            </q-tab-panels>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AnimeEpisodesListContent from './tabs/AnimeEpisodesListContent.vue'
import AnimeCharactersListContent from './tabs/AnimeCharactersListContent.vue'
import AnimeVideosListContent from './tabs/AnimeVideosListContent.vue'
import AnimeImagesListContent from './tabs/AnimeImagesListContent.vue'

const { t } = useI18n()

// const episodesList = ref([])

const props = defineProps({
    animeData: {
        type: Object,
        required: true
    }
})

const router = useRouter()
const activeTab = ref('overview')
const showFullDescription = ref(false)

const animeInfo = computed(() => props.animeData)

const isDescriptionLong = computed(() => {
    const desc = animeInfo.value?.description
    if (!desc) return false
    const plainText = desc.replace(/<[^>]*>/g, '')
    return plainText.length > 200
})

const cleanDescription = computed(() => {
    const desc = animeInfo.value?.description
    if (!desc) return ''
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
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

const navigateToGenre = (genreSlug) => {
    router.push(`/genre/${genreSlug}`)
}
</script>
