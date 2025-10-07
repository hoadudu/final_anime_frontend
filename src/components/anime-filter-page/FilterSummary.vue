<template>
  <div v-if="hasActiveFilters" class="filter-summary">
    <q-chip
      v-for="(filter, key) in activeFilterEntries"
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

const { t } = useI18n()

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

const activeFilterEntries = computed(() => {
  return Object.entries(props.activeFilters).filter(
    ([, filter]) => filter && (Array.isArray(filter) ? filter.length > 0 : true),
  )
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
  if (Array.isArray(value)) {
    return value.length > 1 ? `${value.length} ${t('filter.selected')}` : value[0]
  }

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
