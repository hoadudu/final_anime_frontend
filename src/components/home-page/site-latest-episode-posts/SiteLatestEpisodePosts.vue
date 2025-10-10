<template>
  <section class="latest-episode-section q-py-lg">
    <div class="section-header row items-center justify-between q-mb-lg">
      <div class="section-title">
        <h2 class="text-h4 text-weight-bold text-white q-mb-none">
          {{ t('latestEpisodes.title') }}
        </h2>
      </div>
      <q-btn
        flat
        color="primary"
        icon-right="chevron_right"
        class="view-more-btn text-weight-medium"
        no-caps
        @click="navigateToRecentlyUpdated"
      >
        {{ t('common.viewMore') }}
      </q-btn>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container text-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
      <div class="loading-text q-mt-md text-grey-5">{{ t('latestEpisodes.loading') }}</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container text-center q-py-xl">
      <q-icon name="error" color="negative" size="48px" />
      <div class="error-message q-mt-md text-h6">{{ t('latestEpisodes.fetchError') }}</div>
      <q-btn color="primary" flat @click="refreshLatestEpisodes" class="q-mt-md" icon="refresh">
        {{ t('common.tryAgain') }}
      </q-btn>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!animeList || animeList.length === 0"
      class="empty-container text-center q-py-xl"
    >
      <q-icon name="movie" color="grey-6" size="64px" />
      <div class="empty-message q-mt-md text-h6 text-grey-5">{{ t('latestEpisodes.noAnime') }}</div>
    </div>

    <!-- Anime Posts Grid -->
    <div v-else class="anime-posts-grid">
      <div class="anime-posts-container">
        <div
          v-for="(animePost, index) in animeList"
          :key="animePost.id || `anime-${index}`"
          class="anime-post-item"
          @click="navigateToAnime(animePost)"
        >
          <q-card flat bordered class="anime-card">
            <div class="anime-poster-container">
              <!-- Rating Badge -->
              <q-badge
                v-if="animePost.ageRating === '18+'"
                floating
                color="red"
                class="age-rating-badge"
              >
                18+
              </q-badge>

              <!-- Episode Info Badges -->
              <div class="anime-badges">
                <q-badge
                  v-if="animePost.subCount"
                  color="blue"
                  text-color="white"
                  class="anime-badge"
                >
                  <q-icon name="closed_caption" size="12px" class="q-mr-xs" />
                  {{ animePost.subCount }}
                </q-badge>

                <q-badge
                  v-if="animePost.dubCount"
                  color="green"
                  text-color="white"
                  class="anime-badge q-ml-xs"
                >
                  <q-icon name="mic" size="12px" class="q-mr-xs" />
                  {{ animePost.dubCount }}
                </q-badge>

                <q-badge
                  v-if="animePost.totalEpisodes"
                  color="orange"
                  text-color="white"
                  class="anime-badge q-ml-xs"
                >
                  {{ animePost.totalEpisodes }}
                </q-badge>
              </div>

              <!-- Poster Image -->
              <div class="anime-poster-wrapper">
                <q-img
                  :src="animePost.poster || animePost.image || animePost.thumbnail"
                  :alt="animePost.title || animePost.name"
                  fit="cover"
                  class="anime-poster"
                  loading="lazy"
                  spinner-color="primary"
                  @error="handleImageError"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-8">
                      <q-icon name="broken_image" size="48px" color="grey-5" />
                    </div>
                  </template>

                  <!-- Play Overlay -->
                  <div class="play-overlay">
                    <q-btn round color="primary" icon="play_arrow" size="lg" class="play-button" />
                  </div>
                </q-img>
              </div>

              <!-- Tooltip for additional info -->
              <MovieTooltip :movie="transformAnimeForTooltip(animePost)" />
            </div>

            <!-- Anime Details -->
            <q-card-section class="anime-details">
              <h3 class="anime-title">
                {{ animePost.title || animePost.name || t('common.untitled') }}
              </h3>
              <div class="anime-meta">
                <span class="anime-type">{{ animePost.type || 'TV' }}</span>
                <q-icon name="circle" size="4px" class="meta-separator" />
                <span class="anime-duration">{{ animePost.duration || '24m' }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Refresh Button (Fixed at bottom right) -->
    <q-btn
      v-if="!isLoading && animeList && animeList.length > 0"
      fab
      color="primary"
      icon="refresh"
      class="refresh-fab"
      @click="refreshLatestAnimePosts"
      :loading="isRefreshing"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHomePageLastestEpisodePostsData } from 'src/composables/home-page/useHomePageData'
