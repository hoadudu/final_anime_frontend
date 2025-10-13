<template>
  <div class="hero-section">
    <q-carousel
      v-model="slide"
      animated
      navigation-position="right"
      :navigation="false"
      infinite
      :arrows="false"
      transition-prev="slide-right"
      transition-next="slide-left"
      height="650px"
      class="bg-black hero-carousel"
      @mouseenter="pauseAutoplay"
      @mouseleave="resumeAutoplay"
    >
      <q-carousel-slide
        v-for="(movie, index) in featuredMovies"
        :key="index"
        :name="index"
        :img-src="movie.backdropImage"
        class="column no-wrap flex-center"
      >
        <div class="hero-content absolute-bottom text-left q-pa-xl">
          <div class="hero-overlay"></div>
          <div class="hero-text-content relative-position z-top">
            <!-- Status badges -->
            <div class="row items-center q-mb-md">
              <q-badge
                v-if="movie.spotlight && parseInt(movie.spotlight) <= 3"
                color="red"
                text-color="white"
                class="q-mr-sm text-weight-bold"
                icon="trending_up"
              >
                {{ t('hero.trendingBadge') }}
              </q-badge>
              <q-badge
                v-if="movie.quality"
                color="orange"
                text-color="white"
                class="q-mr-sm text-weight-bold"
              >
                {{ movie.quality }}
              </q-badge>
              <q-badge
                v-if="movie.mediaType === 'movie'"
                color="purple"
                text-color="white"
                class="q-mr-sm text-weight-bold"
              >
                {{ t('hero.movieBadge') }}
              </q-badge>
              <q-badge v-if="movie.ageRating" color="grey-7" text-color="white" class="q-mr-sm">
                {{ movie.ageRating }}
              </q-badge>
            </div>

            <!-- Title -->
            <div class="hero-title text-h2 text-white text-weight-bold q-mb-md">
              {{ movie.title }}
              <span v-if="movie.season" class="text-subtitle1 text-grey-4 q-ml-sm">
                {{ t('hero.seasonLabel') }} {{ movie.season }}
              </span>
            </div>

            <!-- Meta information -->
            <div class="hero-meta row items-center q-mb-md text-white">
              <div class="rating-section q-mr-lg">
                <q-icon name="star" color="yellow" size="sm" />
                <span class="text-h6 q-ml-xs">{{ movie.rating }}/10</span>
              </div>
              <div class="release-date q-mr-lg">{{ movie.releaseDate }}</div>
              <div class="duration q-mr-lg">{{ movie.duration }}</div>
            </div>

            <!-- Genres -->
            <div class="genres q-mb-lg">
              <q-chip
                v-for="genre in movie.genres"
                :key="genre"
                outline
                color="white"
                text-color="white"
                class="q-mr-xs"
                size="sm"
              >
                {{ genre }}
              </q-chip>
            </div>

            <!-- Description -->
            <div
              class="hero-description hide-on-mobile text-white text-subtitle1 q-mb-xl"
              v-html="getCleanDescription(movie.description)"
            ></div>

            <!-- Characters -->
            <div
              v-if="movie.character"
              class="characters hide-on-mobile text-grey-4 text-caption q-mb-md"
            >
              <strong>{{ t('hero.castLabel') }}</strong> {{ movie.character }}
            </div>
            <!-- Action buttons -->
            <div class="hero-actions q-gutter-md">
              <q-btn
                outline
                text-color="white"
                :label="t('hero.watchNow')"
                push
                icon="play_arrow"
                size="lg"
                class="text-weight-bold watch-now-btn"
                @click="watchMovie(movie)"
              />
              <!-- <q-btn flat round color="white" icon="info" size="lg" @click="showInfo(movie)">
                                <q-tooltip>{{ t('hero.moreInfo') }}</q-tooltip>
                            </q-btn> -->
            </div>
          </div>
        </div>
      </q-carousel-slide>

      <!-- Custom navigation controls with thumbnails - Vertical -->
      <template v-slot:control>
        <q-carousel-control position="right" :offset="[24, 0]" class="thumbnail-navigation">
          <div class="carousel-thumbnails column q-gutter-sm">
            <div
              v-for="item in visibleThumbnails"
              :key="item.index"
              class="thumbnail-item"
              :class="{ 'active-thumbnail': slide === item.index }"
              @click="slide = item.index"
            >
              <div class="thumbnail-wrapper">
                <img :src="item.movie.poster" :alt="item.movie.title" class="thumbnail-image" />
                <div class="thumbnail-overlay">
                  <div class="thumbnail-progress" :style="getProgressStyle(item.index)"></div>
                </div>
                <div v-if="slide === item.index" class="active-border"></div>
              </div>
            </div>
          </div>
        </q-carousel-control>
      </template>
    </q-carousel>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-overlay absolute-full flex flex-center bg-black">
      <div class="text-center">
        <q-spinner-dots color="red" size="40px" />
        <div class="text-white q-mt-md">{{ t('hero.loadingFeaturedAnime') }}</div>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-overlay absolute-full flex flex-center bg-black">
      <q-banner class="bg-negative text-white q-ma-lg">
        <q-icon name="error" size="md" class="q-mr-md" />
        {{ error }}
        <template v-slot:action>
          <q-btn flat :label="t('hero.retry')" @click="fetchFeaturedMovies" />
        </template>
      </q-banner>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useHomePageHeroSectionData } from 'src/composables/home-page/useHomePageData'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
