<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="filter-modal"
  >
    <q-card class="filter-card" style="max-width: 100%; max-height: 100%">
      <!-- Header -->
      <q-toolbar class="bg-dark text-white">
        <q-btn flat round dense icon="close" @click="closeModal" />
        <q-toolbar-title>
          <q-icon name="filter_list" size="sm" class="q-mr-sm" />
          {{ t('filter.filterAnime') }}
        </q-toolbar-title>
      </q-toolbar>

      <!-- Scrollable content -->
      <q-scroll-area class="filter-scroll">
        <div class="q-pa-md">
          <!-- TYPE -->
          <q-expansion-item
            icon="category"
            :label="t('filter.type')"
            default-opened
            dense
            dense-toggle
          >
            <div class="button-grid">
              <q-btn
                v-for="option in typeOptions"
                :key="option.value || 'null'"
                :label="option.label"
                :class="[
                  'filter-btn',
                  localFilters.type === option.value ? 'filter-btn-active' : '',
                ]"
                unelevated
                @click="localFilters.type = option.value"
              />
            </div>
          </q-expansion-item>

          <!-- STATUS -->
          <q-expansion-item
            icon="info"
            :label="t('filter.status')"
            default-opened
            dense
            dense-toggle
          >
            <div class="button-grid">
              <q-btn
                v-for="option in statusOptions"
                :key="option.value || 'null'"
                :label="option.label"
                :class="[
                  'filter-btn',
                  localFilters.status === option.value ? 'filter-btn-active' : '',
                ]"
                unelevated
                @click="localFilters.status = option.value"
              />
            </div>
          </q-expansion-item>

          <!-- SEASON -->
          <q-expansion-item
            icon="wb_sunny"
            :label="t('filter.season')"
            default-opened
            dense
            dense-toggle
          >
            <div class="button-grid">
              <q-btn
                v-for="option in seasonOptions"
                :key="option.value || 'null'"
                :label="option.label"
                :class="[
                  'filter-btn',
                  localFilters.season === option.value ? 'filter-btn-active' : '',
                ]"
                unelevated
                @click="localFilters.season = option.value"
              />
            </div>
          </q-expansion-item>

          <!-- YEAR -->
          <q-expansion-item
            icon="calendar_today"
            :label="`${t('filter.year')} (${currentYear})`"
            default-opened
            dense
            dense-toggle
          >
            <div class="button-grid">
              <q-btn
                v-for="option in recentYearOptions"
                :key="option.value || 'null'"
                :label="option.label"
                :class="[
                  'filter-btn',
                  localFilters.year === option.value ? 'filter-btn-active' : '',
                ]"
                unelevated
                @click="localFilters.year = option.value"
              />
            </div>
            <div class="q-mt-md">
              <q-input
                v-model="customYear"
                outlined
                dense
                :placeholder="t('filter.customYear') || 'Enter custom year'"
                type="number"
                min="1950"
                :max="currentYear + 2"
                class="custom-year-input"
                @update:model-value="handleCustomYear"
              >
                <template v-slot:prepend>
                  <q-icon name="edit_calendar" />
                </template>
              </q-input>
            </div>
          </q-expansion-item>

          <!-- SORT -->
          <q-expansion-item
            icon="sort"
            :label="t('filter.sortBy')"
            default-opened
            dense
            dense-toggle
          >
            <div class="button-grid">
              <q-btn
                v-for="option in sortOptions"
                :key="option.value"
                :label="option.label"
                :class="[
                  'filter-btn',
                  localFilters.sort === option.value ? 'filter-btn-active' : '',
                ]"
                unelevated
                @click="localFilters.sort = option.value"
              />
            </div>
          </q-expansion-item>

          <!-- GENRES -->
          <q-expansion-item
            icon="local_offer"
            :label="t('filter.genres')"
            default-opened
            dense
            dense-toggle
          >
            <!-- Search genres -->
            <q-input
              v-model="genreSearch"
              outlined
              dense
              :placeholder="t('genres.searchGenres')"
              clearable
              class="q-mb-md genre-search"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Genre buttons -->
            <div class="button-grid">
              <q-btn
                v-for="genre in filteredGenres"
                :key="genre.id"
                :label="genre.name"
                :class="[
                  'filter-btn',
                  localFilters.genres?.includes(genre.id) ? 'filter-btn-active' : '',
                ]"
                :disable="isAtMaxLimit && !localFilters.genres?.includes(genre.id)"
                unelevated
                @click="toggleGenre(genre.id)"
              >
                <q-tooltip
                  v-if="isAtMaxLimit && !localFilters.genres?.includes(genre.id)"
                  :offset="[10, 10]"
                  class="bg-red text-white text-caption"
                >
                  Đã đạt giới hạn tối đa {{ MAX_GENRES }} thể loại
                </q-tooltip>
              </q-btn>
            </div>

            <!-- Selected genres chips -->
            <div v-if="localFilters.genres?.length > 0 || isAtMaxLimit" class="q-mt-md">
              <div class="text-caption text-grey-4 q-mb-sm">
                {{ t('genres.selectedGenres') }} ({{ localFilters.genres?.length || 0 }}/{{
                  MAX_GENRES
                }}):
              </div>

              <!-- Thông báo giới hạn -->
              <div v-if="isAtMaxLimit" class="limit-warning text-caption text-red q-mb-md">
                <q-icon name="warning" class="q-mr-xs" />
                Đã đạt giới hạn tối đa {{ MAX_GENRES }} thể loại. Bỏ chọn bớt để chọn thể loại khác.
              </div>
              <div class="selected-genres">
                <q-chip
                  v-for="genreId in localFilters.genres"
                  :key="genreId"
                  removable
                  dense
                  color="amber"
                  text-color="black"
                  icon="label"
                  @remove="removeGenreById(genreId)"
                >
                  {{ getGenreName(genreId) }}
                </q-chip>
              </div>
            </div>
          </q-expansion-item>
        </div>
      </q-scroll-area>

      <!-- Footer Actions -->
      <q-card-section class="footer-actions">
        <div class="action-buttons">
          <q-btn
            outline
            color="grey-6"
            :label="t('common.reset') || 'Reset'"
            icon="refresh"
            class="reset-btn"
            @click="resetFilters"
          />
          <q-btn
            unelevated
            color="amber"
            text-color="black"
            :label="t('common.apply')"
            icon="check"
            class="apply-btn"
            @click="applyFilters"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGenreStore } from 'src/stores/site-genre.js'

