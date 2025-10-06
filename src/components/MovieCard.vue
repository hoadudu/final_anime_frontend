<template>
  <div class="movie-card-wrapper" @click="handleClick">
    <q-card flat bordered class="movie-card cursor-pointer full-height">
      <div class="movie-poster-container">
        <!-- Age Rating Badge (18+) -->
        <q-badge
          v-if="showAgeRating && anime.ageRating === '18+'"
          floating
          color="red"
          class="age-rating-badge"
        >
          18+
        </q-badge>

        <!-- Episode Info Badges (Bottom-Left) -->
        <div v-if="showEpisodeBadges" class="movie-badges">
          <!-- Sub Count Badge -->
          <q-badge
            v-if="anime.subCount || anime.sub"
            color="blue"
            text-color="white"
            class="movie-badge"
          >
            <q-icon name="closed_caption" size="12px" class="q-mr-xs" />
            {{ anime.subCount || 'SUB' }}
          </q-badge>

          <!-- Dub Count Badge -->
          <q-badge
            v-if="anime.dubCount || anime.dub"
            color="green"
            text-color="white"
            class="movie-badge q-ml-xs"
          >
            <q-icon name="mic" size="12px" class="q-mr-xs" />
            {{ anime.dubCount || 'DUB' }}
          </q-badge>

          <!-- Total Episodes Badge -->
          <q-badge
            v-if="anime.totalEpisodes || anime.episodes"
            color="orange"
            text-color="white"
            class="movie-badge q-ml-xs"
          >
            {{ anime.totalEpisodes || anime.episodes }}
          </q-badge>
        </div>

        <!-- Status Badge (Top-Right) - Alternative to age rating -->
        <q-badge
          v-if="showStatusBadge && anime.status && !showAgeRating"
          :color="getStatusColor(anime.status)"
          text-color="white"
          class="status-badge"
        >
          {{ getStatusText(anime.status) }}
        </q-badge>

        <!-- Type Badge (Top-Right) -->
        <q-chip
          v-if="showTypeBadge && anime.type"
          :color="getTypeColor(anime.type)"
          text-color="white"
          size="sm"
          dense
          class="type-badge"
        >
          {{ anime.type.toUpperCase() }}
        </q-chip>

        <!-- Poster Image -->
        <div class="movie-poster-wrapper">
          <q-img
            :src="getPosterUrl"
            :alt="getTitle"
            fit="cover"
            class="movie-poster"
            loading="lazy"
            spinner-color="primary"
            :ratio="posterRatio"
            @error="handleImageError"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-grey-8">
                <q-icon name="broken_image" size="48px" color="grey-5" />
              </div>
            </template>

            <!-- Play Overlay -->
            <div v-if="showPlayOverlay" class="play-overlay">
              <q-btn round color="primary" icon="play_arrow" size="lg" class="play-button" />
              <div v-if="overlayText" class="overlay-text q-mt-sm">
                {{ overlayText }}
              </div>
            </div>
          </q-img>
        </div>

        <!-- Tooltip (optional) -->
        <slot name="tooltip">
          <MovieTooltip v-if="showTooltip" :movie="transformedAnimeData" />
        </slot>
      </div>

      <!-- Card Details -->
      <q-card-section class="movie-details">
        <!-- Title -->
        <h3 class="movie-title" :title="getTitle">
          {{ getTitle }}
        </h3>

        <!-- Subtitle / English Title -->
        <!-- <p
          v-if="showSubtitle && getSubtitle"
          class="movie-subtitle text-grey-6"
          :title="getSubtitle"
        >
          {{ getSubtitle }}
        </p> -->

        <!-- Meta Info (Type + Duration) -->
        <div v-if="showMeta" class="movie-meta">
          <span class="movie-type">{{ anime.type || 'TV' }}</span>
          <q-icon name="circle" size="4px" class="meta-separator" />
          <span class="movie-duration">{{ anime.duration || '24m' }}</span>
        </div>

        <!-- Genres (optional) -->
        <div
          v-if="showGenres && anime.genres && anime.genres.length > 0"
          class="genres-container q-mt-xs"
        >
          <q-chip
            v-for="(genre, index) in anime.genres.slice(0, maxGenres)"
            :key="index"
            size="sm"
            outline
            color="primary"
            text-color="primary"
            class="genre-chip"
          >
            {{ genre }}
          </q-chip>
        </div>

        <!-- Custom Slot for additional content -->
        <slot name="extra-content"></slot>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MovieTooltip from './MovieTooltip.vue'

