<template>
  <q-card flat bordered class="player-controls q-mt-sm">
    <q-card-section class="q-pa-sm">
      <div class="row items-center q-col-gutter-sm">
        <!-- Left: Quick Navigation -->
        <div class="col-12 col-md-auto">
          <div class="row q-gutter-xs no-wrap">
            <q-btn
              dense
              outline
              color="primary"
              icon="skip_previous"
              :disable="!hasPrev"
              @click="$emit('go-prev')"
            >
              <q-tooltip>{{ $t('watch.prevEpisode') || 'Previous Episode' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              outline
              color="primary"
              icon="skip_next"
              :disable="!hasNext"
              @click="$emit('go-next')"
            >
              <q-tooltip>{{ $t('watch.nextEpisode') || 'Next Episode' }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Center: Player Controls -->
        <div class="col-12 col-md">
          <div class="row items-center q-gutter-xs justify-center">
            <q-btn
              dense
              flat
              :icon="isExpanded ? 'fullscreen_exit' : 'fullscreen'"
              @click="$emit('toggle-expand')"
              class="gt-md"
            >
              <q-tooltip>{{
                isExpanded ? $t('watch.collapse') || 'Collapse' : $t('watch.expand') || 'Expand'
              }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="isCinemaMode ? 'light_mode' : 'theaters'"
              @click="$emit('toggle-cinema')"
            >
              <q-tooltip>{{
                isCinemaMode
                  ? $t('watch.exitCinema') || 'Exit Cinema Mode'
                  : $t('watch.cinemaMode') || 'Cinema Mode'
              }}</q-tooltip>
            </q-btn>

            <q-separator vertical inset class="q-mx-xs" />

            <q-btn
              dense
              flat
              :icon="autoPlay ? 'play_circle' : 'play_circle_outline'"
              :color="autoPlay ? 'primary' : 'grey'"
              @click="$emit('toggle-auto-play')"
            >
              <q-tooltip>{{ $t('watch.autoPlay') || 'Auto Play' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="autoNext ? 'playlist_play' : 'playlist_play'"
              :color="autoNext ? 'primary' : 'grey'"
              @click="$emit('toggle-auto-next')"
            >
              <q-tooltip>{{ $t('watch.autoNext') || 'Auto Next Episode' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="autoSkipIntro ? 'fast_forward' : 'fast_forward'"
              :color="autoSkipIntro ? 'primary' : 'grey'"
              @click="$emit('toggle-auto-skip-intro')"
            >
              <q-tooltip>{{ $t('watch.autoSkipIntro') || 'Auto Skip Intro' }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Right: Watchlist -->
        <div class="col-12 col-md-auto">
          <div class="row q-gutter-xs no-wrap justify-end">
            <q-btn
              dense
              :outline="!isInWatchlist"
              :color="isInWatchlist ? 'positive' : 'grey-7'"
              :icon="isInWatchlist ? 'bookmark' : 'bookmark_border'"
              @click="$emit('toggle-watchlist')"
            >
              <q-tooltip>{{
                isInWatchlist
                  ? $t('watch.removeFromWatchlist') || 'Remove from Watchlist'
                  : $t('watch.addToWatchlist') || 'Add to Watchlist'
              }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
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
</script>

<style scoped>
.player-controls {
  background: var(--q-dark, #f5f5f5);
}

@media (max-width: 768px) {
  .player-controls .row {
    gap: 8px;
  }
}
</style>
