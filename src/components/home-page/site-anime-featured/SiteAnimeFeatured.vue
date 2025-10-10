<template>
  <div class="site-anime-featured q-py-lg">
    <div class="q-container q-px-md">
      <!-- Desktop View: 4 columns -->
      <div v-if="$q.screen.width > 767" class="row q-col-gutter-md">
        <!-- Top Airing -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="anime-featured-card">
            <q-card-section class="featured-header">
              <h5 class="q-my-none">{{ t('featured.topAiring') }}</h5>
            </q-card-section>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in topAiring"
                :key="`airing-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag text-uppercase">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('top-airing')"
              />
            </div>
          </q-card>
        </div>

        <!-- Most Popular -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="anime-featured-card">
            <q-card-section class="featured-header">
              <h5 class="q-my-none">{{ t('featured.mostPopular') }}</h5>
            </q-card-section>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in mostPopular"
                :key="`popular-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('most-popular')"
              />
            </div>
          </q-card>
        </div>

        <!-- Most Liked -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="anime-featured-card">
            <q-card-section class="featured-header">
              <h5 class="q-my-none">{{ t('featured.mostLiked') }}</h5>
            </q-card-section>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in mostLiked"
                :key="`liked-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('most-favorite')"
              />
            </div>
          </q-card>
        </div>

        <!-- Latest Completed -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="anime-featured-card">
            <q-card-section class="featured-header">
              <h5 class="q-my-none">{{ t('featured.latestCompleted') }}</h5>
            </q-card-section>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in latestCompleted"
                :key="`completed-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('latest-completed')"
              />
            </div>
          </q-card>
        </div>
      </div>

      <!-- Mobile View: Tabs -->
      <div v-else class="mobile-tabs-view">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-white mobile-tabs"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="topAiring">
            <div class="tab-content">
              <span class="tab-emoji">🔥</span>
              <span class="tab-label">Airing</span>
            </div>
          </q-tab>
          <q-tab name="mostPopular">
            <div class="tab-content">
              <span class="tab-emoji">⭐</span>
              <span class="tab-label">Popular</span>
            </div>
          </q-tab>
          <q-tab name="mostLiked">
            <div class="tab-content">
              <span class="tab-emoji">❤️</span>
              <span class="tab-label">Liked</span>
            </div>
          </q-tab>
          <q-tab name="latestCompleted">
            <div class="tab-content">
              <span class="tab-emoji">✅</span>
              <span class="tab-label">Completed</span>
            </div>
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated class="mobile-tab-panels">
          <!-- Top Airing Panel -->
          <q-tab-panel name="topAiring" class="q-pa-none">
            <div class="tab-description">
              <h6 class="tab-description-title">{{ t('featured.topAiring') }}</h6>
              <p class="tab-description-text">
                Anime đang được phát sóng hiện tại với tập mới nhất
              </p>
            </div>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in topAiring"
                :key="`airing-mobile-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag text-uppercase">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('top-airing')"
              />
            </div>
          </q-tab-panel>

          <!-- Most Popular Panel -->
          <q-tab-panel name="mostPopular" class="q-pa-none">
            <div class="tab-description">
              <h6 class="tab-description-title">{{ t('featured.mostPopular') }}</h6>
              <p class="tab-description-text">Anime được xem nhiều nhất, phổ biến với cộng đồng</p>
            </div>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in mostPopular"
                :key="`popular-mobile-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('most-popular')"
              />
            </div>
          </q-tab-panel>

          <!-- Most Liked Panel -->
          <q-tab-panel name="mostLiked" class="q-pa-none">
            <div class="tab-description">
              <h6 class="tab-description-title">{{ t('featured.mostLiked') }}</h6>
              <p class="tab-description-text">
                Anime được yêu thích nhất, đánh giá cao từ người xem
              </p>
            </div>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in mostLiked"
                :key="`liked-mobile-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('most-favorite')"
              />
            </div>
          </q-tab-panel>

          <!-- Latest Completed Panel -->
          <q-tab-panel name="latestCompleted" class="q-pa-none">
            <div class="tab-description">
              <h6 class="tab-description-title">{{ t('featured.latestCompleted') }}</h6>
              <p class="tab-description-text">Anime đã hoàn thành gần đây, xem trọn bộ ngay</p>
            </div>
            <q-list class="featured-items" padding>
              <q-item
                v-for="(anime, index) in latestCompleted"
                :key="`completed-mobile-${index}`"
                class="featured-item"
                clickable
                @click="navigateToAnime(anime)"
              >
                <q-item-section avatar>
                  <q-img :src="anime.image" :ratio="2 / 3" class="anime-poster" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="item-title">{{ anime.title }}</q-item-label>
                  <q-item-label caption>
                    <div class="item-meta">
                      <span class="meta-tag sub-tag">
                        <q-icon name="closed_caption" size="xs" />
                        <span>{{ anime.sub }}</span>
                      </span>
                      <span class="meta-tag dub-tag" v-if="anime.dub">
                        <q-icon name="mic" size="xs" />
                        <span>{{ anime.dub }}</span>
                      </span>
                      <span class="meta-tag type-tag">{{ anime.type }}</span>
                    </div>
                  </q-item-label>
                </q-item-section>
                <MovieTooltip :movie="transformItemForTooltip(anime)" />
              </q-item>
            </q-list>
            <div class="view-more-container">
              <q-btn
                flat
                no-caps
                color="primary"
                class="full-width view-more-btn"
                icon-right="chevron_right"
                :label="t('common.viewMore')"
                @click="navigateToSection('latest-completed')"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { linkPost } from 'src/utils/helper.js'
