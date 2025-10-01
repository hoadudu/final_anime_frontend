<template>
  <q-card flat bordered class="watch-player">
    <q-card-section>
      <div class="text-h6 q-mb-sm">{{ title }}</div>
      <div class="player-wrapper">
        <iframe
          v-if="activeStreamUrl"
          class="player-iframe"
          :src="embedUrl(activeStreamUrl)"
          frameborder="0"
          allowfullscreen
        />
        <div v-else class="flex flex-center q-pa-lg text-grey">
          {{ $t('watch.noStream') || 'No stream available' }}
        </div>
      </div>
      <div class="q-mt-md row items-center q-col-gutter-sm">
        <q-select
          dense
          outlined
          class="col-12 col-md-4"
          v-model="selectedQuality"
          :options="qualityOptions"
          :label="$t('watch.quality') || 'Quality'"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  episode: { type: Object, required: true },
})

const qualityOptions = computed(() =>
  (props.episode?.streams || []).map((s) => ({ label: s.quality || 'auto', value: s.url })),
)
const selectedQuality = ref(qualityOptions.value?.[0]?.value || null)

watch(qualityOptions, (opts) => {
  if (!opts || opts.length === 0) {
    selectedQuality.value = null
  } else if (!opts.find((o) => o.value === selectedQuality.value)) {
    selectedQuality.value = opts[0].value
  }
})

const activeStreamUrl = computed(() => selectedQuality.value)

const title = computed(() => {
  const e = props.episode
  const name = e?.title || 'Episode ' + (e?.number || '')
  const anime = e?.anime?.title ? `${e.anime.title} - ` : ''
  return anime + name
})

function embedUrl(url) {
  // Some providers need special embedding; default to url
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/d\/([^/]+)/)
    const id = idMatch ? idMatch[1] : null
    return id ? `https://drive.google.com/file/d/${id}/preview` : url
  }
  return url
}
</script>

<style scoped>
.player-wrapper {
  position: relative;
  padding-top: 56.25%;
}
.player-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
