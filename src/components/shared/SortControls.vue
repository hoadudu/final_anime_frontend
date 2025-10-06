<template>
  <div class="sort-controls-wrapper">
    <q-icon name="sort" size="20px" class="q-mr-sm text-grey-6" />
    <span class="text-body2 text-grey-7 q-mr-md">{{ $t('genres.sortBy') }}:</span>
    <q-select
      :model-value="modelValue"
      :options="sortOptions"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      outlined
      dense
      class="sort-select"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

// Emits
defineEmits(['update:modelValue'])

// Sort options
const sortOptions = computed(() => [
  { value: 'latest', label: t('genres.sortLatest') },
  { value: 'oldest', label: t('genres.sortOldest') },
  { value: 'title', label: t('genres.sortTitle') },
  { value: 'rating', label: t('genres.sortRating') },
  { value: 'views', label: t('genres.sortViews') },
])
</script>

<style lang="scss" scoped>
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

// Responsive
@media (max-width: 767px) {
  .sort-controls-wrapper {
    padding: 10px 14px;
    gap: 8px;
    flex-wrap: wrap;

    .sort-select {
      min-width: 160px;

      :deep(.q-field__native) {
        font-size: 0.85rem;
      }
    }
  }
}
</style>