import MovieTooltip from 'src/components/MovieTooltip.vue'

// Composables
const router = useRouter()
const { t } = useI18n()

// Vue Query data
const {
  data: latestEpisodePostsResponse,
  isLoading,
  error,
  refetch,
} = useHomePageLastestEpisodePostsData()

// Reactive data
const isRefreshing = ref(false)

// Computed
const animeList = computed(() => latestEpisodePostsResponse.value?.data || [])

// Methods
const navigateToRecentlyUpdated = () => {
  router.push('/recently-updated')
}

const navigateToAnime = (animePost) => {
  if (animePost.link) {
    router.push(animePost.link)
  } else if (animePost.slug) {
    router.push(`/watch/${animePost.slug}`)
  } else if (animePost.id) {
    router.push(`/anime/${animePost.id}`)
  }
}

const refreshLatestAnimePosts = async () => {
  try {
    isRefreshing.value = true

    // Refetch data from API
    await refetch()
  } catch (err) {
    console.error('Failed to refresh anime posts:', err)
  } finally {
    isRefreshing.value = false
  }
}

const refreshLatestEpisodes = () => {
  refreshLatestAnimePosts()
}

const handleImageError = (event) => {
  console.warn('Image failed to load:', event)
}

const transformAnimeForTooltip = (animePost) => {
  return {
    id: animePost.id,
    title: animePost.title || animePost.name,
    link: animePost.link,
    titles: animePost.titles || [],
    altTitle: animePost.altTitle || animePost.alternativeTitle,
    type: animePost.type || 'TV',
    duration: animePost.duration || '24m',
    poster: animePost.poster || animePost.image || animePost.thumbnail,
    description: `${animePost.description}`,
    rating: animePost.rating || animePost.score || '8.5',
    year: animePost.year || animePost.releaseDate || '2024',
    genres: animePost.genres || ['Action', 'Adventure'],
    status: animePost.status || 'Ongoing',
    episodeNumber: animePost.episodeNumber || animePost.episode,
    latestEpisode: animePost.latestEpisode || animePost.currentEpisode,
  }
}

// Lifecycle
onMounted(() => {
  // Vue Query sẽ tự động fetch data khi component mount
})
</script>

