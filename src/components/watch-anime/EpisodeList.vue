<template>
  <q-card flat bordered>
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
            :color="ep.id === activeEpisodeId ? 'primary' : 'grey-8'"
            :flat="ep.id !== activeEpisodeId"
            class="full-width q-mb-sm"
            @click="goTo(ep)"
          >
            {{ ep.title || 'Ep ' + (ep.number || '') }}
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // Can be either a flat array of episodes OR an object: { groups: [{ name, range_start, range_end, episodes: [...] }] }
  episodes: { type: [Array, Object], required: true },
  activeEpisodeId: { type: [String, Number], default: null },
  slug: { type: String, required: true },
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
  const number = ep.number || ep.sort_number || ''
  const id = ep.id
  router.push({ name: 'site-watch', params: { slug: props.slug, number, id } })
}
</script>
