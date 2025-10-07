<template>
  <div class="filter-controls">
    <!-- Type Filter -->
    <q-card flat bordered class="filter-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="category" class="q-mr-sm" />
          {{ t('filter.type') }}
        </div>
        <q-option-group
          v-model="localFilters.type"
          :options="typeOptions"
          color="primary"
          type="radio"
          @update:model-value="updateFilter"
        />
      </q-card-section>
    </q-card>

    <!-- Status Filter -->
    <q-card flat bordered class="filter-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="info" class="q-mr-sm" />
          {{ t('filter.status') }}
        </div>
        <q-option-group
          v-model="localFilters.status"
          :options="statusOptions"
          color="primary"
          type="radio"
          @update:model-value="updateFilter"
        />
      </q-card-section>
    </q-card>

    <!-- Sort Filter -->
    <q-card flat bordered class="filter-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="sort" class="q-mr-sm" />
          {{ t('filter.sortBy') }}
        </div>
        <q-option-group
          v-model="localFilters.sort"
          :options="sortOptions"
          color="primary"
          type="radio"
          @update:model-value="updateFilter"
        />
      </q-card-section>
    </q-card>

    <!-- Season Filter -->
    <q-card flat bordered class="filter-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="calendar_today" class="q-mr-sm" />
          {{ t('filter.season') }}
        </div>
        <q-option-group
          v-model="localFilters.season"
          :options="seasonOptions"
          color="primary"
          type="radio"
          @update:model-value="updateFilter"
        />
      </q-card-section>
    </q-card>

    <!-- Year Filter -->
    <q-card flat bordered class="filter-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="event" class="q-mr-sm" />
          {{ t('filter.year') }}
        </div>
        <q-option-group
          v-model="localFilters.year"
          :options="yearOptions"
          color="primary"
          type="radio"
          @update:model-value="updateFilter"
        />
      </q-card-section>
    </q-card>

    <!-- Genres Filter -->
    <q-card flat bordered class="filter-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="category" class="q-mr-sm" />
          {{ t('filter.genres') }}
        </div>
        <q-select
          v-model="localFilters.genres"
          :options="genreOptions"
          :loading="genresLoading"
          :placeholder="t('genres.selectGenres')"
          multiple
          emit-value
          map-options
          option-value="id"
          option-label="name"
          color="primary"
          outlined
          @update:model-value="updateFilter"
          class="genres-select"
        >
          <template v-slot:selected-item="scope">
            <q-chip
              removable
              dense
              color="primary"
              text-color="white"
              @remove="removeGenre(scope.opt)"
            >
              {{ scope.opt.name }}
            </q-chip>
          </template>
        </q-select>
      </q-card-section>
    </q-card>

    <!-- Clear All Filters -->
    <q-card flat bordered class="filter-card q-mt-md" v-if="hasActiveFilters">
      <q-card-section class="text-center">
        <q-btn
          color="negative"
          :label="t('filter.clearAllFilters')"
          @click="clearAllFilters"
          unelevated
          rounded
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGenreStore } from 'src/stores/site-genre.js'

const { t } = useI18n()
const genreStore = useGenreStore()

const props = defineProps({
  activeFilters: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['filter-change'])

const localFilters = ref({ ...props.activeFilters })

// Filter options
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

const sortOptions = [
  { label: t('filter.sortLatest'), value: 'latest' },
  { label: t('filter.sortOldest'), value: 'oldest' },
  { label: t('filter.sortTitle'), value: 'title' },
  { label: t('filter.sortRating'), value: 'rating' },
  { label: t('filter.sortViews'), value: 'views' },
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

const genreOptions = computed(() => genreStore.genres)
const genresLoading = computed(() => genreStore.isLoading)

const hasActiveFilters = computed(() => {
  return Object.values(props.activeFilters).some(
    (filter) => filter && (Array.isArray(filter) ? filter.length > 0 : true),
  )
})

const updateFilter = () => {
  emit('filter-change', { ...localFilters.value })
}

const removeGenre = (genre) => {
  localFilters.value.genres = localFilters.value.genres.filter((id) => id !== genre.id)
  updateFilter()
}

const clearAllFilters = () => {
  localFilters.value = {
    type: null,
    status: null,
    season: null,
    year: null,
    genres: [],
    sort: 'latest',
  }
  emit('filter-change', localFilters.value)
}

// Sync with props when they change
watch(
  () => props.activeFilters,
  (newFilters) => {
    localFilters.value = { ...newFilters }
  },
  { deep: true },
)

// Fetch genres on mount
onMounted(() => {
  genreStore.fetchGenres()
})
</script>

<style lang="scss" scoped>
.filter-controls {
  .filter-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;

    .q-card__section {
      padding: 16px 20px;
    }

    .text-h6 {
      color: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;

      .q-icon {
        color: #00d4ff;
      }
    }
  }

  .genres-select {
    .q-field__control {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
    }
  }
}
</style>