<style lang="scss" scoped>
.latest-episode-section {
  background: transparent;
  padding: 32px 0;
  position: relative;

  .section-header {
    margin-bottom: 1.5rem;

    .section-title h2 {
      color: #ffffff;
      font-weight: 700;
      font-size: 1.75rem;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      padding-left: 1rem;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 24px;
        background: linear-gradient(180deg, #ff5722, #ff8a65);
        border-radius: 2px;
      }
    }

    .view-more-btn {
      color: #00d4ff;
      transition: all 0.3s ease;
      font-weight: 500;

      &:hover {
        color: #ffffff;
        background: rgba(0, 212, 255, 0.1);
      }
    }
  }

  .loading-container,
  .error-container,
  .empty-container {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .loading-text,
    .error-message,
    .empty-message {
      color: #ffffff;
    }
  }

  // Refresh FAB
  .refresh-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;

    @media (max-width: 599px) {
      bottom: 80px; // Tránh bottom navigation
      right: 16px;
    }
  }

  // CSS Grid Container - Tự động responsive
  .anime-posts-grid {
    .anime-posts-container {
      display: grid;
      gap: 16px;

      // Auto-fit với minmax để tự động điều chỉnh số cột
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));

      // Giới hạn tối đa để tránh quá rộng
      max-width: 1200px;
      margin: 0 auto;

      @media (min-width: 1920px) {
        // Màn hình siêu rộng: tối đa 6 cột
        grid-template-columns: repeat(6, 1fr);
        gap: 18px;
        max-width: 1400px;
      }

      @media (max-width: 1439px) {
        // Desktop: auto-fit với min 150px
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 14px;
        max-width: 1100px;
      }

      @media (max-width: 1199px) {
        // Desktop nhỏ: auto-fit với min 140px
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        max-width: 900px;
      }

      @media (max-width: 991px) {
        // Tablet: auto-fit với min 130px
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 12px;
        max-width: 700px;
      }

      @media (max-width: 767px) {
        // Mobile landscape: 3 cột cố định
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      @media (max-width: 599px) {
        // Mobile portrait: 2 cột cố định
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      @media (max-width: 399px) {
        // Mobile nhỏ: gap nhỏ hơn
        gap: 6px;
      }
    }

    .anime-post-item {
      cursor: pointer;
      position: relative;

      .anime-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
        display: flex;
        flex-direction: column;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);

          .play-overlay {
            opacity: 1;
            visibility: visible;
          }

          .anime-title {
            color: #00d4ff;
          }
        }

        .anime-poster-container {
          position: relative;
          width: 100%;

          .age-rating-badge {
            position: absolute;
            top: 6px;
            right: 6px;
            z-index: 20;
            font-size: 0.65rem;
            font-weight: 700;
          }

          .anime-badges {
            position: absolute;
            bottom: 6px;
            left: 6px;
            z-index: 20;
            display: flex;
            flex-wrap: wrap;
            gap: 3px;

            .anime-badge {
              font-size: 0.6rem;
              font-weight: 600;
              backdrop-filter: blur(10px);
              background: rgba(0, 0, 0, 0.8) !important;
              border-radius: 3px;
              padding: 2px 4px;
              min-height: auto;

              @media (max-width: 599px) {
                font-size: 0.55rem;
                padding: 1px 3px;
              }
            }
          }

          .anime-poster-wrapper {
            width: 100%;
            aspect-ratio: 3/4; // Cố định tỷ lệ 3:4
            position: relative;
            overflow: hidden;
            border-radius: 8px 8px 0 0;

            .anime-poster {
              width: 100%;
              height: 100%;

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

            .play-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              visibility: hidden;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(2px);
              transition: all 0.3s ease;
              border-radius: 8px 8px 0 0;

              .play-button {
                background: rgba(0, 212, 255, 0.9);
                color: white;
                width: 48px;
                height: 48px;
                border-radius: 50%;

                :deep(.q-icon) {
                  font-size: 20px;
                }

                &:hover {
                  background: rgba(0, 212, 255, 1);
                  transform: scale(1.1);
                }

                @media (max-width: 599px) {
                  width: 40px;
                  height: 40px;

                  :deep(.q-icon) {
                    font-size: 18px;
                  }
                }
              }
            }
          }
        }

        .anime-details {
          padding: 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 68px;

          @media (max-width: 991px) {
            padding: 8px;
            min-height: 64px;
          }

          @media (max-width: 599px) {
            padding: 6px;
            min-height: 60px;
          }

          .anime-title {
            color: #ffffff;
            font-weight: 500;
            font-size: 0.8rem;
            line-height: 1.2;
            margin: 0 0 6px 0;
            height: 2.4em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            transition: color 0.3s ease;

            @media (max-width: 991px) {
              font-size: 0.75rem;
            }

            @media (max-width: 599px) {
              font-size: 0.7rem;
              height: 2.2em;
            }
          }

          .anime-meta {
            display: flex;
            align-items: center;
            color: #b0b0b0;
            font-size: 0.7rem;
            margin-top: auto;

            @media (max-width: 991px) {
              font-size: 0.65rem;
            }

            @media (max-width: 599px) {
              font-size: 0.6rem;
            }

            .anime-type {
              font-weight: 600;
              text-transform: uppercase;
              color: #00d4ff;
            }

            .meta-separator {
              margin: 0 4px;

              @media (max-width: 599px) {
                margin: 0 3px;
              }
            }

            .anime-duration {
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  // Responsive cho section header
  @media (max-width: 768px) {
    .section-header {
      .section-title h2 {
        font-size: 1.5rem;
      }
    }
  }

  @media (max-width: 480px) {
    .section-header {
      margin-bottom: 1rem;

      .section-title h2 {
        font-size: 1.25rem;
        padding-left: 0.75rem;

        &::before {
          width: 3px;
          height: 18px;
        }
      }
    }
  }
}
</style>