import {
  useHomePageAnimeFeaturedTopAiringData,
  useHomePageAnimeFeaturedMostPopularData,
  useHomePageAnimeFeaturedMostLikedData,
  useHomePageAnimeFeaturedLatestCompletedData,
} from 'src/composables/home-page/useHomePageData'

import MovieTooltip from 'src/components/MovieTooltip.vue'

const { t } = useI18n()
const router = useRouter()
const $q = useQuasar()

// State for mobile tabs
const activeTab = ref('topAiring')
const { data: topAiringResponse } = useHomePageAnimeFeaturedTopAiringData()
const { data: mostPopularResponse } = useHomePageAnimeFeaturedMostPopularData()
const { data: mostLikedResponse } = useHomePageAnimeFeaturedMostLikedData()
const { data: latestCompletedResponse } = useHomePageAnimeFeaturedLatestCompletedData()

// Extract the actual data arrays from the API response
const topAiring = computed(() => topAiringResponse.value?.data || [])
const mostPopular = computed(() => mostPopularResponse.value?.data || [])
const mostLiked = computed(() => mostLikedResponse.value?.data || [])
const latestCompleted = computed(() => latestCompletedResponse.value?.data || [])

// watchEffect(() => {
//     console.log('topAiring:', topAiring.value, 'Array?', Array.isArray(topAiring.value))
//     console.log('mostPopular:', mostPopular.value, 'Array?', Array.isArray(mostPopular.value))
//     console.log('mostLiked:', mostLiked.value, 'Array?', Array.isArray(mostLiked.value))
//     console.log('latestCompleted:', latestCompleted.value, 'Array?', Array.isArray(latestCompleted.value))
// })

function navigateToAnime(anime) {
  if (anime.slug) {
    router.push(linkPost(anime.slug, anime.id))
  }
}

function transformItemForTooltip(item) {
  return {
    title: item.title,
    titles: item.titles || [], // Thêm hỗ trợ cho trường titles
    description: item.description || item.summary || item.overview || '',
    aired: item.year ? `${item.year}` : item.release_date || item.aired || '',
    rank: item.rating ? `${item.rating}/10` : '',
    genres: item.genres || [],
  }
}

function navigateToSection(section) {
  if (section === 'top-airing') {
    router.push('/filter?status=airing&sort=views')
  } else if (section === 'most-popular') {
    router.push('/filter?sort=rating')
  } else if (section === 'most-favorite') {
    router.push('/filter?sort=views')
  } else if (section === 'latest-completed') {
    router.push('/filter?sort=latest')
  }
}
</script>

<style scoped>
.site-anime-featured {
  background-color: #1e1e2a;
  color: white;
  padding: 1.5rem 0;
}

.anime-featured-card {
  background-color: #1e1e2a;
  border: none !important;
  border-radius: 0;
  margin-bottom: 1rem;
}

.featured-header {
  padding: 0.5rem 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0;
}

/* Removed header-content style as it's no longer needed */

.featured-header h5 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #fff;
  margin: 0;
  padding: 0;
}

.featured-items {
  padding: 0;
}

.featured-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0;
}

.anime-poster {
  width: 50px;
  height: 75px;
  border-radius: 4px;
  overflow: hidden;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  margin-right: 0.25rem;
}

.meta-tag i {
  margin-right: 0.25rem;
  font-size: 0.7rem;
}

.sub-tag {
  color: #4caf50;
}

.dub-tag {
  color: #2196f3;
}

.type-tag {
  color: #ff9800;
}

.view-more-container {
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.view-more-btn {
  font-size: 0.85rem;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.view-more-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile Tabs Styling */
.mobile-tabs-view {
  background-color: #1e1e2a;
}

.mobile-tabs {
  background-color: #1e1e2a;
  border-radius: 8px;
}

.mobile-tabs .q-tab {
  padding: 10px 4px;
  min-height: 48px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tab-emoji {
  font-size: 1.25rem;
  line-height: 1;
}

.tab-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
  line-height: 1;
}

.mobile-tab-panels {
  background-color: transparent;
  min-height: 400px;
  margin-top: 1rem;
}

.tab-description {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 138, 101, 0.05));
  border-left: 3px solid #ff5722;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.tab-description-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-description-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
}

/* Quasar customization */
.q-item {
  min-height: auto;
  padding: 0.5rem 0;
}

.q-item__section--avatar {
  min-width: 50px;
  padding-right: 0.75rem;
}

.q-item__section--side {
  padding-left: 0.75rem;
}

/* Responsive styling */
@media (max-width: 768px) {
  .q-item__section--avatar {
    min-width: 40px;
  }

  .anime-poster {
    width: 40px;
    height: 60px;
  }

  .item-title {
    font-size: 0.8rem;
  }

  .item-meta {
    font-size: 0.7rem;
  }
}
</style>