const { t } = useI18n()
const genreStore = useGenreStore()

const props = defineProps({
  modelValue: Boolean,
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'apply-filters'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const currentYear = new Date().getFullYear()

const localFilters = ref({
  type: null,
  status: null,
  season: null,
  year: null, // Chọn tất cả các năm làm mặc định
  sort: 'latest',
  genres: [],
  ...props.initialFilters,
})

// Additional state
const genreSearch = ref('')
const customYear = ref('')
const MAX_GENRES = 3 // Giới hạn tối đa thể loại được chọn

// Options
const typeOptions = [
  { label: t('common.all'), value: null },
  { label: 'TV', value: 'tv' },
  { label: 'Movie', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'ONA', value: 'ona' },
  { label: 'Special', value: 'special' },
]

const statusOptions = [
  { label: t('common.all'), value: null },
  { label: t('filter.airing'), value: 'airing' },
  { label: t('filter.completed'), value: 'completed' },
  { label: t('filter.upcoming'), value: 'upcoming' },
]

const seasonOptions = [
  { label: t('common.all'), value: null },
  { label: 'Spring', value: 'spring' },
  { label: 'Summer', value: 'summer' },
  { label: 'Fall', value: 'fall' },
  { label: 'Winter', value: 'winter' },
]

const sortOptions = [
  { label: t('filter.sortLatest'), value: 'latest' },
  { label: t('filter.sortOldest'), value: 'oldest' },
  { label: t('filter.sortTitle'), value: 'title' },
  { label: t('filter.sortRating'), value: 'rating' },
  { label: t('filter.sortViews'), value: 'views' },
]

// 4 năm gần nhất + All option
const recentYearOptions = [
  { label: t('common.all'), value: null },
  ...Array.from({ length: 4 }, (_, i) => {
    const year = currentYear - i
    return { label: year.toString(), value: year.toString() }
  }),
]

const genreOptions = computed(() => genreStore.genres || [])

// Filtered genres based on search
const filteredGenres = computed(() => {
  if (!genreSearch.value.trim()) {
    return genreOptions.value
  }
  const search = genreSearch.value.toLowerCase()
  return genreOptions.value.filter((genre) => genre.name.toLowerCase().includes(search))
})

// Computed để kiểm tra trạng thái
const isAtMaxLimit = computed(() => localFilters.value.genres?.length >= MAX_GENRES)

// Functions
const handleCustomYear = (value) => {
  if (value && value.toString().length === 4) {
    localFilters.value.year = value.toString()
  }
}

const toggleGenre = (genreId) => {
  if (!localFilters.value.genres) {
    localFilters.value.genres = []
  }

  const index = localFilters.value.genres.indexOf(genreId)

  if (index > -1) {
    // Bỏ chọn genre
    localFilters.value.genres.splice(index, 1)
  } else {
    // Kiểm tra giới hạn trước khi thêm
    if (localFilters.value.genres.length >= MAX_GENRES) {
      // Thông báo lỗi thay vì chỉ cảnh báo
      console.warn(`Đã đạt giới hạn tối đa ${MAX_GENRES} thể loại`)
      return
    }
    localFilters.value.genres.push(genreId)
  }
}

const removeGenreById = (genreId) => {
  if (!localFilters.value.genres) {
    localFilters.value.genres = []
    return
  }
  localFilters.value.genres = localFilters.value.genres.filter((id) => id !== genreId)
}

const getGenreName = (genreId) => {
  const genre = genreOptions.value.find((g) => g.id === genreId)
  return genre ? genre.name : ''
}

const resetFilters = () => {
  localFilters.value = {
    type: null,
    status: null,
    season: null,
    year: null, // Reset về chọn tất cả các năm
    sort: 'latest',
    genres: [], // Reset về 0 thể loại
  }
  genreSearch.value = ''
  customYear.value = ''
}

const closeModal = () => {
  // Reset search
  genreSearch.value = ''
  customYear.value = ''
  isOpen.value = false
}

const applyFilters = () => {
  emit('apply-filters', { ...localFilters.value })
  closeModal()
}

watch(
  () => props.modelValue,
  (newValue) => {
    console.log('ModalFilter visibility changed:', newValue)
    if (newValue) {
      // Sync customYear with current year filter
      customYear.value = localFilters.value.year || ''
    }
  },
)

watch(
  () => props.initialFilters,
  (newFilters) => {
    localFilters.value = {
      type: null,
      status: null,
      season: null,
      year: null, // Luôn mặc định chọn tất cả các năm
      sort: 'latest',
      genres: [], // Luôn reset về 0 thể loại
      ...newFilters,
    }
  },
  { deep: true },
)

onMounted(() => {
  console.log('ModalFilter mounted')
  if (genreStore.genres.length === 0) {
    genreStore.fetchGenres()
  }
})
</script>

<style lang="scss" scoped>
.filter-modal {
  :deep(.q-dialog__backdrop) {
    background: rgba(0, 0, 0, 0.7);
    z-index: 6000 !important;
  }

  :deep(.q-dialog) {
    z-index: 6001 !important;
  }
}

.filter-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: white;

  :deep(.q-toolbar) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

.filter-scroll {
  flex: 1;
  overflow-y: auto;
  background: #1a1a2e;
  max-height: calc(100vh - 200px);

  :deep(.q-scrollarea__content) {
    padding-bottom: 20px;
  }
}

:deep(.q-expansion-item) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;

  .q-item {
    color: white;
    padding: 12px 16px;
  }

  .q-item__section--avatar {
    color: #fbbf24;
  }

  .q-expansion-item__content {
    padding: 16px;
  }
}

// Button Grid - 3 columns
.button-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

// Filter buttons
.filter-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.87);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: #fbbf24;
  }
}

