<template>
  <q-card class="watch-player">
    <q-card-section class="q-pa-none">
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
    </q-card-section>

    <PlayerControls
      v-if="episode"
      class="player-controls"
      :has-prev="hasPrev"
      :has-next="hasNext"
      :is-expanded="isExpanded"
      :is-cinema-mode="isCinemaMode"
      :auto-play="autoPlay"
      :auto-next="autoNext"
      :auto-skip-intro="autoSkipIntro"
      :is-in-watchlist="isInWatchlist"
      @go-prev="$emit('go-prev')"
      @go-next="$emit('go-next')"
      @toggle-expand="$emit('toggle-expand')"
      @toggle-cinema="$emit('toggle-cinema')"
      @toggle-auto-play="$emit('toggle-auto-play')"
      @toggle-auto-next="$emit('toggle-auto-next')"
      @toggle-auto-skip-intro="$emit('toggle-auto-skip-intro')"
      @toggle-watchlist="$emit('toggle-watchlist')"
    />

    <q-card-section v-if="serverOptions.length" class="server-section">
      <div class="row q-col-gutter-lg items-start">
        <div class="col-12 col-lg-4">
          <div class="server-info-card">
            <div class="text-caption text-grey-7 text-uppercase">
              {{ $t('watch.nowWatching') || 'You are watching' }}
            </div>
            <div class="text-subtitle1 text-weight-medium q-mt-xs">
              {{ episode?.title || `${$t('watch.episode') || 'Episode'} ${episode?.number || ''}` }}
            </div>
            <div class="text-caption text-grey-6 q-mt-md">
              {{
                $t(
                  'watch.tryOtherServers',
                  'If current server does not work, please try other servers beside.',
                )
              }}
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="text-caption text-grey-7 q-mb-xs">
            {{ $t('watch.servers') || 'Servers' }}
          </div>
          <div class="row q-col-gutter-sm">
            <div v-for="option in serverOptions" :key="option.value" class="col-auto">
              <q-btn
                dense
                no-caps
                :color="option.value === selectedServerIndex ? 'primary' : 'grey-8'"
                :flat="option.value !== selectedServerIndex"
                @click="selectedServerIndex = option.value"
              >
                <q-icon
                  v-if="option.codeIcon"
                  :name="option.codeIcon"
                  size="16px"
                  class="q-mr-xs"
                />
                <span>{{ option.label }}</span>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PlayerControls from './PlayerControls.vue'

const props = defineProps({
  episode: { type: Object, required: true },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  isCinemaMode: { type: Boolean, default: false },
  autoPlay: { type: Boolean, default: false },
  autoNext: { type: Boolean, default: false },
  autoSkipIntro: { type: Boolean, default: false },
  isInWatchlist: { type: Boolean, default: false },
})

defineEmits([
  'go-prev',
  'go-next',
  'toggle-expand',
  'toggle-cinema',
  'toggle-auto-play',
  'toggle-auto-next',
  'toggle-auto-skip-intro',
  'toggle-watchlist',
])

const streams = computed(() => props.episode?.streams || [])

const serverOptions = computed(() =>
  streams.value.map((stream, index) => ({
    label: getStreamLabel(stream, index),
    value: index,
    code: stream?.code || null,
    codeIcon: streamCodeIcon(stream?.code),
  })),
)

const selectedServerIndex = ref(0)

watch(
  () => props.episode?.id,
  () => {
    selectedServerIndex.value = 0
  },
)

watch(streams, (newStreams) => {
  if (!newStreams.length) {
    selectedServerIndex.value = 0
  } else if (selectedServerIndex.value >= newStreams.length) {
    selectedServerIndex.value = 0
  }
})

const currentStream = computed(() => streams.value[selectedServerIndex.value] || null)

const activeStreamUrl = computed(() => currentStream.value?.url || null)

function embedUrl(url) {
  if (url?.includes('drive.google.com')) {
    const idMatch = url.match(/\/d\/([^/]+)/)
    const id = idMatch ? idMatch[1] : null
    return id ? `https://drive.google.com/file/d/${id}/preview` : url
  }
  return url
}

function getStreamLabel(stream, index) {
  if (stream?.server_name) return stream.server_name
  if (stream?.label) return stream.label
  if (stream?.provider) return stream.provider
  if (stream?.quality) return stream.quality
  if (stream?.url?.includes('drive.google')) return `Google Drive ${index + 1}`
  if (stream?.url?.includes('animevui')) return `AnimeVui ${index + 1}`
  if (stream?.url?.includes('short.ink')) return `ShortLink ${index + 1}`
  return `Server ${index + 1}`
}

function streamCodeIcon(code) {
  if (!code) return null
  const normalized = String(code).toLowerCase()
  if (normalized.includes('sub')) return 'closed_caption'
  if (normalized.includes('dub')) return 'mic'
  return 'visibility'
}
</script>

<style scoped>
.watch-player {
  background: linear-gradient(160deg, rgba(18, 22, 37, 0.96), rgba(30, 28, 52, 0.96));
  border: 1px solid rgba(140, 148, 255, 0.25);
  color: #e8ecff;
  box-shadow: 0 18px 45px rgba(8, 12, 32, 0.45);
}

.player-wrapper {
  position: relative;
  padding-top: 75.25%;
}

.player-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.player-controls {
  padding: 16px 16px 0;
}

.server-section {
  padding: 12px 16px 20px;
}

.server-info-card {
  background: rgba(64, 73, 128, 0.18);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(142, 151, 235, 0.3);
}

.server-buttons .q-btn {
  min-width: 90px;
  background: rgba(255, 255, 255, 0.06);
  color: #d5daff;
}

.server-buttons .q-btn.q-btn--standard {
  box-shadow: 0 0 12px rgba(103, 118, 255, 0.35);
}

.server-buttons .q-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 14px rgba(155, 166, 255, 0.45);
}

@media (max-width: 1023px) {
  .player-controls {
    padding: 12px 12px 0;
  }

  .server-section {
    padding: 12px;
  }
}
</style>
