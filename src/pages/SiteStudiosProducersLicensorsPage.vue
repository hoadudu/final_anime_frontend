<template>
  <q-page class="company-page">
    <div class="page-container q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%">
      <!-- ========== HEADER WITH BREADCRUMB ========== -->
      <div class="company-header-container q-mt-md">
        <div class="company-header-main">
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
                icon="business"
                :label="
                  currentCompanyName
                    ? t('company.company') + ': ' + currentCompanyName
                    : t('company.company')
                "
                class="breadcrumb-current"
              />
            </q-breadcrumbs>
          </div>

          <!-- Info và Controls ở cùng hàng -->
          <div class="header-info-row">
            <!-- Tổng số kết quả -->
            <div v-if="!isLoading && companyData" class="company-count">
              {{ t('company.totalFound', { total: companyData.count || 0 }) }}
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
      <div class="company-header q-mt-md q-mb-md">
        <!-- Nếu không có company slug hoặc id, hiển thị hướng dẫn -->
        <div
          v-if="!currentCompanySlug || !currentCompanyId"
          class="empty-state text-center q-py-xl"
        >
          <q-icon name="business" size="80px" color="grey-6" />
          <h2 class="text-h4 q-mt-md text-grey-7">{{ t('company.selectCompany') }}</h2>
          <p class="text-body1 text-grey-6 q-mt-sm">{{ t('company.selectCompanyDescription') }}</p>
        </div>

        <!-- Nếu có company slug và id, hiển thị thông tin công ty -->
        <div v-else>
          <!-- Company Name as Title -->
          <div v-if="companyData?.company?.name" class="company-name-title q-mb-md">
            <h1 class="text-h3 text-weight-bold company-title">
              <q-icon name="business" size="32px" class="q-mr-sm" />
              <span class="company-highlight">{{ companyData.company.name }}</span>
            </h1>
          </div>
        </div>
      </div>

      <!-- ========== MAIN LAYOUT: 2 COLUMNS ========== -->
      <div v-if="currentCompanySlug && currentCompanyId" class="row q-col-gutter-md">
        <!-- ========== LEFT COLUMN: COMPANY RESULTS ========== -->
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
            <h3 class="text-h5 q-mt-md">{{ t('company.errorOccurred') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">{{ t('company.errorMessage') }}</p>
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
            v-else-if="companyData && companyData.results && companyData.results.length === 0"
            class="empty-results text-center q-py-xl"
          >
            <q-icon name="business" size="80px" color="grey-6" />
            <h3 class="text-h5 q-mt-md text-grey-7">{{ t('company.noResults') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">
              {{ t('company.noResultsMessage') }}
            </p>
          </div>

          <!-- ========== ANIME RESULTS GRID (Using MovieCard) ========== -->
          <div v-else-if="companyData && companyData.results && companyData.results.length > 0">
            <div class="anime-grid">
              <MovieCard
                v-for="anime in companyData.results"
                :key="anime.id"
                :anime="anime"
                :show-age-rating="false"
                :show-episode-badges="false"
                :show-status-badge="true"
                :show-type-badge="false"
                :show-subtitle="true"
                :show-genres="true"
                :max-genres="3"
                :overlay-text="t('company.viewDetails')"
                :poster-ratio="'3/4'"
                @click="navigateToAnime"
              />
            </div>

            <!-- ========== PAGINATION ========== -->
            <div v-if="companyData.total_pages > 1" class="pagination-container q-mt-xl q-mb-lg">
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
                      t('common.pageInfo', { current: currentPage, total: companyData.total_pages })
                    }}
                  </q-chip>
                </div>

                <!-- Next Button -->
                <q-btn
                  outline
                  color="primary"
                  icon-right="keyboard_arrow_right"
                  :label="t('common.next')"
                  :disable="!companyData.has_more || isLoading"
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
                  :disable="!companyData.has_more || isLoading"
                  @click="changePage(companyData.total_pages)"
                  class="pagination-btn"
                  unelevated
                />
              </div>

              <!-- Total Results -->
              <div class="total-results text-center q-mt-md text-grey-6">
                {{
                  companyData && companyData.count > 0
                    ? t('company.showing', {
                        from: Math.max(1, (currentPage - 1) * (resultsPerPage.value || 20) + 1),
                        to: Math.min(currentPage * (resultsPerPage.value || 20), companyData.count),
                        total: companyData.count,
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
import { useCompanyPageData } from 'src/composables/company-page/useCompanyPageData.js'
import MovieCard from 'src/components/MovieCard.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'

// ========== COMPOSABLES ==========
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// ========== REACTIVE DATA ==========
const currentCompanySlug = ref('')
const currentCompanyId = ref(null)
const currentCompanyName = ref('')
const currentPage = ref(1)
const currentSort = ref('latest') // Tùy chọn sắp xếp mặc định
const resultsPerPage = ref(20) // Sẽ được cập nhật từ API

// ========== SORTING OPTIONS ==========
const sortOptions = ref([
  { value: 'latest', label: t('company.sortLatest') },
  { value: 'oldest', label: t('company.sortOldest') },
  { value: 'title', label: t('company.sortTitle') },
  { value: 'rating', label: t('company.sortRating') },
  { value: 'views', label: t('company.sortViews') },
])

// ========== FETCH DATA WITH useCompanyPageData ==========
const {
  data: companyData,
  isLoading,
  isError,
  refetch,
} = useCompanyPageData(currentCompanySlug, currentCompanyId, currentPage, currentSort)

// ========== SEO META TAGS ==========
const metaTitle = computed(() => {
  if (currentCompanyName.value) {
    return `${currentCompanyName.value} - ${t('common.siteName')}`
  }
  return `${t('company.company')} - ${t('common.siteName')}`
})

const metaDescription = computed(() => {
  if (currentCompanyName.value) {
    return `${t('company.exploreAnimeFrom')} ${currentCompanyName.value}. ${t('company.discoverBestAnime')} ${currentCompanyName.value} ${t('company.withRatingsAndDetails')}.`
  }
  return t('company.discoverAnimeByCompany')
})

const metaKeywords = computed(() => {
  if (currentCompanyName.value) {
    return `${currentCompanyName.value}, anime, ${t('common.siteName')}, ${t('company.watchAnime')}, ${t('company.animeCompanies')}`
  }
  return `anime, ${t('common.siteName')}, ${t('company.watchAnime')}, ${t('company.animeCompanies')}`
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
  // Lấy company slug và id từ URL params khi component mount
  currentCompanySlug.value = route.params.slug || ''
  currentCompanyId.value = route.params.id ? parseInt(route.params.id, 10) : null
  currentPage.value = parseInt(route.query.page || '1', 10)
  currentSort.value = route.query.sort || 'latest' // Lấy sort từ URL hoặc mặc định
  // Lấy tên công ty từ slug (có thể cần xử lý thêm)
  currentCompanyName.value = formatCompanyName(currentCompanySlug.value)
})

// Watch for company data changes để cập nhật tên công ty từ API
watch(
  () => companyData.value?.company,
  (company) => {
    if (company && company.name) {
      currentCompanyName.value = company.name
    }
  },
  { immediate: true },
)

// Watch for pagination data changes để cập nhật resultsPerPage
watch(
  () => companyData.value?.pagination,
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
        slug: currentCompanySlug.value,
        id: currentCompanyId.value,
      },
      query: {
        ...route.query,
        sort: newSort,
        page: 1, // Reset về trang 1 khi thay đổi sắp xếp
      },
    })
  }
})

// Watch route params changes (khi user thay đổi slug hoặc id)
watch(
  () => [route.params.slug, route.params.id],
  ([newSlug, newId]) => {
    const hasChanged =
      newSlug !== currentCompanySlug.value || parseInt(newId, 10) !== currentCompanyId.value

    if (hasChanged) {
      currentCompanySlug.value = newSlug || ''
      currentCompanyId.value = newId ? parseInt(newId, 10) : null
      currentCompanyName.value = formatCompanyName(currentCompanySlug.value)
      currentPage.value = 1 // Reset về trang 1 khi công ty thay đổi
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
 * Format tên công ty từ slug
 */
const formatCompanyName = (slug) => {
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
  if (newPage < 1 || newPage > companyData.value.total_pages) return

  currentPage.value = newPage

  // Update URL query
  router.push({
    params: {
      slug: currentCompanySlug.value,
      id: currentCompanyId.value,
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
.company-page {
  min-height: 100vh;
  background: #121212; // Match body background
  padding-bottom: 60px;
}

.page-container {
  padding-top: 20px;
}

// ========== NEW HEADER LAYOUT ==========
.company-header-container {
  .company-header-main {
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

      .company-count {
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
.company-header {
  .company-name-title {
    .company-title {
      color: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;

      .company-highlight {
        color: #00d4ff;
        font-style: italic;
        text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
      }

      .q-icon {
        color: #00d4ff;
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

  .company-header-container {
    .company-header-main {
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

        .company-count {
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

  .company-header {
    .company-name-title {
      .company-title {
        font-size: 1.5rem;

        .q-icon {
          width: 24px;
          height: 24px;
          font-size: 24px;
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