// import { linkPost } from 'src/utils/helper.js'
const { t } = useI18n()
const {
  data: featuredMovies,
  isLoading,
  error,
  refetch: fetchFeaturedMovies,
} = useHomePageHeroSectionData()
const slide = ref(0)
const autoplay = ref(true)
let timer = null
const router = useRouter()

// Computed property to show only visible thumbnails (current + next 3)
const visibleThumbnails = computed(() => {
  if (!featuredMovies.value || featuredMovies.value.length === 0) return []

  const maxVisible = 4 // Hiển thị tối đa 4 thumbnails
  const total = featuredMovies.value.length
  const result = []

  for (let i = 0; i < maxVisible && i < total; i++) {
    const index = (slide.value + i) % total
    result.push({
      index: index,
      movie: featuredMovies.value[index],
    })
  }

  return result
})
const setupAutoplay = () => {
  if (timer) clearInterval(timer)

  timer = setInterval(() => {
    if (autoplay.value && (featuredMovies.value?.length || 0) > 0) {
      const nextIndex = (slide.value + 1) % (featuredMovies.value?.length || 0)
      slide.value = nextIndex
    }
  }, 6000)
  // 6 seconds interval 6000
}

const pauseAutoplay = () => {
  autoplay.value = false
}

const resumeAutoplay = () => {
  autoplay.value = true
}

const getProgressStyle = (index) => {
  return {
    width: slide.value === index ? '100%' : '0%',
    transition: 'width 6s linear',
  }
}

const getCleanDescription = (description) => {
  if (!description) return ''
  // Remove HTML tags and limit length
  const cleanText = description.replace(/<[^>]*>/g, '').trim()
  return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText
}

// Action handlers
const watchMovie = (movie) => {
  console.log('Watching:', movie.slug)
  if (movie.link) {
    // Navigate to movie page
    // window.location.href = movie.link
    router.push(movie.link)
  }
}

// const showInfo = (movie) => {
//     console.log('Show info for:', movie.title)
//     // Implement show info functionality
//     // Show detailed movie information modal
// }

// Watch for data changes and setup autoplay when ready
watch(
  featuredMovies,
  (newMovies) => {
    if (newMovies && newMovies.length > 0 && !timer) {
      slide.value = 0
      setupAutoplay()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
<style lang="scss" scoped>
.hero-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-content {
  width: 100%;
  max-width: 1200px;
}

.hero-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95),
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0)
  );
  z-index: 1;
}

