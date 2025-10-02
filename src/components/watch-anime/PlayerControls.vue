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
              color="secondary"
              icon="skip_previous"
              :disable="!hasPrev"
              class="neon-btn"
              @click="$emit('go-prev')"
            >
              <q-tooltip>{{ $t('watch.prevEpisode') || 'Previous Episode' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              outline
              color="secondary"
              icon="skip_next"
              :disable="!hasNext"
              class="neon-btn"
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
              class="icon-pulse gt-md"
              @click="$emit('toggle-expand')"
            >
              <q-tooltip>{{
                isExpanded ? $t('watch.collapse') || 'Collapse' : $t('watch.expand') || 'Expand'
              }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="isCinemaMode ? 'light_mode' : 'theaters'"
              class="icon-pulse"
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
              class="icon-pulse"
              @click="$emit('toggle-auto-play')"
            >
              <q-tooltip>{{ $t('watch.autoPlay') || 'Auto Play' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="autoNext ? 'playlist_play' : 'playlist_play'"
              :color="autoNext ? 'primary' : 'grey'"
              class="icon-pulse"
              @click="$emit('toggle-auto-next')"
            >
              <q-tooltip>{{ $t('watch.autoNext') || 'Auto Next Episode' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="autoSkipIntro ? 'fast_forward' : 'fast_forward'"
              :color="autoSkipIntro ? 'primary' : 'grey'"
              class="icon-pulse"
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
              class="neon-btn"
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
  background: linear-gradient(135deg, rgba(33, 38, 68, 0.95), rgba(21, 23, 42, 0.95));
  border: 1px solid rgba(141, 151, 255, 0.25);
  color: #dfe3ff;
  box-shadow: 0 12px 30px rgba(15, 17, 35, 0.35);
}

.neon-btn {
  border-color: rgba(142, 151, 235, 0.6);
  color: #cfd6ff;
}

.neon-btn:hover {
  box-shadow: 0 0 12px rgba(136, 171, 255, 0.6);
}

.icon-pulse {
  color: #b3baff;
}

.icon-pulse:hover {
  color: #ffffff;
}

@media (max-width: 768px) {
  .player-controls .row {
    gap: 8px;
  }
}

.player-controls :deep(.q-btn--flat) {
  color: #c5cbff;
}

.player-controls :deep(.q-btn--flat:hover) {
  color: #ffffff;
}

.player-controls :deep(.q-btn--outline.q-btn--standard) {
  background: rgba(89, 101, 255, 0.12);
}
</style>
