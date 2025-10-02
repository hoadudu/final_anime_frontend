<template>
  <q-card flat bordered class="episode-card">
    <q-card-section class="row items-center">
      <div class="text-h6">{{ $t('watch.episodes') || 'Episodes' }}</div>

      <div class="row items-center q-ml-auto" style="gap: 8px">
        <q-select
          v-if="hasMultipleGroups"
          dense
          outlined
          v-model="selectedGroupIndex"
          :options="groupOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          style="min-width: 180px"
        />
        <q-input
          dense
          outlined
          v-model="search"
          :placeholder="$t('watch.searchEpisode') || 'Search episode'"
          style="max-width: 240px"
        />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row q-col-gutter-sm">
        <div v-for="ep in filteredEpisodes" :key="ep.id" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-btn
            :color="buttonColor(ep)"
            :flat="ep.id !== activeEpisodeId"
            :class="buttonClasses(ep)"
            unelevated
            @click="goTo(ep)"
          >
            <span>{{ ep.title || 'Ep ' + (ep.number || '') }}</span>
            <q-badge v-if="ep.id === activeEpisodeId" color="secondary" align="top">
              {{ $t('watch.watching') || 'Watching' }}
            </q-badge>
            <q-badge
              v-else-if="ep.id === lastWatchedId"
              color="grey-7"
              text-color="white"
              align="top"
            >
              {{ $t('watch.lastWatched') || 'Last watched' }}
            </q-badge>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
// import { linkWatch } from 'src/utils/helper'

const props = defineProps({
  // Can be either a flat array of episodes OR an object: { groups: [{ name, range_start, range_end, episodes: [...] }] }
  episodes: { type: [Array, Object], required: true },
  activeEpisodeId: { type: [String, Number], default: null },
  slug: { type: String, required: true },
  lastWatchedId: { type: [String, Number], default: null },
})

const router = useRouter()
const search = ref('')

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

const filteredEpisodes = computed(() => {
  const group = groups.value[selectedGroupIndex.value] || groups.value[0]
  const list = Array.isArray(group?.episodes) ? group.episodes : []
  const q = search.value.trim().toLowerCase()
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

function buttonColor(ep) {
  if (ep.id === props.activeEpisodeId) return 'accent'
  if (ep.id === props.lastWatchedId) return 'deep-purple-6'
  return 'grey-7'
}

function buttonClasses(ep) {
  return [
    'full-width',
    'q-mb-sm',
    'justify-between',
    'episode-btn',
    {
      'episode-btn--last': ep.id === props.lastWatchedId && ep.id !== props.activeEpisodeId,
    },
  ]
}
</script>

<style scoped>
.episode-card {
  background: linear-gradient(135deg, #1b1f3a 0%, #282a4b 60%, #1a1d33 100%);
  border: 1px solid rgba(142, 151, 235, 0.2);
  color: #f2f4ff;
}

.episode-card .text-h6 {
  color: #f8f9ff;
  letter-spacing: 0.5px;
}

.episode-card .q-input :deep(.q-field__native),
.episode-card .q-input :deep(.q-field__control) {
  color: #e0e6ff;
}

.episode-btn {
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.15s ease;
  background: rgba(255, 255, 255, 0.05);
  color: #cfd5ff;
}

.episode-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
}

.episode-btn--last {
  color: #607d8b;
  background-color: rgba(96, 125, 139, 0.12);
}

.episode-btn--last:hover {
  background-color: rgba(96, 125, 139, 0.2);
}

.episode-btn.q-btn--flat {
  color: #9da6ff;
}
</style>
