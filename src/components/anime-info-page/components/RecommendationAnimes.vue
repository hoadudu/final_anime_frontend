<template>
  <div class="recommendations-section">
    <!-- Header -->
    <div class="section-header q-mb-md" v-if="title">
      <h3 class="text-h6 text-weight-bold q-my-none">{{ title }}</h3>
    </div>

    <!-- Loading State - Only shown when recommendations prop is not provided and we're falling back to fetch -->
    <div v-if="isLoading && !props.recommendations.length" class="q-gutter-md row">
      <div v-for="n in skeletonCount" :key="n" class="col-6 col-sm-4 col-md-3 col-lg-2">
        <q-card flat bordered class="rec-card skeleton-card">
          <q-skeleton type="rect" class="poster-skeleton" />
          <q-card-section class="q-pa-sm">
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="60%" class="q-mt-xs" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Error State - Only shown when recommendations prop is not provided and we're falling back to fetch -->
    <div v-else-if="error && !props.recommendations.length" class="text-center q-pa-lg">
      <q-icon name="error" color="negative" size="42px" />
      <div class="q-mt-sm text-subtitle2">{{ $t('common.error') }}</div>
      <q-btn flat color="primary" icon="refresh" class="q-mt-sm" @click="refetch">{{
        $t('common.retry')
        }}</q-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="!recommendations || recommendations.length === 0" class="text-center q-pa-lg">
      <q-icon name="movie" color="grey-6" size="42px" />
      <div class="q-mt-sm text-subtitle2 text-grey-5">{{ emptyText }}</div>
    </div>

    <!-- Grid -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="rec in recommendations" :key="rec.id || rec.slug || rec.link || rec.title"
        class="col-6 col-sm-4 col-md-3 col-lg-2">
        <q-card flat bordered class="rec-card" @click="navigateTo(rec)" clickable>
          <div class="poster-wrapper">
            <q-img :src="getImage(rec)" :alt="rec.title" ratio="2/3" class="poster-img" spinner-color="primary"
              loading="lazy" crossorigin="anonymous" @error="onPosterError(rec)">
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-9 text-grey-5">
                  <q-icon name="broken_image" size="32px" />
                </div>
              </template>
            </q-img>
            <div v-if="rec.score" class="score-badge">
              <q-icon name="star" size="14px" class="q-mr-xs" />
              {{ rec.score }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="rec-title" :title="rec.title">{{ rec.title }}</div>
            <div class="rec-meta">
              <q-badge v-if="rec.type" color="blue-grey-6" text-color="white" dense class="q-mr-xs">{{ rec.type
                }}</q-badge>
              <q-badge v-if="rec.year" color="grey-7" text-color="white" dense>{{
                rec.year
                }}</q-badge>
            </div>
          </q-card-section>

          <!-- Desktop tooltip -->
          <MovieTooltip :movie="transformForTooltip(rec)" />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MovieTooltip from 'src/components/MovieTooltip.vue'
import { useAnimeRecommendationsData } from 'src/composables/anime-info-page/useAnimeInfoPageData'

const props = defineProps({
  animeId: {
    type: [String, Number],
    required: true,
  },
  recommendations: {
    type: Array,
    required: false, // When using top-down approach, this will be passed in
    default: () => []
  },
  title: {
    type: String,
    default: 'Recommendations',
  },
  emptyText: {
    type: String,
    default: 'Không có gợi ý phù hợp',
  },
  limit: {
    type: Number,
    default: 12,
  },
})

const router = useRouter()

// For backwards compatibility and fallback - only used if recommendations prop is not provided
const { data, isLoading, error, refetch } = props.recommendations.length > 0
  ? { data: ref(null), isLoading: ref(false), error: ref(null), refetch: () => { } }
  : useAnimeRecommendationsData(computed(() => props.animeId))

// Use recommendations from props if available, otherwise fallback to fetched data
const recommendations = computed(() => {
  if (props.recommendations && props.recommendations.length > 0) {
    // Use the data passed down from parent
    return props.limit > 0 ? props.recommendations.slice(0, props.limit) : props.recommendations
  } else {
    // Fallback to fetched data (for backwards compatibility)
    const raw = data?.value
    if (!raw) return []
    // Support both array or { data: [] }
    const list = Array.isArray(raw) ? raw : raw.data || raw.items || []
    return props.limit > 0 ? list.slice(0, props.limit) : list
  }
})

const skeletonCount = 12

const getImage = (rec) => {
  const nested =
    rec?.images?.jpg?.image_url ||
    rec?.images?.webp?.image_url ||
    rec?.image?.large ||
    rec?.image?.medium ||
    rec?.poster?.large ||
    rec?.poster?.medium

  return rec.poster || rec.image || rec.image_url || rec.coverImage || rec.thumbnail || nested || ''
}

const onPosterError = (rec) => {
  // Handle poster loading errors silently
  console.log(`Failed to load image for ${rec.title || rec.id || rec.slug}`);

}

const buildLink = (rec) => {
  if (rec.link) return rec.link
  const slug =
    rec.slug ||
    (rec.title
      ? rec.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      : 'anime')
  const id = rec.id || rec.animeId || rec.mal_id || ''
  return id ? `/thong-tin/${slug}-${id}` : '/home'
}

const navigateTo = (rec) => {
  const to = buildLink(rec)
  router.push(to).catch(() => { })
}

const transformForTooltip = (rec) => {
  return {
    title: rec.title,
    titles: rec.titles || [],
    description: rec.description || rec.synopsis || '',
    aired: rec.aired || rec.year || '',
    views: rec.views || '',
    rank: rec.rank || '',
    genres: rec.genres || [],
  }
}
</script>

<style lang="scss" scoped>
.recommendations-section {
  width: 100%;
}

.section-header {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;

  h3 {
    color: white;
  }
}

.rec-card {
  background-color: #1e1e2a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  }
}

.skeleton-card {
  .poster-skeleton {
    width: 100%;
    padding-top: calc(100% * 3 / 2); // ratio 2/3
    background: #242436;
  }
}

.poster-wrapper {
  position: relative;
  width: 100%;
  // Ensure consistent 2:3 box even before image loads
  aspect-ratio: 2/3;

  // Fallback for browsers lacking aspect-ratio support
  &::before {
    content: '';
    display: block;
    padding-top: 150%;
  }
}

.poster-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  // Ensure Quasar image inner element fills
  :deep(.q-img__image) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
}

.score-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd166;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(2px);
}

.rec-title {
  color: white;
  font-size: 0.7rem;
  line-height: 1.3;
  font-weight: 600;
  display: -webkit-box;
  line-clamp: 1;
  /* standard property for compatibility */
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.rec-meta {
  margin-top: 6px;
}

// Dark theme list separators and inner elements
::deep(.q-badge) {
  border-radius: 6px;
}
</style>
