<template>
  <q-card flat bordered class="episode-card">
    <q-card-section class="episode-header">
      <!-- <div class="header-title">{{ $t('watch.episodes') }}:</div> -->
      <div class="header-left">
        <q-btn
          flat
          dense
          round
          icon="menu"
          size="sm"
          class="header-btn"
          @click="hasMultipleGroups ? openGroupSelect() : null"
          :disable="!hasMultipleGroups"
        >
          <q-tooltip>{{
            hasMultipleGroups ? $t('watch.selectEpisodeGroup') : $t('watch.episodeList')
          }}</q-tooltip>
        </q-btn>

        <q-select
          v-if="hasMultipleGroups"
          ref="groupSelectRef"
          dense
          outlined
          v-model="selectedGroupIndex"
          :options="groupOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          class="group-select"
        />
      </div>
      <q-input
        dense
        outlined
        v-model="search"
        :placeholder="$t('watch.searchEpisode')"
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
    </q-card-section>
    <q-separator />
    <q-card-section class="episode-grid-section">
      <div v-if="filteredEpisodes.length > 0" class="episode-grid">
        <div
          v-for="ep in filteredEpisodes"
          :key="ep.id"
          class="episode-item"
          :class="getEpisodeClass(ep)"
          @click="goTo(ep)"
        >
          <span class="episode-number">{{ ep.number || ep.sort_number || '?' }}</span>
        </div>
      </div>
      <div v-else class="no-episodes">
        <q-icon name="movie" size="40px" color="grey-6" />
        <div class="text-grey-6 q-mt-sm">{{ $t('watch.noEpisodes') }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
// import { linkWatch } from 'src/utils/helper'

const props = defineProps({
  // Can be either a flat array of episodes OR an object: { groups: [{ name, range_start, range_end, episodes: [...] }] }
  episodes: { type: [Array, Object], required: true },
  activeEpisodeId: { type: [String, Number], default: null },
  slug: { type: String, required: true },
  lastWatchedId: { type: [String, Number], default: null },
  // Array of episode IDs that user has clicked/visited before (for "watched" state - tím nhạt)
  watchedEpisodeIds: { type: Array, default: () => [] },
})

const router = useRouter()
const search = ref('')
const groupSelectRef = ref(null) // Reference to q-select component

// Normalize to groups
const groups = computed(() => {
  // If API returned groups structure
  if (
    props.episodes &&
    typeof props.episodes === 'object' &&
    Array.isArray(props.episodes.groups)
  ) {
    return props.episodes.groups
  }
  // Fallback: single group from flat list
  const list = Array.isArray(props.episodes) ? props.episodes : []
  return [{ name: 'All', range_start: null, range_end: null, episodes: list }]
})

const hasMultipleGroups = computed(() => groups.value.length > 1)
const groupOptions = computed(() =>
  groups.value.map((g, idx) => ({ label: g.name || `Group ${idx + 1}`, value: idx })),
)
const selectedGroupIndex = ref(0)

watch(
  () => ({
    groups: groups.value,
    activeId: props.activeEpisodeId,
  }),
  ({ groups, activeId }) => {
    if (!Array.isArray(groups) || !activeId) return

    const groupIndex = groups.findIndex(
      (group) => Array.isArray(group?.episodes) && group.episodes.some((ep) => ep.id === activeId),
    )

    if (groupIndex !== -1 && groupIndex !== selectedGroupIndex.value) {
      selectedGroupIndex.value = groupIndex
    }
  },
  { immediate: true },
)

const filteredEpisodes = computed(() => {
  const group = groups.value[selectedGroupIndex.value] || groups.value[0]
  const list = Array.isArray(group?.episodes) ? group.episodes : []
  const q = search.value.trim().toLowerCase()

  // console.log('Search:', q)
  // console.log('Episodes:', list)
  if (!q) return list
  return list.filter((e) =>
    String(e.title || e.number)
      .toLowerCase()
      .includes(q),
  )
})

function goTo(ep) {
  router.push(ep.link)
}

function openGroupSelect() {
  // Open the group select dropdown
  if (groupSelectRef.value) {
    groupSelectRef.value.showPopup()
  }
}

function getEpisodeClass(ep) {
  // Active episode - currently watching (tím đậm)
  if (ep.id === props.activeEpisodeId) return 'episode-active'

  // Last watched episode - tập đã xem trước đó (cam)
  if (ep.id === props.lastWatchedId) return 'episode-last-watched'

  // Special episode (ngoại truyện) - if API provides episode_type or is_special
  if (ep.episode_type === 'special' || ep.is_special) return 'episode-special'

  // All watched episodes - tất cả tập đã click vào (tím nhạt)
  // Logic giống "visited links" - chỉ những tập thực sự đã click mới được đánh dấu
  if (props.watchedEpisodeIds.includes(ep.id)) {
    return 'episode-watched'
  }

  // Default - not watched yet
  return 'episode-default'
}
</script>

<style scoped>
.episode-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 60%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e8e8e8;
}

.episode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.header-btn {
  color: #b0b0b0;
  transition: transform 0.2s ease;
}

.header-btn:hover {
  color: #e0e0e0;
  transform: scale(1.1);
}

.header-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #e8e8e8;
  white-space: nowrap;
}

.group-select {
  min-width: 120px;
  max-width: 180px;
}

.search-input {
  max-width: 180px;
}

.episode-card .q-input :deep(.q-field__native),
.episode-card .q-input :deep(.q-field__control),
.episode-card .q-select :deep(.q-field__native),
.episode-card .q-select :deep(.q-field__control) {
  color: #e0e0e0;
  font-size: 0.85rem;
}

.episode-grid-section {
  padding: 16px;
}

.no-episodes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.episode-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.episode-number {
  user-select: none;
}

/* Default - chưa xem */
.episode-default {
  background: rgba(60, 60, 60, 0.8);
  color: #b0b0b0;
}

.episode-default:hover {
  background: rgba(70, 70, 70, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Active - đang xem */
.episode-active {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

.episode-active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
}

/* Last watched - tập đã xem trước đó (cam) */
.episode-last-watched {
  background: linear-gradient(135deg, #d4a574 0%, #b8864f 100%);
  color: #ffffff;
}

.episode-last-watched:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

/* Watched - tất cả tập đã xem (tím nhạt) */
.episode-watched {
  /* background: linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%); */
  background: linear-gradient(135deg, #c8d3c0 0%, #a8b0a0 100%);
  color: #ffffff;
}

.episode-watched:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(216, 180, 254, 0.4);
}

/* Special - ngoại truyện */
.episode-special {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.episode-special:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Responsive */
@media (max-width: 1023px) {
  .episode-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .header-left {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: 150px;
  }
}

@media (max-width: 767px) {
  .episode-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .episode-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }
}

@media (max-width: 479px) {
  .episode-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
