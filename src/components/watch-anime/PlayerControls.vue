<template>
  <q-card flat bordered class="player-controls q-mt-sm">
    <q-card-section class="q-py-md q-px-md">
      <div class="row items-center q-col-gutter-sm no-wrap">
        <!-- Left: Quick Navigation -->
        <div class="col-auto">
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
              <q-tooltip>{{ $t('watch.prevEpisode') }}</q-tooltip>
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
              <q-tooltip>{{ $t('watch.nextEpisode') }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Center: Player Controls -->
        <div class="col">
          <div class="row items-center q-gutter-xs justify-center">
            <q-btn
              dense
              flat
              :icon="isExpanded ? 'fullscreen_exit' : 'fullscreen'"
              class="icon-pulse gt-md"
              @click="$emit('toggle-expand')"
            >
              <q-tooltip>{{ isExpanded ? $t('watch.collapse') : $t('watch.expand') }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="isCinemaMode ? 'light_mode' : 'theaters'"
              class="icon-pulse"
              @click="$emit('toggle-cinema')"
            >
              <q-tooltip>{{
                isCinemaMode ? $t('watch.exitCinema') : $t('watch.cinemaMode')
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
              <q-tooltip>{{ $t('watch.autoPlay') }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="autoNext ? 'playlist_play' : 'playlist_play'"
              :color="autoNext ? 'primary' : 'grey'"
              class="icon-pulse"
              @click="$emit('toggle-auto-next')"
            >
              <q-tooltip>{{ $t('watch.autoNext') }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="autoSkipIntro ? 'fast_forward' : 'fast_forward'"
              :color="autoSkipIntro ? 'primary' : 'grey'"
              class="icon-pulse"
              @click="$emit('toggle-auto-skip-intro')"
            >
              <q-tooltip>{{ $t('watch.autoSkipIntro') }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Right: Watchlist -->
        <div class="col-auto">
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
                isInWatchlist ? $t('watch.removeFromWatchlist') : $t('watch.addToWatchlist')
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
  background: linear-gradient(135deg, rgba(24, 24, 24, 0.95), rgba(18, 18, 18, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
}

.neon-btn {
  border-color: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
}

.neon-btn:hover {
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

.icon-pulse {
  color: #b0b0b0;
}

.icon-pulse:hover {
  color: #ffffff;
}

@media (max-width: 1023px) {
  .player-controls :deep(.q-card__section) {
    padding: 12px !important;
  }
}

@media (max-width: 768px) {
  .player-controls .row {
    gap: 4px;
  }

  .player-controls .q-btn {
    min-width: auto;
  }

  .player-controls :deep(.q-card__section) {
    padding: 8px !important;
  }

  .player-controls .q-col-gutter-sm {
    margin-left: -2px;
    margin-right: -2px;
  }

  .player-controls .q-col-gutter-sm > * {
    padding-left: 2px;
    padding-right: 2px;
  }
}

.player-controls :deep(.q-btn--flat) {
  color: #c0c0c0;
}

.player-controls :deep(.q-btn--flat:hover) {
  color: #ffffff;
}

.player-controls :deep(.q-btn--outline.q-btn--standard) {
  background: rgba(255, 255, 255, 0.08);
}
</style>
