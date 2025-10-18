<template>
  <q-page :class="[pagePadding, 'search-page']">
    <div class="page-container q-mx-auto" style="max-width: 1920px; width: 100%">
      <!-- ========== BREADCRUMB NAVIGATION ========== -->
      <div class="breadcrumb-container q-mt-md q-mb-sm">
        <q-breadcrumbs class="breadcrumb-nav" active-color="primary">
          <q-breadcrumbs-el icon="home" :label="t('common.home')" :to="{ name: 'site-home' }" class="breadcrumb-item" />
          <q-breadcrumbs-el icon="search" :label="currentKeyword ? t('common.search') + ': ' + currentKeyword : t('common.search')
            " class="breadcrumb-current" />
        </q-breadcrumbs>
      </div>

      <!-- ========== HEADER SECTION ========== -->
      <div class="search-header q-mt-md q-mb-md">
        <!-- Nếu không có keyword, hiển thị hướng dẫn -->
        <div v-if="!currentKeyword" class="empty-state text-center q-py-xl">
          <q-icon name="search" size="80px" color="grey-6" />
          <h2 class="text-h4 q-mt-md text-grey-7">{{ t('search.enterKeyword') }}</h2>
          <p class="text-body1 text-grey-6 q-mt-sm">{{ t('search.startSearching') }}</p>
        </div>

        <!-- Nếu có keyword, hiển thị thông tin tìm kiếm -->
        <div v-else>
          <h1 class="search-title text-h4 text-weight-bold q-mb-sm">
            <q-icon name="search" size="32px" class="q-mr-sm" />
            {{ t('search.resultsFor') }} "<span class="keyword-highlight">{{ currentKeyword }}</span>"
          </h1>

          <!-- Hiển thị tổng số kết quả -->
          <div v-if="!isLoading && searchData" class="search-meta text-body1 text-grey-6">
            {{ t('search.totalFound', { total: searchData.count || 0 }) }}
          </div>
        </div>
      </div>

      <!-- ========== MAIN LAYOUT: 2 COLUMNS ========== -->
      <div v-if="currentKeyword" class="row q-col-gutter-md">
        <!-- ========== LEFT COLUMN: SEARCH RESULTS ========== -->
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
            <h3 class="text-h5 q-mt-md">{{ t('search.errorOccurred') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">{{ t('search.errorMessage') }}</p>
            <q-btn color="primary" :label="t('common.tryAgain')" icon="refresh" @click="refetch" class="q-mt-md"
              unelevated rounded />
          </div>

          <!-- ========== EMPTY RESULTS ========== -->
          <div v-else-if="searchData && searchData.results && searchData.results.length === 0"
            class="empty-results text-center q-py-xl">
            <q-icon name="search_off" size="80px" color="grey-6" />
            <h3 class="text-h5 q-mt-md text-grey-7">{{ t('search.noResults') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">
              {{ t('search.tryDifferentKeyword') }}
            </p>
          </div>

          <!-- ========== ANIME RESULTS GRID (Using MovieCard) ========== -->
          <div v-else-if="searchData && searchData.results && searchData.results.length > 0">
            <div class="anime-grid">
              <MovieCard v-for="anime in searchData.results" :key="anime.id" :anime="anime" :show-age-rating="false"
                :show-episode-badges="false" :show-status-badge="true" :show-type-badge="false" :show-subtitle="true"
                :show-genres="true" :max-genres="3" :overlay-text="t('search.viewDetails')" :poster-ratio="'3/4'"
                @click="navigateToAnime" />
            </div>

            <!-- ========== PAGINATION ========== -->
            <div v-if="searchData.total_pages > 1" class="pagination-container q-mt-xl q-mb-lg">
              <div class="pagination-wrapper">
                <!-- First Button -->
                <q-btn outline color="primary" icon="first_page" :label="t('common.first')"
                  :disable="currentPage <= 1 || isLoading" @click="changePage(1)" class="pagination-btn" unelevated />

                <!-- Previous Button -->
                <q-btn outline color="primary" icon="keyboard_arrow_left" :label="t('common.previous')"
                  :disable="currentPage <= 1 || isLoading" @click="changePage(currentPage - 1)" class="pagination-btn"
                  unelevated />

                <!-- Page Info -->
                <div class="page-info">
                  <q-chip color="primary" text-color="white" size="lg" class="page-chip">
                    {{
                      t('common.pageInfo', { current: currentPage, total: searchData.total_pages })
                    }}
                  </q-chip>
                </div>

                <!-- Next Button -->
                <q-btn outline color="primary" icon-right="keyboard_arrow_right" :label="t('common.next')"
                  :disable="!searchData.has_more || isLoading" @click="changePage(currentPage + 1)"
                  class="pagination-btn" unelevated />

                <!-- Last Button -->
                <q-btn outline color="primary" icon-right="last_page" :label="t('common.last')"
                  :disable="!searchData.has_more || isLoading" @click="changePage(searchData.total_pages)"
                  class="pagination-btn" unelevated />
              </div>

              <!-- Total Results -->
              <div class="total-results text-center q-mt-md text-grey-6">
                {{
                  searchData && searchData.count > 0
                    ? t('search.showing', {
                      from: Math.max(1, (currentPage - 1) * (resultsPerPage || 20) + 1),
                      to: Math.min(currentPage * (resultsPerPage || 20), searchData.count),
                      total: searchData.count,
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
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta, useQuasar } from 'quasar'
import { useSearchPageData } from 'src/composables/search-page/useSearchPageData.js'
import MovieCard from 'src/components/MovieCard.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'

const $q = useQuasar()

const pagePadding = computed(() => {
  if ($q.screen.lt.sm) return 'q-px-sm'
  if ($q.screen.lt.md) return 'q-px-md'
  return 'q-px-lg'
})

// ========== COMPOSABLES ==========
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// ========== REACTIVE DATA ==========
const currentKeyword = ref('')
const currentPage = ref(1)
const resultsPerPage = 20 // Giả định mỗi trang 20 kết quả

// ========== FETCH DATA WITH useSearchPageData ==========
const {
  data: searchData,
  isLoading,
  isError,
  refetch,
} = useSearchPageData(currentKeyword, currentPage)

// ========== SEO META TAGS ==========
const metaTitle = computed(() => {
  if (currentKeyword.value) {
    return `${t('search.resultsFor')} "${currentKeyword.value}" - ${t('common.siteName')}`
  }
  return `${t('common.search')} - ${t('common.siteName')}`
})

const metaDescription = computed(() => {
  if (currentKeyword.value) {
    const resultCount = searchData.value?.count || 0
    if (resultCount > 0) {
      return `${t('search.foundResults', { count: resultCount, keyword: currentKeyword.value })}. ${t('search.discoverAnimeMatching')} "${currentKeyword.value}".`
    } else {
      return `${t('search.noResultsFor')} "${currentKeyword.value}". ${t('search.tryDifferentKeywordOrCheck')}.`
    }
  }
  return t('search.searchAnimeDescription')
})

const metaKeywords = computed(() => {
  if (currentKeyword.value) {
    return `${currentKeyword.value}, anime, ${t('common.siteName')}, ${t('search.searchAnime')}, ${t('search.animeSearch')}`
  }
  return `anime, ${t('common.siteName')}, ${t('search.searchAnime')}, ${t('search.animeSearch')}`
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

// ========== LIFECYCLE & WATCHERS ==========
onMounted(() => {
  // Lấy keyword từ URL query khi component mount (sử dụng 'q' parameter chuẩn)
  currentKeyword.value = route.query.q || ''
  currentPage.value = parseInt(route.query.page || '1', 10)
})

// Watch route query changes (khi user thay đổi URL)
watch(
  () => route.query.q,
  (newKeyword) => {
    if (newKeyword !== currentKeyword.value) {
      currentKeyword.value = newKeyword || ''
      currentPage.value = 1 // Reset về trang 1 khi keyword thay đổi
      scrollToTop()
    }
  },
)

watch(
  () => route.query.page,
  (newPage) => {
    const pageNum = parseInt(newPage || '1', 10)
    if (pageNum !== currentPage.value) {
      currentPage.value = pageNum
      scrollToTop()
    }
  },
)

// ========== METHODS ==========

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
  if (newPage < 1 || newPage > searchData.value.total_pages) return

  currentPage.value = newPage

  // Update URL query
  router.push({
    query: {
      ...route.query,
      page: newPage,
    },
  })

  scrollToTop()
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
</script>

<style lang="scss" scoped>
// ========== PAGE CONTAINER ==========
.search-page {
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
.search-header {
  .search-title {
    color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;

    .keyword-highlight {
      color: #00d4ff;
      font-style: italic;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }

    .q-icon {
      color: #00d4ff;
    }
  }

  .search-meta {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }
}

// ========== EMPTY STATE ==========
.empty-state {
  padding: 80px 20px;

  h2 {
    color: rgba(255, 255, 255, 0.95);
  }

  p {
    color: rgba(255, 255, 255, 0.5);
  }

  .q-icon {
    opacity: 0.3;
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

  .search-header {
    .search-title {
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
