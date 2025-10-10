<template>
  <div class="content-tabs q-mt-xl" v-if="animeInfo">
    <q-card class="tabs-card shadow-2">
      <q-tabs
        v-model="activeTab"
        class="tabs-header"
        align="left"
        indicator-color="primary"
        active-color="primary"
        narrow-indicator
      >
        <q-tab name="overview" icon="info" :label="t('animeInfo.overview')" />
        <!-- <q-tab name="episodes" icon="playlist_play" :label="t('anime.episodes')" /> -->
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
                        <q-btn
                          flat
                          color="primary"
                          :label="t('common.showMore')"
                          @click="toggleDescription"
                          class="show-more-btn"
                        />
                      </div>
                      <div v-else>
                        {{ cleanDescription }}
                        <q-btn
                          v-if="isDescriptionLong && showFullDescription"
                          flat
                          color="primary"
                          :label="t('common.showLess')"
                          @click="toggleDescription"
                          class="show-more-btn"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Information Card -->
              <div class="col-12 col-md-4">
                <!-- Studios & Producers & Licensors Card -->
                <q-card
                  flat
                  bordered
                  class="genres-card q-mb-md"
                  v-if="hasStudiosOrProducers || debugMode"
                >
                  <q-card-section>
                    <div class="text-h5 text-color-white q-mb-md">
                      <q-icon name="business" class="q-mr-sm" />
                      {{ t('animeInfo.studiosProducersLicensors') }}
                    </div>

                    <!-- No data message -->
                    <div v-if="!hasValidData" class="text-center q-pa-md">
                      <q-icon name="info" size="2rem" color="grey-5" class="q-mb-md" />
                      <div class="text-grey-6">
                        {{
                          t('animeInfo.noStudiosProducersLicensorsAvailable') ||
                          'No studios, producers, or licensors information available for this anime.'
                        }}
                      </div>
                    </div>

                    <!-- Studios -->
                    <div v-if="formattedStudios.length" class="q-mb-md">
                      <div class="text-subtitle2 q-mb-sm">Studios:</div>
                      <div class="studios-list">
                        <q-chip
                          v-for="(studio, index) in formattedStudios"
                          :key="index"
                          clickable
                          @click="navigateToCompany(studio.link)"
                          class="genre-chip q-mr-sm q-mb-xs"
                        >
                          {{ studio.title }}
                        </q-chip>
                      </div>
                    </div>

                    <!-- Producers -->
                    <div v-if="formattedProducers.length" class="q-mb-md">
                      <div class="text-subtitle2 q-mb-sm">Producers:</div>
                      <div class="producers-list">
                        <q-chip
                          v-for="(producer, index) in formattedProducers"
                          :key="index"
                          clickable
                          @click="navigateToCompany(producer.link)"
                          class="genre-chip q-mr-sm q-mb-xs"
                        >
                          {{ producer.title }}
                        </q-chip>
                      </div>
                    </div>

                    <!-- Licensors -->
                    <div v-if="formattedLicensors.length">
                      <div class="text-subtitle2 q-mb-sm">Licensors:</div>
                      <div class="licensors-list">
                        <q-chip
                          v-for="(licensor, index) in formattedLicensors"
                          :key="index"
                          clickable
                          @click="navigateToCompany(licensor.link)"
                          class="genre-chip q-mr-sm q-mb-xs"
                        >
                          {{ licensor.title }}
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Anime Details Card (fallback if no studios/producers/licensors) -->
                <q-card flat bordered class="info-details-card" v-if="!hasStudiosOrProducers">
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
                          <span v-if="animeInfo.episodes.total">{{
                            animeInfo.episodes.total
                          }}</span>
                          <span v-else>{{
                            animeInfo.episodes.sub || animeInfo.episodes.dub || 'N/A'
                          }}</span>
                        </template>
                      </div>
                    </div>

                    <div class="info-item" v-if="animeInfo.status">
                      <div class="info-label">{{ t('anime.status') }}:</div>
                      <div class="info-value">
                        <q-chip
                          :color="getStatusColor(animeInfo.status)"
                          text-color="white"
                          size="sm"
                        >
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
              </div>
            </div>
          </div>
        </q-tab-panel>

        <!-- Episodes Tab -->
        <!-- <q-tab-panel name="episodes" class="q-pa-lg">
          <AnimeEpisodesListContent :episodeList="animeInfo.episodeList || []" />
        </q-tab-panel> -->

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
// import AnimeEpisodesListContent from './tabs/AnimeEpisodesListContent.vue'
import AnimeCharactersListContent from './tabs/AnimeCharactersListContent.vue'
import AnimeVideosListContent from './tabs/AnimeVideosListContent.vue'
import AnimeImagesListContent from './tabs/AnimeImagesListContent.vue'

const { t } = useI18n()

// const episodesList = ref([])

const props = defineProps({
  animeData: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const activeTab = ref('overview')
const showFullDescription = ref(false)

const animeInfo = computed(() => props.animeData)

const hasStudiosOrProducers = computed(() => {
  const info = animeInfo.value
  if (!info) return false

  const hasStudios = info.studios && Array.isArray(info.studios) && info.studios.length > 0
  const hasProducers = info.producers && Array.isArray(info.producers) && info.producers.length > 0
  const hasLicensors = info.licensors && Array.isArray(info.licensors) && info.licensors.length > 0

  return hasStudios || hasProducers || hasLicensors
})

const hasValidData = computed(() => {
  return (
    formattedStudios.value.length > 0 ||
    formattedProducers.value.length > 0 ||
    formattedLicensors.value.length > 0
  )
})

// Hàm navigate đến trang studio/producer/licensor
const navigateToCompany = (link) => {
  if (link) {
    router.push(link)
  }
}

const isDescriptionLong = computed(() => {
  const desc = animeInfo.value?.description
  if (!desc) return false
  const plainText = desc.replace(/<[^>]*>/g, '')
  return plainText.length > 200
})

const cleanDescription = computed(() => {
  const desc = animeInfo.value?.description
  if (!desc) return ''
  return desc
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim()
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

// const navigateToGenre = (genreSlug) => {
//   router.push(`/genre/${genreSlug}`)
// }

// ✅ Hàm xử lý dữ liệu (tái sử dụng cho studios, producers, licensors)
function formatCompanyData(list = []) {
  if (!Array.isArray(list)) return []

  return list
    .filter((item) => item)
    .map((item) => {
      let title = 'Unknown'
      let link = item?.link || null

      const titles = item?.titles

      if (Array.isArray(titles)) {
        // Trường hợp 2: titles là array
        // Ưu tiên title có type === "Default", nếu không lấy phần tử đầu tiên
        const defaultTitle = titles.find((t) => t.type === 'Default')?.title
        title = defaultTitle || titles[0]?.title || 'Unknown'
      } else if (titles && typeof titles === 'object') {
        // Trường hợp 1: titles là object
        title = titles.en || titles.title || Object.values(titles)[0] || 'Unknown'
      } else if (typeof titles === 'string') {
        // Trường hợp titles là string (ví dụ: "Unknown")
        title = titles
      }

      return {
        title,
        link,
      }
    })
  // Nếu muốn loại bỏ các item không hợp lệ thì bỏ comment dòng dưới:
  // .filter((item) => item.title && item.title !== 'Unknown')
}

// ✅ Dữ liệu đã được format
const formattedStudios = computed(() => formatCompanyData(animeInfo.value?.studios || []))
const formattedProducers = computed(() => formatCompanyData(animeInfo.value?.producers || []))
const formattedLicensors = computed(() => formatCompanyData(animeInfo.value?.licensors || []))
</script>