// ========== PROPS ==========
const props = defineProps({
  // Anime data object
  anime: {
    type: Object,
    required: true,
    default: () => ({}),
  },

  // Display options
  showAgeRating: {
    type: Boolean,
    default: true,
  },
  showEpisodeBadges: {
    type: Boolean,
    default: true,
  },
  showStatusBadge: {
    type: Boolean,
    default: false, // Chỉ hiển thị trong search page
  },
  showTypeBadge: {
    type: Boolean,
    default: false, // Chỉ hiển thị trong search page
  },
  showPlayOverlay: {
    type: Boolean,
    default: true,
  },
  showTooltip: {
    type: Boolean,
    default: true,
  },
  showSubtitle: {
    type: Boolean,
    default: false, // English title
  },
  showMeta: {
    type: Boolean,
    default: true, // Type + Duration
  },
  showGenres: {
    type: Boolean,
    default: false,
  },

  // Customization
  posterRatio: {
    type: [String, Number],
    default: '3/4', // 3:4 aspect ratio
  },
  overlayText: {
    type: String,
    default: '', // Text hiển thị trong play overlay (VD: "Xem ngay", "View Details")
  },
  maxGenres: {
    type: Number,
    default: 3,
  },

  // Card size variant
  size: {
    type: String,
    default: 'normal', // 'small', 'normal', 'large'
    validator: (value) => ['small', 'normal', 'large'].includes(value),
  },
})

// ========== EMITS ==========
const emit = defineEmits(['click', 'image-error'])

// ========== COMPOSABLES ==========
const { t } = useI18n()

// ========== COMPUTED ==========

/**
 * Get poster URL from various possible fields
 */
const getPosterUrl = computed(() => {
  return (
    props.anime.poster || props.anime.image || props.anime.thumbnail || props.anime.coverImage || ''
  )
})

/**
 * Get title from various possible fields
 */
const getTitle = computed(() => {
  return props.anime.title || props.anime.name || t('common.untitled')
})

/**
 * Get subtitle (English title or alternative title)
 */
const getSubtitle = computed(() => {
  // Try to get English title from titles array
  if (props.anime.titles && Array.isArray(props.anime.titles)) {
    const englishTitle = props.anime.titles.find(
      (t) => t.language === 'English' || t.language === 'Synonyms',
    )
    if (englishTitle?.title) return englishTitle.title
  }

  // Fallback to altTitle or alternativeTitle
  return props.anime.altTitle || props.anime.alternativeTitle || ''
})

/**
 * Transform anime data for MovieTooltip
 */
const transformedAnimeData = computed(() => {
  return {
    id: props.anime.id,
    title: getTitle.value,
    link: props.anime.link,
    titles: props.anime.titles || [],
    altTitle: getSubtitle.value,
    type: props.anime.type || 'TV',
    duration: props.anime.duration || '24m',
    poster: getPosterUrl.value,
    description: props.anime.description || '',
    rating: props.anime.rating || props.anime.score || '8.5',
    year: props.anime.year || props.anime.releaseDate || new Date().getFullYear(),
    genres: props.anime.genres || [],
    status: props.anime.status || 'Unknown',
    episodeNumber: props.anime.episodeNumber || props.anime.episode,
    latestEpisode: props.anime.latestEpisode || props.anime.currentEpisode,
  }
})

// ========== METHODS ==========

/**
 * Handle card click
 */
const handleClick = () => {
  emit('click', props.anime)
}

/**
 * Handle image error
 */
const handleImageError = (event) => {
  emit('image-error', event)
  console.warn('Image failed to load:', getPosterUrl.value)
}

/**
 * Get status badge color
 */
const getStatusColor = (status) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('ongoing') || statusLower.includes('airing')) {
    return 'positive'
  } else if (statusLower.includes('completed')) {
    return 'grey-7'
  } else if (statusLower.includes('upcoming')) {
    return 'warning'
  }
  return 'grey-6'
}

/**
 * Get status text
 */
const getStatusText = (status) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('ongoing') || statusLower.includes('airing')) {
    return 'Đang phát'
  } else if (statusLower.includes('completed')) {
    return 'Hoàn thành'
  } else if (statusLower.includes('upcoming')) {
    return 'Sắp ra'
  }
  return status
}

/**
 * Get type badge color
 */
const getTypeColor = (type) => {
  const typeLower = type.toLowerCase()
  switch (typeLower) {
    case 'tv':
      return 'blue'
    case 'movie':
      return 'purple'
    case 'ova':
      return 'orange'
    case 'ona':
      return 'teal'
    case 'special':
      return 'pink'
    default:
      return 'grey'
  }
}
</script>

<style lang="scss" scoped>
// ========== MOVIE CARD WRAPPER ==========
.movie-card-wrapper {
  cursor: pointer;
  position: relative;
  height: 100%;

  // Size variants
  &.size-small {
    .movie-title {
      font-size: 0.7rem;
    }
    .movie-meta {
      font-size: 0.6rem;
    }
  }

  &.size-large {
    .movie-title {
      font-size: 0.9rem;
    }
    .movie-meta {
      font-size: 0.75rem;
    }
  }
}

// ========== MOVIE CARD ==========
.movie-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(0, 212, 255, 0.4);
    transform: translateY(-6px);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(0, 212, 255, 0.2);

    .play-overlay {
      opacity: 1;
      visibility: visible;
    }

    .movie-title {
      color: #00d4ff;
    }

    .movie-poster {
      transform: scale(1.05);
    }
  }
}

