<template>
  <div v-if="hasActiveFilters" class="filter-summary">
    <!-- Genres: hiển thị mỗi genre như một chip riêng -->
    <template v-if="activeFilters.genres && activeFilters.genres.length > 0">
      <q-chip
        v-for="genreId in activeFilters.genres"
        :key="`genre-${genreId}`"
        removable
        color="primary"
        text-color="white"
        dense
        @remove="removeGenre(genreId)"
        class="q-mr-sm q-mb-sm"
      >
        <span class="filter-value">{{ getGenreName(genreId) }}</span>
      </q-chip>
    </template>

    <!-- Other filters -->
    <q-chip
      v-for="(filter, key) in otherActiveFilters"
      :key="key"
      removable
      color="primary"
      text-color="white"
      dense
      @remove="removeFilter(key)"
      class="q-mr-sm q-mb-sm"
    >
      <span class="filter-label">{{ getFilterLabel(key) }}:</span>
      <span class="filter-value">{{ getFilterValue(key, filter) }}</span>
    </q-chip>
  </div>
  <div v-else class="no-filters">
    {{ t('filter.noFiltersApplied') }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
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

const hasActiveFilters = computed(() => {
  return Object.values(props.activeFilters).some(
    (filter) => filter && (Array.isArray(filter) ? filter.length > 0 : true),
  )
})

// Filter entries excluding genres (vì genres hiển thị riêng)
const otherActiveFilters = computed(() => {
  return Object.entries(props.activeFilters)
    .filter(([key, filter]) => {
      if (key === 'genres') return false // Bỏ qua genres
      return filter && (Array.isArray(filter) ? filter.length > 0 : true)
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
})

const getFilterLabel = (key) => {
  const labels = {
    type: t('filter.type'),
    status: t('filter.status'),
    season: t('filter.season'),
    year: t('filter.year'),
    genres: t('filter.genres'),
    sort: t('filter.sort'),
  }
  return labels[key] || key
}

const getFilterValue = (key, value) => {
  // Type labels
  if (key === 'type') {
    const typeLabels = {
      tv: 'TV',
      movie: 'Movie',
      ova: 'OVA',
      ona: 'ONA',
      special: 'Special',
    }
    return typeLabels[value] || value
  }

  // Status labels
  if (key === 'status') {
    const statusLabels = {
      airing: t('filter.airing'),
      completed: t('filter.completed'),
      upcoming: t('filter.upcoming'),
    }
    return statusLabels[value] || value
  }

  // Season labels
  if (key === 'season') {
    const seasonLabels = {
      spring: 'Spring',
      summer: 'Summer',
      fall: 'Fall',
      winter: 'Winter',
    }
    return seasonLabels[value] || value
  }

  // Sort labels
  if (key === 'sort') {
    const sortLabels = {
      latest: t('filter.sortLatest'),
      oldest: t('filter.sortOldest'),
      title: t('filter.sortTitle'),
      rating: t('filter.sortRating'),
      views: t('filter.sortViews'),
    }
    return sortLabels[value] || value
  }

  return value
}

// Get genre name from ID
const getGenreName = (genreId) => {
  const genre = genreStore.genres.find((g) => g.id === genreId)
  return genre ? genre.name : `Genre #${genreId}`
}

// Remove a single genre
const removeGenre = (genreId) => {
  const newFilters = { ...props.activeFilters }
  newFilters.genres = newFilters.genres.filter((id) => id !== genreId)
  emit('filter-change', newFilters)
}

const removeFilter = (key) => {
  const newFilters = { ...props.activeFilters }

  if (key === 'genres') {
    newFilters.genres = []
  } else {
    newFilters[key] = null
  }

  emit('filter-change', newFilters)
}
</script>

<style lang="scss" scoped>
.filter-summary {
  .filter-label {
    font-weight: 600;
    margin-right: 4px;
  }

  .filter-value {
    font-weight: 400;
  }
}

.no-filters {
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}
</style>
