<template>
  <q-page class="genres-page">
    <div class="page-container q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%">
      <!-- ========== HEADER WITH BREADCRUMB ========== -->
      <div class="genres-header-container q-mt-md">
        <div class="genres-header-main">
          <!-- Breadcrumb gọn gàng -->
          <div class="breadcrumb-compact">
            <q-breadcrumbs class="breadcrumb-nav" active-color="primary">
              <q-breadcrumbs-el
                icon="home"
                :label="t('common.home')"
                :to="{ name: 'site-home' }"
                class="breadcrumb-item"
              />
              <q-breadcrumbs-el
                icon="category"
                :label="
                  currentGenreName ? t('genres.genre') + ': ' + currentGenreName : t('genres.genre')
                "
                class="breadcrumb-current"
              />
            </q-breadcrumbs>
          </div>

          <!-- Info và Controls ở cùng hàng -->
          <div class="header-info-row">
            <!-- Tổng số kết quả -->
            <div v-if="!isLoading && genresData" class="genres-count">
              {{ t('genres.totalFound', { total: genresData.count || 0 }) }}
            </div>

            <!-- Sort Dropdown trực tiếp -->
            <div class="sort-dropdown-inline">
              <q-icon name="sort" size="18px" class="q-mr-xs text-grey-6" />
              <q-select
                v-model="currentSort"
                :options="sortOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                class="sort-select-inline"
                @update:model-value="handleSortChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ========== HEADER SECTION ========== -->
      <div class="genres-header q-mt-md q-mb-md">
        <!-- Nếu không có genre slug, hiển thị hướng dẫn -->
        <div v-if="!currentGenreSlug" class="empty-state text-center q-py-xl">
          <q-icon name="category" size="80px" color="grey-6" />
          <h2 class="text-h4 q-mt-md text-grey-7">{{ t('genres.selectGenre') }}</h2>
          <p class="text-body1 text-grey-6 q-mt-sm">{{ t('genres.selectGenreDescription') }}</p>
        </div>

        <!-- Nếu có genre slug, hiển thị thông tin thể loại -->
        <div v-else>
          <!-- Genre Description -->
          <div v-if="genresData?.genre?.description" class="genre-description q-mb-md">
            <q-card flat bordered class="genre-description-card">
              <q-card-section class="genre-description-content">
                <div class="text-body1 text-grey-7 leading-relaxed">
                  {{ genresData.genre.description }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ========== MAIN LAYOUT: 2 COLUMNS ========== -->
      <div v-if="currentGenreSlug" class="row q-col-gutter-md">
        <!-- ========== LEFT COLUMN: GENRES RESULTS ========== -->
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
            <h3 class="text-h5 q-mt-md">{{ t('genres.errorOccurred') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">{{ t('genres.errorMessage') }}</p>
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
            v-else-if="genresData && genresData.results && genresData.results.length === 0"
            class="empty-results text-center q-py-xl"
          >
            <q-icon name="category" size="80px" color="grey-6" />
            <h3 class="text-h5 q-mt-md text-grey-7">{{ t('genres.noResults') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">
              {{ t('genres.tryDifferentGenre') }}
            </p>
          </div>

          <!-- ========== ANIME RESULTS GRID (Using MovieCard) ========== -->
          <div v-else-if="genresData && genresData.results && genresData.results.length > 0">
            <div class="anime-grid">
              <MovieCard
                v-for="anime in genresData.results"
                :key="anime.id"
                :anime="anime"
                :show-age-rating="false"
                :show-episode-badges="false"
                :show-status-badge="true"
                :show-type-badge="false"
                :show-subtitle="true"
                :show-genres="true"
                :max-genres="3"
                :overlay-text="t('genres.viewDetails')"
                :poster-ratio="'3/4'"
                @click="navigateToAnime"
              />
            </div>

            <!-- ========== PAGINATION ========== -->
            <div v-if="genresData.total_pages > 1" class="pagination-container q-mt-xl q-mb-lg">
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
                      t('common.pageInfo', { current: currentPage, total: genresData.total_pages })
                    }}
                  </q-chip>
                </div>

                <!-- Next Button -->
                <q-btn
                  outline
                  color="primary"
                  icon-right="keyboard_arrow_right"
                  :label="t('common.next')"
                  :disable="!genresData.has_more || isLoading"
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
                  :disable="!genresData.has_more || isLoading"
                  @click="changePage(genresData.total_pages)"
                  class="pagination-btn"
                  unelevated
                />
              </div>

              <!-- Total Results -->
              <div class="total-results text-center q-mt-md text-grey-6">
                {{
                  genresData && genresData.count > 0
                    ? t('genres.showing', {
                        from: Math.max(1, (currentPage - 1) * (resultsPerPage.value || 20) + 1),
                        to: Math.min(currentPage * (resultsPerPage.value || 20), genresData.count),
                        total: genresData.count,
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
import { useMeta } from 'quasar'
import { useGenresPageData } from 'src/composables/genres-page/useGenresPageData.js'
import MovieCard from 'src/components/MovieCard.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'

// ========== COMPOSABLES ==========
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// ========== REACTIVE DATA ==========
const currentGenreSlug = ref('')
const currentGenreName = ref('')
const currentPage = ref(1)
const currentSort = ref('latest') // Tùy chọn sắp xếp mặc định
const resultsPerPage = ref(20) // Sẽ được cập nhật từ API

// ========== SORTING OPTIONS ==========
const sortOptions = ref([
  { value: 'latest', label: t('genres.sortLatest') },
  { value: 'oldest', label: t('genres.sortOldest') },
  { value: 'title', label: t('genres.sortTitle') },
  { value: 'rating', label: t('genres.sortRating') },
  { value: 'views', label: t('genres.sortViews') },
])

// ========== FETCH DATA WITH useGenresPageData ==========
const {
  data: genresData,
  isLoading,
  isError,
  refetch,
} = useGenresPageData(currentGenreSlug, currentPage, currentSort)

// ========== SEO META TAGS ==========
const metaTitle = computed(() => {
  if (currentGenreName.value) {
    return `${currentGenreName.value} - ${t('common.siteName')}`
  }
  return `${t('genres.genre')} - ${t('common.siteName')}`
})

const metaDescription = computed(() => {
  if (genresData.value?.genre?.description) {
    return genresData.value.genre.description.slice(0, 160) + '...'
  }
  if (currentGenreName.value) {
    return `${t('genres.exploreAnimeIn')} ${currentGenreName.value}. ${t('genres.discoverBestAnime')} ${currentGenreName.value} ${t('genres.withRatingsAndDetails')}.`
  }
  return t('genres.discoverAnimeByGenre')
})

const metaKeywords = computed(() => {
  if (currentGenreName.value) {
    return `${currentGenreName.value}, anime, ${t('common.siteName')}, ${t('genres.watchAnime')}, ${t('genres.animeGenres')}`
  }
  return `anime, ${t('common.siteName')}, ${t('genres.watchAnime')}, ${t('genres.animeGenres')}`
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
  // Lấy genre slug từ URL params khi component mount
  currentGenreSlug.value = route.params.slug || ''
  currentPage.value = parseInt(route.query.page || '1', 10)
  currentSort.value = route.query.sort || 'latest' // Lấy sort từ URL hoặc mặc định
  // Lấy tên thể loại từ slug (có thể cần xử lý thêm)
  currentGenreName.value = formatGenreName(currentGenreSlug.value)
})

// Watch for genre data changes để cập nhật tên thể loại từ API
watch(
  () => genresData.value?.genre,
  (genreData) => {
    if (genreData && genreData.name_vn) {
      currentGenreName.value = genreData.name_vn
    } else if (genreData && genreData.name) {
      currentGenreName.value = genreData.name
    }
  },
  { immediate: true },
)

// Watch for pagination data changes để cập nhật resultsPerPage
watch(
  () => genresData.value?.pagination,
  (paginationData) => {
    if (paginationData && paginationData.per_page) {
      resultsPerPage.value = paginationData.per_page
    }
  },
  { immediate: true },
)

// Watch route query changes for sort
watch(
  () => route.query.sort,
  (newSort) => {
    if (newSort && newSort !== currentSort.value) {
      currentSort.value = newSort
    }
  },
)

// Watch for sort changes để cập nhật URL và reset về trang 1
watch(currentSort, (newSort) => {
  if (newSort) {
    // Update URL with new sort option
    router.push({
      params: {
        slug: currentGenreSlug.value,
      },
      query: {
        ...route.query,
        sort: newSort,
        page: 1, // Reset về trang 1 khi thay đổi sắp xếp
      },
    })
  }
})

// Watch route params changes (khi user thay đổi slug)
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug !== currentGenreSlug.value) {
      currentGenreSlug.value = newSlug || ''
      currentGenreName.value = formatGenreName(currentGenreSlug.value)
      currentPage.value = 1 // Reset về trang 1 khi genre thay đổi
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
 * Format tên thể loại từ slug
 */
const formatGenreName = (slug) => {
  if (!slug) return ''
  // Chuyển từ kebab-case hoặc snake_case thành Title Case
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
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
  if (newPage < 1 || newPage > genresData.value.total_pages) return

  currentPage.value = newPage

  // Update URL query
  router.push({
    params: {
      slug: currentGenreSlug.value,
    },
    query: {
      ...route.query,
      page: newPage,
    },
  })

  scrollToTop()
}

/**
 * Xử lý thay đổi sắp xếp
 */
const handleSortChange = (newSort) => {
  currentSort.value = newSort
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
.genres-page {
  min-height: 100vh;
  background: #121212; // Match body background
  padding-bottom: 60px;
}

.page-container {
  padding-top: 20px;
}

// ========== NEW HEADER LAYOUT ==========
.genres-header-container {
  .genres-header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .breadcrumb-compact {
      flex: 1;

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
    }

    .header-info-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .genres-count {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
        font-weight: 500;
      }

      .sort-dropdown-inline {
        display: flex;
        align-items: center;
        gap: 8px;

        .sort-select-inline {
          min-width: 140px;

          :deep(.q-field__control) {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);

            &:hover {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(0, 212, 255, 0.3);
            }
          }

          :deep(.q-field__native) {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.85rem;
            font-weight: 500;
          }

          :deep(.q-icon) {
            color: rgba(255, 255, 255, 0.7);
          }

          :deep(.q-field__append) {
            .q-icon {
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }
      }
    }
  }
}

// ========== HEADER SECTION ==========
.genres-header {
  .genres-title {
    color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;

    .genre-highlight {
      color: #00d4ff;
      font-style: italic;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }

    .q-icon {
      color: #00d4ff;
    }
  }

  .genre-description {
    .genre-description-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      backdrop-filter: blur(10px);

      .genre-description-content {
        padding: 16px 20px;

        .text-body1 {
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }
  }

  .genres-meta {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }

  .sort-controls {
    .sort-controls-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(10px);

      .sort-select {
        min-width: 180px;

        :deep(.q-field__control) {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
          }
        }

        :deep(.q-field__native) {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        :deep(.q-icon) {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
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

  .genres-header-container {
    .genres-header-main {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .breadcrumb-compact {
        width: 100%;
      }

      .header-info-row {
        width: 100%;
        justify-content: space-between;
        gap: 12px;

        .genres-count {
          font-size: 0.9rem;
        }

        .sort-dropdown-inline {
          .sort-select-inline {
            min-width: 120px;

            :deep(.q-field__native) {
              font-size: 0.8rem;
            }

            :deep(.q-field__control) {
              min-height: 32px;
            }
          }
        }
      }
    }
  }

  .genres-header {
    .genres-title {
      font-size: 1.5rem;

      .q-icon {
        width: 24px;
        height: 24px;
        font-size: 24px;
      }
    }

    .genre-description {
      .genre-description-card {
        .genre-description-content {
          padding: 14px 16px;

          .text-body1 {
            font-size: 0.95rem;
          }
        }
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