.hero-text-content {
  position: relative;
  max-width: 800px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.hero-description {
  max-width: 600px;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.hero-meta {
  font-size: 1.1rem;

  .rating-section {
    display: flex;
    align-items: center;
  }
}

.hero-actions {
  .q-btn {
    min-width: 140px;
  }

  .watch-now-btn {
    border-color: rgba(255, 255, 255, 0.8) !important;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 1) !important;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.3) !important;
      transform: translateY(-2px);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.4) !important;
      transform: translateY(0);
    }
  }
}

// Ẩn mũi tên carousel
.hero-carousel {
  :deep(.q-carousel__arrow) {
    display: none !important;
  }
}

// Thumbnail navigation styles - Vertical layout
.thumbnail-navigation {
  z-index: 10 !important; // Đảm bảo nổi trên overlay
  height: 100%;
  display: flex;
  align-items: center; // Căn giữa theo chiều dọc

  .carousel-thumbnails {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .thumbnail-item {
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      transform: translateX(-4px); // Dịch sang trái khi hover
    }

    .thumbnail-wrapper {
      position: relative;
      width: 50px; // Giảm từ 80px xuống 50px
      height: 75px; // Giảm từ 120px xuống 75px
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      transition: all 0.3s ease;

      .thumbnail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .thumbnail-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        overflow: hidden;

        .thumbnail-progress {
          height: 100%;
          background: linear-gradient(90deg, #ff5722, #ff8a65);
          transition: width 6s linear;
          box-shadow: 0 0 8px rgba(255, 87, 34, 0.8);
        }
      }

      .active-border {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid #ff5722; // Giảm border từ 3px xuống 2px cho thumbnail nhỏ
        border-radius: 6px;
        box-shadow: 0 0 10px rgba(255, 87, 34, 0.7);
        pointer-events: none;
      }
    }

    &.active-thumbnail {
      .thumbnail-wrapper {
        transform: scale(1.15); // Tăng scale lên để nổi bật hơn
        box-shadow: 0 4px 16px rgba(255, 87, 34, 0.5);
      }
    }

    &:not(.active-thumbnail) {
      .thumbnail-wrapper {
        opacity: 0.7;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

.loading-overlay,
.error-overlay {
  backdrop-filter: blur(10px);
}

// Carousel responsive heights - sắp xếp từ LỚN đến NHỎ để đúng specificity
.q-carousel {
  height: 650px; // Desktop default (> 1200px)

  // Desktop nhỏ (1024px - 1199px)
  @media (min-width: 1024px) and (max-width: 1199px) {
    height: 600px !important;
  }

  // Tablet (768px - 1023px)
  @media (min-width: 768px) and (max-width: 1023px) {
    height: 500px !important;
  }

  // Mobile lớn (480px - 767px)
  @media (min-width: 480px) and (max-width: 767px) {
    height: 400px !important;
  }

  // Mobile nhỏ (< 480px)
  @media (max-width: 479px) {
    height: 300px !important;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  // Ẩn Description và Characters trên màn hình nhỏ
  .hide-on-mobile {
    display: none !important;
  }

  // Ẩn thumbnail navigation trên mobile
  .thumbnail-navigation {
    display: none !important;
  }

  .hero-content {
    padding: 1rem !important;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-actions {
    .q-btn {
      min-width: 120px;
    }
  }

  // Điều chỉnh thêm cho mobile
  .hero-description {
    max-width: 100%;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .hero-meta {
    font-size: 1rem;
    flex-wrap: wrap;
    gap: 8px;
  }

  .genres {
    flex-wrap: wrap;
    gap: 4px;

    .q-chip {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
  }

  .hero-actions {
    flex-direction: column;
    gap: 8px;

    .q-btn {
      width: 80%;
      min-width: unset;
    }

    .watch-now-btn {
      &:hover {
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>