// ========== POSTER CONTAINER ==========
.movie-poster-container {
  position: relative;
  width: 100%;

  // Age Rating Badge (Top-Right)
  .age-rating-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 20;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;

    @media (max-width: 599px) {
      top: 6px;
      right: 6px;
      font-size: 0.6rem;
      padding: 2px 6px;
    }
  }

  // Status Badge (Top-Right)
  .status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 20;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;

    @media (max-width: 599px) {
      top: 6px;
      right: 6px;
      font-size: 0.65rem;
      padding: 3px 8px;
    }
  }

  // Type Badge (Top-Left)
  .type-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 20;
    font-weight: 700;
    letter-spacing: 0.5px;

    @media (max-width: 599px) {
      top: 6px;
      left: 6px;
    }
  }

  // Episode Info Badges (Bottom-Left)
  .movie-badges {
    position: absolute;
    bottom: 8px;
    left: 8px;
    z-index: 20;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    @media (max-width: 599px) {
      bottom: 6px;
      left: 6px;
      gap: 3px;
    }

    .movie-badge {
      font-size: 0.6rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
      background: rgba(0, 0, 0, 0.8) !important;
      border-radius: 4px;
      padding: 2px 6px;
      min-height: auto;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 599px) {
        font-size: 0.55rem;
        padding: 2px 4px;
      }
    }
  }

  // Poster Wrapper
  .movie-poster-wrapper {
    width: 100%;
    aspect-ratio: 3/4; // Cố định tỷ lệ 3:4 (quan trọng!)
    position: relative;
    overflow: hidden;
    border-radius: 8px 8px 0 0;

    .movie-poster {
      width: 100%;
      height: 100%;
      display: block; // Quan trọng: đảm bảo không có space dư
      transition: transform 0.4s ease;

      :deep(.q-img__container) {
        width: 100%;
        height: 100%;
      }

      :deep(.q-img__content) {
        width: 100%;
        height: 100%;
      }

      :deep(.q-img__image) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      :deep(.q-img__error) {
        border-radius: 8px 8px 0 0;
        background: #2a2a2a;
      }
    }

    // Play Overlay
    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      transition: all 0.3s ease;
      border-radius: 8px 8px 0 0;
      z-index: 10;

      .play-button {
        background: rgba(0, 212, 255, 0.95);
        color: white;
        box-shadow:
          0 4px 16px rgba(0, 212, 255, 0.5),
          0 0 0 4px rgba(0, 212, 255, 0.1);

        &:hover {
          background: #00d4ff;
          transform: scale(1.15);
          box-shadow:
            0 6px 20px rgba(0, 212, 255, 0.6),
            0 0 0 6px rgba(0, 212, 255, 0.2);
        }

        @media (max-width: 599px) {
          width: 40px;
          height: 40px;

          :deep(.q-icon) {
            font-size: 18px;
          }
        }
      }

      .overlay-text {
        color: rgba(255, 255, 255, 0.95);
        font-weight: 600;
        font-size: 0.85rem;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        text-align: center;

        @media (max-width: 599px) {
          font-size: 0.75rem;
        }
      }
    }
  }
}

// ========== CARD DETAILS ==========
.movie-details {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 68px;

  @media (max-width: 991px) {
    padding: 8px;
    min-height: 64px;
  }

  @media (max-width: 599px) {
    padding: 6px;
    min-height: 60px;
  }

  // Title
  .movie-title {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
    font-size: 0.8rem;
    line-height: 1.3;
    margin: 0 0 6px 0;
    height: 2.6em; // Cố định chiều cao cho 2 dòng
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    transition: color 0.3s ease;

    @media (max-width: 991px) {
      font-size: 0.75rem;
      height: 2.4em;
    }

    @media (max-width: 599px) {
      font-size: 0.7rem;
      height: 2.2em;
    }
  }

  // Subtitle (English Title)
  .movie-subtitle {
    font-size: 0.7rem;
    line-height: 1.2;
    margin: 0 0 6px 0;
    color: rgba(255, 255, 255, 0.7);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;

    @media (max-width: 599px) {
      font-size: 0.65rem;
    }
  }

  // Meta Info (Type + Duration)
  .movie-meta {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.7rem;
    margin-top: auto;

    @media (max-width: 991px) {
      font-size: 0.65rem;
    }

    @media (max-width: 599px) {
      font-size: 0.6rem;
    }

    .movie-type {
      font-weight: 600;
      text-transform: uppercase;
      color: #00d4ff;
    }

    .meta-separator {
      margin: 0 4px;
      color: rgba(255, 255, 255, 0.3);

      @media (max-width: 599px) {
        margin: 0 3px;
      }
    }

    .movie-duration {
      font-weight: 500;
    }
  }

  // Genres
  .genres-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;

    .genre-chip {
      font-size: 0.65rem;
      height: 20px;
      border-radius: 4px;

      @media (max-width: 599px) {
        font-size: 0.6rem;
        height: 18px;
      }
    }
  }
}

// ========== RESPONSIVE ADJUSTMENTS ==========
@media (max-width: 599px) {
  .movie-card {
    border-radius: 10px;

    .movie-poster-container {
      .movie-poster-wrapper {
        border-radius: 6px 6px 0 0;
      }
    }
  }
}
</style>
