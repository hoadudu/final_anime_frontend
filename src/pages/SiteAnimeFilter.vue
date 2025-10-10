<template>
  <q-page class="anime-filter-page">
    <div class="page-container q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%">
      <!-- ========== BREADCRUMB NAVIGATION ========== -->
      <div class="breadcrumb-container q-mt-md q-mb-sm">
        <q-breadcrumbs class="breadcrumb-nav" active-color="primary">
          <q-breadcrumbs-el
            icon="home"
            :label="t('common.home')"
            :to="{ name: 'site-home' }"
            class="breadcrumb-item"
          />
          <q-breadcrumbs-el
            icon="filter_list"
            :label="t('filter.filterAnime')"
            class="breadcrumb-current"
          />
        </q-breadcrumbs>
      </div>

      <!-- ========== HEADER SECTION ========== -->
      <div class="filter-header q-mt-md q-mb-md">
        <h1 class="filter-title text-h4 text-weight-bold q-mb-sm">
          <q-icon name="filter_list" size="32px" class="q-mr-sm" />
          {{ t('filter.filterResults') }}
        </h1>

        <!-- Filter Summary -->
        <div class="filter-summary text-body1 text-grey-6">
          <FilterSummary :active-filters="activeFilters" @filter-change="handleFilterChange" />
        </div>

        <!-- Tổng số kết quả -->
        <div v-if="!isLoading && filterData" class="filter-meta text-body1 text-grey-6">
          {{ t('filter.totalFound', { total: filterData.data.pagination.total || 0 }) }}
        </div>
      </div>

      <!-- ========== DESKTOP FILTER UI (DROPDOWNS) ========== -->
      <div class="desktop-filter-bar q-mb-md">
        <!-- Type Filter -->
        <div class="filter-group">
          <q-select
            v-model="activeFilters.type"
            :options="typeOptions"
            :placeholder="t('filter.type')"
            emit-value
            map-options
            outlined
            dense
            color="primary"
            @update:model-value="handleFilterChange({ type: $event })"
            class="type-dropdown"
          />
        </div>

        <!-- Status Filter -->
        <div class="filter-group">
          <q-select
            v-model="activeFilters.status"
            :options="statusOptions"
            :placeholder="t('filter.status')"
            emit-value
            map-options
            outlined
            dense
            color="primary"
            @update:model-value="handleFilterChange({ status: $event })"
            class="status-dropdown"
          />
        </div>

        <!-- Season Filter -->
        <div class="filter-group">
          <q-select
            v-model="activeFilters.season"
            :options="seasonOptions"
            :placeholder="t('filter.season')"
            emit-value
            map-options
            outlined
            dense
            color="primary"
            @update:model-value="handleFilterChange({ season: $event })"
            class="season-dropdown"
          />
        </div>

        <!-- Year Filter -->
        <div class="filter-group">
          <q-select
            v-model="activeFilters.year"
            :options="yearOptions"
            :placeholder="t('filter.year')"
            emit-value
            map-options
            outlined
            dense
            color="primary"
            @update:model-value="handleFilterChange({ year: $event })"
            class="year-dropdown"
          />
        </div>

        <!-- Sort Filter -->
        <div class="filter-group">
          <q-select
            v-model="activeFilters.sort"
            :options="sortOptions"
            :placeholder="t('filter.sortBy')"
            emit-value
            map-options
            outlined
            dense
            color="primary"
            @update:model-value="handleFilterChange({ sort: $event })"
            class="sort-dropdown"
          />
        </div>

        <!-- Genres Filter (Desktop) -->
        <q-select
          v-model="activeFilters.genres"
          :options="genreOptions"
          :loading="genresLoading"
          outlined
          dense
          multiple
          emit-value
          map-options
          option-value="id"
          option-label="name"
          class="genres-dropdown"
          @update:model-value="handleGenreChange"
        >
          <template v-slot:selected>
            <div v-if="activeFilters.genres.length === 0" class="text-grey-10 text-weight-bold">
              {{ t('filter.genres') }}
            </div>
            <div v-else class="flex flex-wrap gap-1">
              <q-chip
                v-for="opt in genreOptions.filter((o) => activeFilters.genres.includes(o.id))"
                :key="opt.id"
                removable
                dense
                color="primary"
                text-color="white"
                @remove="
                  handleFilterChange({
                    genres: activeFilters.genres.filter((id) => id !== opt.id),
                  })
                "
              >
                {{ opt.name }}
              </q-chip>
            </div>
          </template>
          <template v-slot:after-options>
            <div
              v-if="activeFilters.genres.length >= 3"
              class="text-center q-pa-sm text-warning text-caption"
            >
              {{ t('filter.maxGenresReached') }}
            </div>
          </template>
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              :disable="
                activeFilters.genres.length >= 3 && !activeFilters.genres.includes(scope.opt.id)
              "
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Reset Button -->
        <div class="filter-group reset-filter-btn">
          <q-btn
            color="negative"
            icon="refresh"
            :label="t('filter.resetAll')"
            @click="resetAllFilters"
            outline
            rounded
            class="reset-button"
            :disable="!hasActiveFilters"
          />
        </div>

        <!-- Mobile Filter Button -->
        <div class="filter-group mobile-filter-btn">
          <q-btn
            color="primary"
            icon="filter_list"
            :label="t('filter.filter')"
            @click="openMobileFilter"
            unelevated
            rounded
            class="mobile-filter-button"
          />
        </div>
      </div>

      <!-- ========== MAIN LAYOUT: 2 COLUMNS ========== -->
      <div class="row q-col-gutter-md">
        <!-- ========== LEFT COLUMN: FILTER RESULTS ========== -->
        <div class="col-12 col-lg-9">
          <!-- ========== LOADING STATE ========== -->
          <div v-if="isLoading" class="anime-grid">
            <div v-for="i in 12" :key="i" class="anime-card-skeleton">
              <q-card flat bordered class="full-height">
                <q-skeleton height="300px" />
                <q-card-section>
                  <q-skeleton type="text" width="80%" />
                  <q-skeleton type="text" width="60%" class="q-mt-xs" />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- ========== ERROR STATE ========== -->
          <div v-else-if="isError" class="error-state text-center q-py-xl">
            <q-icon name="error_outline" size="80px" color="negative" />
            <h3 class="text-h5 q-mt-md">{{ t('filter.errorOccurred') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">{{ t('filter.errorMessage') }}</p>
            <q-btn
              color="primary"
              :label="t('common.tryAgain')"
              icon="refresh"
              @click="refetch"
              class="q-mt-md"
              unelevated
              rounded
            />
          </div>

          <!-- ========== EMPTY RESULTS ========== -->
          <div
            v-else-if="filterData && filterData.data.posts && filterData.data.posts.length === 0"
            class="empty-results text-center q-py-xl"
          >
            <q-icon name="filter_list" size="80px" color="grey-6" />
            <h3 class="text-h5 q-mt-md text-grey-7">{{ t('filter.noResults') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">
              {{ t('filter.tryDifferentFilters') }}
            </p>
          </div>

          <!-- ========== ANIME RESULTS GRID (Using MovieCard) ========== -->
          <div v-else-if="filterData && filterData.data.posts && filterData.data.posts.length > 0">
            <div class="anime-grid">
              <MovieCard
                v-for="anime in filterData.data.posts"
                :key="anime.id"
                :anime="anime"
                :show-age-rating="false"
                :show-episode-badges="false"
                :show-status-badge="true"
                :show-type-badge="false"
                :show-subtitle="true"
                :show-genres="true"
                :max-genres="3"
                :overlay-text="t('filter.viewDetails')"
                :poster-ratio="'3/4'"
                @click="navigateToAnime"
              />
            </div>

            <!-- ========== PAGINATION ========== -->
            <div
              v-if="filterData.data.pagination.last_page > 1"
              class="pagination-container q-mt-xl q-mb-lg"
            >
              <div class="pagination-wrapper">
                <!-- First Button -->
                <q-btn
                  outline
                  color="primary"
                  icon="first_page"
                  :label="t('common.first')"
                  :disable="currentPage <= 1 || isLoading"
                  @click="changePage(1)"
                  class="pagination-btn"
                  unelevated
                />

                <!-- Previous Button -->
                <q-btn
                  outline
                  color="primary"
                  icon="keyboard_arrow_left"
                  :label="t('common.previous')"
                  :disable="currentPage <= 1 || isLoading"
                  @click="changePage(currentPage - 1)"
                  class="pagination-btn"
                  unelevated
                />

                <!-- Page Info -->
                <div class="page-info">
                  <q-chip color="primary" text-color="white" size="lg" class="page-chip">
                    {{
                      t('common.pageInfo', {
                        current: currentPage,
                        total: filterData.data.pagination.last_page,
                      })
                    }}
                  </q-chip>
                </div>

                <!-- Next Button -->
                <q-btn
                  outline
                  color="primary"
                  icon-right="keyboard_arrow_right"
                  :label="t('common.next')"
                  :disable="currentPage >= filterData.data.pagination.last_page || isLoading"
                  @click="changePage(currentPage + 1)"
                  class="pagination-btn"
                  unelevated
                />

                <!-- Last Button -->
                <q-btn
                  outline
                  color="primary"
                  icon-right="last_page"
                  :label="t('common.last')"
                  :disable="currentPage >= filterData.data.pagination.last_page || isLoading"
                  @click="changePage(filterData.data.pagination.last_page)"
                  class="pagination-btn"
                  unelevated
                />
              </div>

              <!-- Total Results -->
              <div class="total-results text-center q-mt-md text-grey-6">
                {{
                  filterData && filterData.data.pagination.total > 0
                    ? t('filter.showing', {
                        from: Math.max(1, (currentPage - 1) * (resultsPerPage || 24) + 1),
                        to: Math.min(
                          currentPage * (resultsPerPage || 24),
                          filterData.data.pagination.total,
                        ),
                        total: filterData.data.pagination.total,
                      })
                    : ''
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- ========== RIGHT COLUMN: SIDEBAR ========== -->
        <div class="col-12 col-lg-3">
          <!-- Enhanced Sidebar -->
          <div class="sidebar-container">
            <!-- Top Ten Component -->
            <TopTen />
            <!-- Additional Sidebar Content (Optional) -->
            <div class="sidebar-extra q-mt-md">
              <!-- Có thể thêm các widget khác ở đây -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta } from 'quasar'
import { useAnimeFilterPageData } from 'src/composables/anime-filter-page/useAnimeFilterPageData.js'
import { useGenreStore } from 'src/stores/site-genre.js'
import MovieCard from 'src/components/MovieCard.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'
import FilterSummary from 'src/components/anime-filter-page/FilterSummary.vue'

// ========== COMPOSABLES ==========
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const genreStore = useGenreStore()

// ========== REACTIVE DATA ==========
const currentPage = ref(1)
const resultsPerPage = ref(24)
const mobileFilterOpen = ref(false)

// ========== DESKTOP FILTER STATE ==========

// ========== FILTER STATE ==========
const activeFilters = ref({
  type: null,
  status: null,
  season: null,
  year: null,
  genres: [],
  sort: null,
})

// ========== FILTER OPTIONS FOR DESKTOP UI ==========
const typeOptions = [
  { label: t('filter.allTypes'), value: null },
  { label: 'TV', value: 'tv' },
  { label: 'Movie', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'ONA', value: 'ona' },
  { label: 'Special', value: 'special' },
]

const statusOptions = [
  { label: t('filter.allStatuses'), value: null },
  { label: t('filter.airing'), value: 'airing' },
  { label: t('filter.completed'), value: 'completed' },
  { label: t('filter.upcoming'), value: 'upcoming' },
]

const seasonOptions = [
  { label: t('filter.allStatuses'), value: null },
  { label: 'Spring', value: 'spring' },
  { label: 'Summer', value: 'summer' },
  { label: 'Fall', value: 'fall' },
  { label: 'Winter', value: 'winter' },
]

// Generate year options (from 1980 to current year + 2)
const currentYear = new Date().getFullYear()
const yearOptions = [
  { label: t('filter.allStatuses'), value: null },
  ...Array.from({ length: currentYear - 1980 + 3 }, (_, i) => {
    const year = currentYear + 2 - i
    return { label: year.toString(), value: year.toString() }
  }),
]

const sortOptions = [
  { label: t('filter.sortDefault'), value: null },
  { label: t('filter.sortLatest'), value: 'latest' },
  { label: t('filter.sortOldest'), value: 'oldest' },
  { label: t('filter.sortTitle'), value: 'title' },
  { label: t('filter.sortRating'), value: 'rating' },
  { label: t('filter.sortViews'), value: 'views' },
]

// ========== COMPUTED PROPERTIES ==========
const genreOptions = computed(() => genreStore.genres)
const genresLoading = computed(() => genreStore.isLoading)

// Kiểm tra có filter nào đang active không
const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.type !== null ||
    activeFilters.value.status !== null ||
    activeFilters.value.season !== null ||
    activeFilters.value.year !== null ||
    activeFilters.value.genres.length > 0 ||
    activeFilters.value.sort !== null
  )
})

// ========== FETCH DATA WITH useAnimeFilterPageData ==========
const {
  data: filterData,
  isLoading,
  isError,
  refetch,
} = useAnimeFilterPageData({
  page: currentPage,
  sort: computed(() => activeFilters.value.sort),
  type: computed(() => activeFilters.value.type),
  status: computed(() => activeFilters.value.status),
  season: computed(() => activeFilters.value.season),
  year: computed(() => activeFilters.value.year),
  genres: computed(() => activeFilters.value.genres.join(',') || null),
})

// ========== LIFECYCLE & WATCHERS ==========
onMounted(() => {
  // Lấy các filter từ URL query khi component mount
  parseFiltersFromURL()
  // Fetch genres for dropdown
  genreStore.fetchGenres()
})

watch(
  () => route.query,
  () => {
    parseFiltersFromURL()
    scrollToTop()
  },
  { deep: true },
)

// ========== METHODS ==========

/**
 * Parse filters từ URL query parameters
 */
const parseFiltersFromURL = () => {
  const query = route.query

  activeFilters.value = {
    type: query.type || null,
    status: query.status || null,
    season: query.season || null,
    year: query.year || null,
    genres: query.genres ? query.genres.split(',').map((id) => parseInt(id)) : [],
    sort: query.sort || null,
  }

  currentPage.value = parseInt(query.page || '1', 10)
}

/**
 * Điều hướng đến trang chi tiết anime
 */
const navigateToAnime = (anime) => {
  if (anime.link) {
    router.push(anime.link)
  }
}

/**
 * Thay đổi trang
 */
const changePage = (newPage) => {
  if (newPage < 1 || (filterData.value && newPage > filterData.value.data.pagination.last_page))
    return

  currentPage.value = newPage
  updateURL()
  scrollToTop()
}

/**
 * Xử lý thay đổi filter
 */
const handleFilterChange = (newFilters) => {
  activeFilters.value = { ...activeFilters.value, ...newFilters }
  currentPage.value = 1 // Reset về trang 1 khi filter thay đổi
  updateURL()
  scrollToTop()
}

/**
 * Xử lý thay đổi genres với giới hạn tối đa 3
 */
const handleGenreChange = (selectedGenres) => {
  // Giới hạn tối đa 3 thể loại
  if (selectedGenres.length <= 3) {
    handleFilterChange({ genres: selectedGenres })
  }
}

/**
 * Reset tất cả filters về mặc định
 */
const resetAllFilters = () => {
  activeFilters.value = {
    type: null,
    status: null,
    season: null,
    year: null,
    genres: [],
    sort: null,
  }
  currentPage.value = 1
  updateURL()
  scrollToTop()
}

/**
 * Cập nhật URL với các filter hiện tại
 */
const updateURL = () => {
  const query = {}

  if (activeFilters.value.type) query.type = activeFilters.value.type
  if (activeFilters.value.status) query.status = activeFilters.value.status
  if (activeFilters.value.season) query.season = activeFilters.value.season
  if (activeFilters.value.year) query.year = activeFilters.value.year
  if (activeFilters.value.genres.length > 0) query.genres = activeFilters.value.genres.join(',')
  if (activeFilters.value.sort) query.sort = activeFilters.value.sort
  if (currentPage.value > 1) query.page = currentPage.value

  router.push({
    query: Object.keys(query).length > 0 ? query : undefined,
  })
}

/**
 * Scroll lên đầu trang (smooth)
 */
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
}

/**
 * Mở mobile filter modal
 */
const openMobileFilter = () => {
  mobileFilterOpen.value = true
}

// ========== SEO META TAGS ==========
const metaTitle = computed(() => {
  const filters = activeFilters.value
  let title = t('filter.filterAnime')

  if (filters.type) title += ` - ${filters.type}`
  if (filters.status) title += ` - ${filters.status}`
  if (filters.year) title += ` - ${filters.year}`

  return `${title} - ${t('common.siteName')}`
})

const metaDescription = computed(() => {
  if (filterData.value?.data?.pagination?.total > 0) {
    const total = filterData.value.data.pagination.total
    const filters = activeFilters.value

    let description = t('filter.foundResults', { count: total })

    if (filters.type) description += ` ${t('filter.forType')} ${filters.type}`
    if (filters.status) description += ` ${t('filter.withStatus')} ${filters.status}`
    if (filters.year) description += ` ${t('filter.fromYear')} ${filters.year}`

    return description
  }

  return t('filter.filterAnimeDescription')
})

const metaKeywords = computed(() => {
  const keywords = ['anime', t('filter.filterAnime'), t('common.siteName')]

  if (activeFilters.value.type) keywords.push(activeFilters.value.type)
  if (activeFilters.value.status) keywords.push(activeFilters.value.status)
  if (activeFilters.value.year) keywords.push(activeFilters.value.year)

  return keywords.join(', ')
})

// Set meta tags using useMeta
useMeta(() => ({
  title: metaTitle.value,
  meta: {
    description: {
      name: 'description',
      content: metaDescription.value,
    },
    keywords: {
      name: 'keywords',
      content: metaKeywords.value,
    },
    'og:title': {
      property: 'og:title',
      content: metaTitle.value,
    },
    'og:description': {
      property: 'og:description',
      content: metaDescription.value,
    },
    'og:type': {
      property: 'og:type',
      content: 'website',
    },
    'og:url': {
      property: 'og:url',
      content: window.location.href,
    },
    'twitter:card': {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    'twitter:title': {
      name: 'twitter:title',
      content: metaTitle.value,
    },
    'twitter:description': {
      name: 'twitter:description',
      content: metaDescription.value,
    },
  },
}))
</script>

<style lang="scss" scoped>
// ========== PAGE CONTAINER ==========
.anime-filter-page {
  min-height: 100vh;
  background: #121212; // Match body background
  padding-bottom: 60px;
}

.page-container {
  padding-top: 20px;
}

// ========== BREADCRUMB NAVIGATION ==========
.breadcrumb-container {
  margin-bottom: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.breadcrumb-nav {
  font-size: 14px;

  :deep(.q-breadcrumbs__separator) {
    color: rgba(255, 255, 255, 0.3);
  }
}

.breadcrumb-item {
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;

  &:hover {
    color: #00d4ff;
  }

  :deep(.q-icon) {
    color: #00d4ff;
  }
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;

  :deep(.q-icon) {
    color: #00d4ff;
  }
}

// ========== HEADER SECTION ==========
.filter-header {
  .filter-title {
    color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;

    .q-icon {
      color: #00d4ff;
    }
  }

  .filter-summary {
    margin: 8px 0;
  }

  .filter-meta {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }
}

// ========== ANIME GRID ==========
.anime-grid {
  display: grid;
  gap: 16px;

  // Auto-fit với minmax để tự động điều chỉnh số cột
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));

  // Giới hạn tối đa để tránh quá rộng
  max-width: 100%;

  @media (min-width: 1280px) {
    // Desktop > 1280px: 6 cột
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
  }

  @media (min-width: 1024px) and (max-width: 1279px) {
    // Desktop 1024-1279px: 5 cột
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    // Tablet: 4 cột
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  @media (min-width: 600px) and (max-width: 767px) {
    // Tablet nhỏ: 3 cột
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (min-width: 400px) and (max-width: 599px) {
    // Mobile landscape: 2 cột
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (max-width: 399px) {
    // Mobile nhỏ: 2 cột với gap nhỏ hơn
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

// ========== PAGINATION ==========
.pagination-container {
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;

    .pagination-btn {
      font-weight: 600;
      padding: 10px 24px;
      border-radius: 12px;
      border: 2px solid currentColor;
    }

    .page-info {
      .page-chip {
        font-size: 1rem;
        font-weight: 700;
        padding: 8px 20px;
        border-radius: 12px;
      }
    }
  }

  .total-results {
    font-size: 0.95rem;
  }
}

// ========== ERROR & EMPTY STATES ==========
.error-state,
.empty-results {
  padding: 80px 20px;

  h3 {
    color: rgba(255, 255, 255, 0.95);
  }

  p {
    max-width: 500px;
    margin: 12px auto;
    color: rgba(255, 255, 255, 0.5);
  }

  .q-icon {
    opacity: 0.3;
  }
}

// ========== SKELETON LOADING ==========
.anime-card-skeleton {
  .q-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
  }
}

// ========== SIDEBAR ==========
.sidebar-container {
  position: sticky;
  top: 80px; // Stick to top khi scroll (adjust theo header height)

  @media (max-width: 1023px) {
    position: relative;
    top: 0;
  }
}

// ========== DESKTOP FILTER BAR (DROPDOWNS) ==========
.desktop-filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: rgba(225, 191, 154, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;

  .filter-group {
    flex: 1 1 auto;
    min-width: 140px;
    position: relative;

    // Responsive adjustments for dropdowns
    @media (max-width: 1200px) {
      min-width: 120px;
    }

    @media (max-width: 900px) {
      flex: 1 1 45%;
      min-width: 140px;
    }

    @media (max-width: 600px) {
      flex: 1 1 100%;
      min-width: auto;
    }

    .type-dropdown,
    .status-dropdown,
    .season-dropdown,
    .year-dropdown,
    .sort-dropdown,
    .genres-dropdown {
      .q-field__control {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:before {
          border-color: #00d4ff;
        }

        &:hover {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
        }

        &.q-field--focused {
          border-color: #00d4ff;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
          background: rgba(0, 212, 255, 0.05);
        }

        &.q-field--error {
          border-color: #ff6b6b;

          &:before {
            border-color: #ff6b6b;
          }
        }
      }

      .q-field__native {
        color: rgba(255, 255, 255, 0.95);
        font-size: 14px;
        font-weight: 500;

        span {
          color: rgba(255, 255, 255, 0.95);
        }
      }

      .q-field__label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        font-weight: 500;
      }

      .q-field__append {
        .q-icon {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      // Dropdown menu styling
      .q-menu {
        background: rgba(18, 18, 18, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

        .q-virtual-scroll__content {
          .q-item {
            color: rgba(255, 255, 255, 0.9);
            transition: all 0.2s ease;

            &:hover {
              background: rgba(0, 212, 255, 0.1);
              color: #00d4ff;
            }

            &.q-item--active {
              background: rgba(0, 212, 255, 0.15);
              color: #00d4ff;
            }
          }
        }
      }

      // Multiple selection chips
      .q-field__input {
        .q-chip {
          background: rgba(0, 212, 255, 0.2);
          color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 212, 255, 0.3);

          .q-chip__icon {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }

    .mobile-filter-button {
      display: none;
      min-width: auto;
    }

    .reset-button {
      min-width: 140px;
      font-weight: 600;
      border-width: 2px;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: rgba(255, 107, 107, 0.1);
        border-color: #ff6b6b;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }

  @media (max-width: 767px) {
    display: none;
  }
}

// ========== RESPONSIVE ADJUSTMENTS ==========
@media (max-width: 1023px) {
  // Mobile & Tablet: Sidebar xuống dưới
  .row {
    flex-direction: column; // Thứ tự: results trước, sidebar sau

    .col-lg-9,
    .col-lg-3 {
      width: 100%;
      max-width: 100%;
    }
  }
}

// Mobile filter button (visible only on mobile)
@media (max-width: 767px) {
  .desktop-filter-bar {
    .filter-group {
      &:not(.mobile-filter-btn) {
        display: none;
      }

      .mobile-filter-button {
        display: block;
      }
    }

    .reset-filter-btn {
      display: none;
    }
  }
}

@media (max-width: 767px) {
  .breadcrumb-nav {
    font-size: 12px;

    :deep(.q-breadcrumbs__el) {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .filter-header {
    .filter-title {
      font-size: 1.5rem;

      .q-icon {
        width: 24px;
        height: 24px;
        font-size: 24px;
      }
    }
  }

  .pagination-wrapper {
    .pagination-btn {
      padding: 8px 16px;
      font-size: 0.85rem;
    }

    .page-chip {
      font-size: 0.85rem !important;
      padding: 6px 16px !important;
    }
  }

  .anime-grid {
    gap: 12px;
  }
}

// ========== DARK THEME ENHANCEMENTS ==========
:deep(.q-skeleton) {
  background: rgba(255, 255, 255, 0.05);

  &::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  }
}
</style>
