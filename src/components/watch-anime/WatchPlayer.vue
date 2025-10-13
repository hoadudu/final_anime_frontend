<template>
  <q-card class="watch-player">
    <q-card-section class="q-pa-none">
      <div class="player-wrapper" :class="{ 'jw-active': isJWPlayer }">
        <template v-if="isJWPlayer">
          <div class="jw-holder">
            <div :id="jwContainerId" ref="jwContainer" class="jw-player-container" />
          </div>
        </template>
        <iframe
          v-else-if="activeStreamUrl"
          class="player-iframe"
          :src="embedUrl(activeStreamUrl)"
          frameborder="0"
          allowfullscreen
        />
        <!-- Overlay thông báo -->
        <div v-else class="no-stream-overlay flex flex-center column">
          <q-icon name="warning" size="60px" color="warning" class="q-mb-md" />
          <div class="text-h6 text-grey-4 q-mb-sm">{{ $t('watch.noStream') }}</div>
          <div class="text-caption text-grey-5 text-center">
            {{ $t('watch.noStreamDescription') }}
          </div>
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
              {{ $t('watch.nowWatching') }}
            </div>
            <div class="text-subtitle1 text-weight-medium q-mt-xs">
              {{ episode?.title || `${$t('watch.episode')} ${episode?.number || ''}` }}
            </div>
            <div class="text-caption text-grey-6 q-mt-md">
              {{ $t('watch.tryOtherServers') }}
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="text-caption text-bold text-grey-7 q-mb-xs">
            {{ $t('watch.servers') }}
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
                  size="25px"
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
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
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
const jwContainer = ref(null)
const jwInstance = ref(null)
let jwScriptPromise = null
const jwContainerId = `jw-player-${Math.random().toString(36).slice(2)}`

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

const isJWPlayer = computed(() => currentStream.value?.player_type === 'jwplayer')

const activeStreamUrl = computed(() => currentStream.value?.url || null)

watch(
  () => ({ stream: currentStream.value, isJW: isJWPlayer.value }),
  async ({ stream, isJW }) => {
    if (jwInstance.value?.remove) {
      try {
        jwInstance.value.remove()
      } catch (err) {
        console.warn('Failed to remove JW instance', err)
      }
      jwInstance.value = null
    }

    if (isJW && stream?.url) {
      await ensureJWScript()
      await nextTick()

      const containerEl = jwContainer.value
      if (!containerEl) return

      const containerId = containerEl.id || jwContainerId
      if (!containerEl.id) {
        containerEl.id = containerId
      }

      const tracks = Array.isArray(stream.subtitles)
        ? stream.subtitles.map((sub) => ({
            file: sub.file,
            label: sub.label,
            default: sub.default,
          }))
        : []

      jwInstance.value = window.jwplayer(containerId).setup({
        sources: [
          {
            type: 'hls',
            file: jwPlayerUrl(stream.url),
          },
        ],
        width: '100%',
        height: '100%',
        controls: true,
        autostart: false,
        tracks,
      })
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (jwInstance.value?.remove) {
    try {
      jwInstance.value.remove()
    } catch (err) {
      console.warn('Failed to remove JW instance', err)
    }
    jwInstance.value = null
  }
})

async function ensureJWScript() {
  if (!process.env.CLIENT) return
  if (window.jwplayer) return
  if (!jwScriptPromise) {
    jwScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/jw/v/8.26.9/jwplayer.js'
      script.async = true
      script.onload = () => {
        if (window.jwplayer && !window.jwplayer.key) {
          window.jwplayer.key =
            process.env.JWPLAYER_KEY || 'W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99'
        }
        resolve()
      }
      script.onerror = (err) => reject(err)
      document.body.appendChild(script)
    })
  }
  await jwScriptPromise
}

function jwPlayerUrl(url) {
  console.log('jwPlayerUrl', url)

  return url
}

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
  background: linear-gradient(160deg, rgba(18, 18, 18, 0.98), rgba(26, 26, 26, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e8e8e8;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
}

.player-wrapper {
  position: relative;
  padding-top: 65.25%;
}

.player-wrapper.jw-active {
  padding-top: 0;
}

.player-wrapper.jw-active .jw-holder {
  position: relative;
  padding-top: 65.25%;
}

.player-wrapper.jw-active .jw-holder > div,
.player-wrapper.jw-active .jw-holder :deep(> div),
.player-wrapper.jw-active .jw-holder :deep([id^='jw-player-']) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.player-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.server-section {
  padding: 12px 16px 20px;
}

.server-info-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.server-buttons .q-btn {
  min-width: 90px;
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
}

.server-buttons .q-btn.q-btn--standard {
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
}

.server-buttons .q-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.2);
}

.no-stream-container {
  min-height: 300px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}
.no-stream-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}

@media (max-width: 1023px) {
  .server-section {
    padding: 12px;
  }
}
</style>