// Active button - Yellow highlight
.filter-btn-active {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a2e;
  border-color: #fbbf24;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);

  &:hover {
    background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.5);
  }
}

// Genre search input
.genre-search,
.custom-year-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;

    &::before {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: white;
  }

  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.q-icon) {
    color: #fbbf24;
  }
}

// Selected genres
.selected-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .q-chip {
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }
}

// Giới hạn warning
.limit-warning {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .q-icon {
    color: #ef4444;
    font-size: 1.1rem;
  }
}

// Disabled state cho filter buttons
.filter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.4) !important;

  &:hover {
    transform: none !important;
    box-shadow: none !important;
  }
}

// Footer Actions
.footer-actions {
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(26, 26, 46, 1) 100%);
  border-top: 1px solid rgba(251, 191, 36, 0.2);
  padding: 16px;
  position: sticky;
  bottom: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: stretch;
}

.reset-btn {
  flex: 1;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.87);
  text-transform: none;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  :deep(.q-icon) {
    font-size: 1.2rem;
  }
}

.apply-btn {
  flex: 2;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  text-transform: none;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.4);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.6);
    transform: translateY(-2px);
  }

  :deep(.q-icon) {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .filter-scroll {
    max-height: calc(100vh - 180px);
  }

  :deep(.q-expansion-item) {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .button-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .filter-btn {
    font-size: 0.8rem;
    padding: 8px 10px;
  }

  .footer-actions {
    padding: 12px;
  }

  .action-buttons {
    gap: 8px;
  }

  .reset-btn,
  .apply-btn {
    font-size: 0.9rem;
    padding: 10px 16px;
  }
}

@media (max-width: 400px) {
  .button-grid {
    gap: 4px;
  }

  .filter-btn {
    font-size: 0.75rem;
    padding: 6px 8px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .reset-btn,
  .apply-btn {
    flex: 1;
    width: 100%;
  }
}
</style>
