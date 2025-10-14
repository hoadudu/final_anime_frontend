<template>
  <q-page class="profile-page">
    <div class="page-container q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%">
      <!-- ========== NO USER STATE ========== -->
      <div v-if="!currentUserId" class="empty-state text-center q-py-xl">
        <q-icon name="person_off" size="80px" color="grey-6" />
        <h2 class="text-h4 q-mt-md text-grey-7">{{ t('profile.notLoggedIn') }}</h2>
        <p class="text-body1 text-grey-6 q-mt-sm">{{ t('profile.pleaseLogin') }}</p>
        <q-btn
          color="primary"
          :label="t('common.login')"
          icon="login"
          @click="handleLoginRedirect"
          class="q-mt-md"
          unelevated
          rounded
        />
      </div>

      <!-- ========== PROFILE HEADER ========== -->
      <div v-else class="profile-header q-mt-md q-mb-lg">
        <q-card flat bordered class="profile-header-card">
          <!-- Loading State -->
          <div v-if="isLoadingProfile" class="q-pa-lg">
            <div class="row q-col-gutter-md items-center">
              <div class="col-auto">
                <q-skeleton type="circle" size="120px" />
              </div>
              <div class="col">
                <q-skeleton type="text" width="200px" height="32px" />
                <q-skeleton type="text" width="150px" class="q-mt-sm" />
                <q-skeleton type="text" width="180px" class="q-mt-sm" />
              </div>
            </div>
          </div>

          <!-- Profile Content -->
          <q-card-section v-else-if="profileData" class="profile-content">
            <div class="row q-col-gutter-lg items-start">
              <!-- Avatar -->
              <div class="col-auto">
                <div class="avatar-container">
                  <q-avatar size="120px" class="profile-avatar">
                    <img
                      :src="profileData.user?.avatar || 'https://cdn.quasar.dev/img/boy-avatar.png'"
                      :alt="profileData.user?.name"
                    />
                  </q-avatar>
                  <q-btn
                    round
                    color="primary"
                    icon="edit"
                    size="sm"
                    class="avatar-edit-btn"
                    @click="openAvatarModal"
                  />
                </div>
              </div>

              <!-- User Info -->
              <div class="col">
                <div class="profile-info">
                  <!-- Username -->
                  <h1 class="text-h4 text-weight-bold q-mb-xs user-name">
                    {{ profileData.user?.name || profileData.user?.username }}
                  </h1>

                  <!-- Username if different from name -->
                  <div
                    v-if="profileData.user?.username !== profileData.user?.name"
                    class="text-subtitle2 text-grey-6 q-mb-sm"
                  >
                    @{{ profileData.user?.username }}
                  </div>

                  <!-- Bio -->
                  <div v-if="profileData.user?.bio" class="profile-bio q-mb-md">
                    {{ profileData.user.bio }}
                  </div>

                  <!-- Joined Date -->
                  <div class="text-caption text-grey-6 q-mb-md">
                    <q-icon name="event" size="16px" class="q-mr-xs" />
                    {{ t('profile.joinedAt') }}: {{ formatDate(profileData.user?.joined_at) }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Error State -->
          <q-card-section v-else-if="isErrorProfile">
            <div class="text-center q-py-lg">
              <q-icon name="error_outline" size="48px" color="negative" />
              <div class="text-h6 q-mt-md">{{ t('profile.errorLoadingProfile') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ========== PROFILE STATS ========== -->
      <ProfileStats v-if="currentUserId && profileData" :stats="profileData.stats" />

      <!-- ========== STATUS NAVIGATION BAR ========== -->
      <div v-if="currentUserId && profileData" class="status-nav q-mb-lg">
        <q-card flat bordered class="status-nav-card">
          <q-tabs
            v-model="currentStatus"
            dense
            align="left"
            class="status-tabs"
            active-color="primary"
            indicator-color="primary"
            @update:model-value="handleStatusChange"
          >
            <q-tab
              name="continue"
              :label="`${t('profile.continue')} (${profileData.stats?.continue || 0})`"
              icon="play_arrow"
            />
            <q-tab
              name="watching"
              :label="`${t('profile.watching')} (${profileData.stats?.watching || 0})`"
              icon="play_circle"
            />
            <q-tab
              name="completed"
              :label="`${t('profile.completed')} (${profileData.stats?.completed || 0})`"
              icon="check_circle"
            />
            <q-tab
              name="on_hold"
              :label="`${t('profile.onHold')} (${profileData.stats?.on_hold || 0})`"
              icon="pause_circle"
            />
            <q-tab
              name="dropped"
              :label="`${t('profile.dropped')} (${profileData.stats?.dropped || 0})`"
              icon="cancel"
            />
            <q-tab
              name="plan_to_watch"
              :label="`${t('profile.planToWatch')} (${profileData.stats?.plan_to_watch || 0})`"
              icon="bookmark"
            />

            <!-- Settings Tab -->
            <q-tab name="settings" :label="t('profile.settings')" icon="settings" />

            <!-- Custom Lists Dropdown -->
            <q-btn-dropdown
              v-if="customLists && customLists.length > 0"
              :label="t('profile.customLists')"
              icon="list"
              flat
              dense
              class="q-ml-md"
            >
              <q-list>
                <q-item
                  v-for="list in customLists"
                  :key="list.id"
                  clickable
                  v-close-popup
                  @click="handleCustomListClick(list)"
                >
                  <q-item-section>
                    <q-item-label>{{ list.name }}</q-item-label>
                    <q-item-label caption>{{ list.count }} anime</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-tabs>
        </q-card>
      </div>

      <!-- ========== MAIN CONTENT ========== -->
      <div v-if="currentUserId && profileData" class="main-content">
        <!-- ========== SETTINGS CONTENT ========== -->
        <div v-if="currentStatus === 'settings'">
          <ProfileSettings :profile-data="profileData" />
        </div>

        <!-- ========== ANIME LIST CONTENT ========== -->
        <div v-else>
          <!-- Filter / Sort / Search Bar -->
          <div class="filter-bar q-mb-md">
            <q-card flat bordered>
              <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-md items-center">
                  <!-- Search -->
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      v-model="searchQuery"
                      :placeholder="t('profile.searchAnime')"
                      outlined
                      dense
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>

                  <!-- Sort -->
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      v-model="sortBy"
                      :options="sortOptions"
                      :label="t('profile.sortBy')"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Stats Info -->
                  <div class="col-12 col-md-5 text-right">
                    <div class="text-body2 text-grey-7">
                      {{ t('profile.showing') }}:
                      <span class="text-weight-bold text-primary">{{
                        filteredAnimeList.length
                      }}</span>
                      {{ t('profile.anime') }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- ========== ANIME LIST GRID ========== -->
          <!-- Loading State -->
          <div v-if="isLoadingList && currentStatus !== 'settings'" class="anime-grid">
            <div v-for="i in 12" :key="i" class="anime-card-skeleton">
              <q-card flat bordered class="full-height">
                <q-skeleton height="300px" />
                <q-card-section>
                  <q-skeleton type="text" width="80%" />
                  <q-skeleton type="text" width="60%" class="q-mt-xs" />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="isErrorList && currentStatus !== 'settings'"
            class="error-state text-center q-py-xl"
          >
            <q-icon name="error_outline" size="80px" color="negative" />
            <h3 class="text-h5 q-mt-md">{{ t('profile.errorLoadingList') }}</h3>
            <q-btn
              color="primary"
              :label="t('common.tryAgain')"
              icon="refresh"
              @click="refetchList"
              class="q-mt-md"
              unelevated
              rounded
            />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="(!animeList || animeList.length === 0) && currentStatus !== 'settings'"
            class="empty-state text-center q-py-xl"
          >
            <q-icon name="movie" size="80px" color="grey-6" />
            <h3 class="text-h5 q-mt-md text-grey-7">{{ t('profile.noAnime') }}</h3>
            <p class="text-body1 text-grey-6 q-mt-sm">
              {{ t('profile.noAnimeMessage', { status: getStatusLabel(currentStatus) }) }}
            </p>
          </div>

          <!-- Anime List -->
          <div v-else-if="currentStatus !== 'settings'" class="anime-grid">
            <div v-for="anime in filteredAnimeList" :key="anime.anime_id" class="anime-list-card">
              <q-card
                flat
                bordered
                class="full-height cursor-pointer anime-card"
                @click="navigateToAnime(anime)"
              >
                <!-- Poster -->
                <div class="anime-poster-container">
                  <img
                    :src="anime.poster"
                    :alt="anime.title"
                    class="anime-poster-img"
                    loading="lazy"
                    @error="handleImageError(anime)"
                  />

                  <!-- Error -->
                  <div v-if="anime.imageError" class="absolute-full flex flex-center bg-grey-8">
                    <q-icon name="broken_image" size="48px" color="grey-5" />
                  </div>

                  <!-- Score Badge -->
                  <div v-if="anime.score" class="score-badge">
                    <q-icon name="star" size="14px" class="q-mr-xs" />
                    {{ anime.score }}
                  </div>

                  <!-- Delete Button -->
                  <div class="delete-button">
                    <q-btn
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click.stop="confirmDeleteAnime(anime)"
                    />
                  </div>

                  <!-- Play Overlay -->
                  <div class="play-overlay">
                    <q-btn round color="primary" icon="play_arrow" size="md" />
                  </div>
                </div>

                <!-- Info -->
                <q-card-section class="anime-info">
                  <div class="anime-title text-weight-bold">{{ anime.title }}</div>
                  <div class="anime-meta text-caption text-grey-6 q-mt-xs">
                    <div>{{ anime.type?.toUpperCase() || 'N/A' }}</div>
                    <div v-if="anime.episodes">
                      {{ anime.episodes }} {{ t('profile.episodes') }}
                    </div>
                    <div>{{ anime.anime_status }}</div>
                  </div>

                  <!-- Note -->
                  <div v-if="anime.note" class="anime-note text-caption text-grey-7 q-mt-sm">
                    <q-icon name="note" size="12px" class="q-mr-xs" />
                    {{ anime.note }}
                  </div>

                  <!-- Updated Date -->
                  <div class="text-caption text-grey-6 q-mt-xs">
                    {{ t('profile.updated') }}: {{ formatDate(anime.updated_at, true) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== AVATAR MODAL ========== -->
    <AvatarModal
      v-model="showAvatarModal"
      :current-avatar="profileData?.user?.avatar"
      @avatar-saved="handleAvatarSaved"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'
import { useAuth } from 'src/composables/auth/useAuth'
import {
  useProfileData,
  useProfileAnimeList,
  useProfileCustomLists,
} from 'src/composables/profile-page/useProfilePageData.js'
import ProfileStats from 'src/components/profile-page/ProfileStats.vue'
import ProfileSettings from 'src/components/profile-page/ProfileSettings.vue'
import AvatarModal from 'src/components/profile-page/AvatarModal.vue'

// ========== COMPOSABLES ==========
const router = useRouter()
const { t } = useI18n()
const { user } = useAuth()
const $q = useQuasar()

// ========== REACTIVE DATA ==========
const currentUserId = ref(null)
const currentStatus = ref('continue')
const searchQuery = ref('')
const sortBy = ref('updated_desc')
const customLists = ref([])
const showAvatarModal = ref(false)

// ========== SORT OPTIONS ==========
const sortOptions = [
  { label: t('profile.sortUpdatedDesc'), value: 'updated_desc' },
  { label: t('profile.sortUpdatedAsc'), value: 'updated_asc' },
  { label: t('profile.sortTitleAsc'), value: 'title_asc' },
  { label: t('profile.sortTitleDesc'), value: 'title_desc' },
  { label: t('profile.sortScoreDesc'), value: 'score_desc' },
  { label: t('profile.sortScoreAsc'), value: 'score_asc' },
]

// ========== FETCH DATA ==========
const {
  data: profileData,
  isLoading: isLoadingProfile,
  isError: isErrorProfile,
} = useProfileData(currentUserId)

const {
  data: animeListData,
  isLoading: isLoadingList,
  isError: isErrorList,
  refetch: refetchList,
} = useProfileAnimeList(currentUserId, currentStatus)

const { data: customListsData } = useProfileCustomLists(currentUserId)

// ========== COMPUTED ==========
const animeList = computed(() => animeListData.value?.items || [])

const filteredAnimeList = computed(() => {
  let list = [...animeList.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter((anime) => anime.title.toLowerCase().includes(query))
  }

  // Sort
  switch (sortBy.value) {
    case 'updated_desc':
      list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      break
    case 'updated_asc':
      list.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
      break
    case 'title_asc':
      list.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'title_desc':
      list.sort((a, b) => b.title.localeCompare(a.title))
      break
    case 'score_desc':
      list.sort((a, b) => (b.score || 0) - (a.score || 0))
      break
    case 'score_asc':
      list.sort((a, b) => (a.score || 0) - (b.score || 0))
      break
  }

  return list
})

// ========== WATCHERS ==========
// Watch for user changes to update currentUserId
watch(
  () => user.value?.id,
  (newUserId) => {
    if (newUserId && newUserId !== currentUserId.value) {
      currentUserId.value = newUserId
    } else if (!newUserId && currentUserId.value) {
      // User logged out, clear currentUserId
      currentUserId.value = null
    }
  },
  { immediate: true },
)

watch(
  () => customListsData.value,
  (data) => {
    if (data && data.lists) {
      customLists.value = data.lists
    }
  },
  { immediate: true },
)

// ========== LIFECYCLE ==========
onMounted(() => {
  // Get user ID from authenticated user
  if (user.value?.id) {
    currentUserId.value = user.value.id
  }
})

// ========== METHODS ==========
const formatDate = (dateString, short = false) => {
  if (!dateString) return 'N/A'

  const dateObj = new Date(dateString)

  if (short) {
    return date.formatDate(dateObj, 'DD/MM/YYYY')
  }

  return date.formatDate(dateObj, 'DD MMM YYYY')
}

const handleStatusChange = (newStatus) => {
  console.log('Status changed to:', newStatus)

  currentStatus.value = newStatus

  // Reset filters when changing status (except for settings tab)
  if (newStatus !== 'settings') {
    searchQuery.value = ''
  }

  // Log when switching to settings to confirm no API call is made
  if (newStatus === 'settings') {
    console.log('Switched to settings tab - no API call should be made')
  }
}

const handleCustomListClick = (list) => {
  // TODO: Implement custom list view
  console.log('Custom list clicked:', list)
}

const navigateToAnime = (anime) => {
  if (anime.slug) {
    router.push(`/thong-tin/${anime.slug}-${anime.anime_id}`)
  }
}

const getStatusLabel = (status) => {
  const labels = {
    continue: t('profile.continue'),
    watching: t('profile.watching'),
    completed: t('profile.completed'),
    on_hold: t('profile.onHold'),
    dropped: t('profile.dropped'),
    plan_to_watch: t('profile.planToWatch'),
  }
  return labels[status] || status
}

const handleLoginRedirect = () => {
  router.push({
    name: 'site-home',
    query: { login: '1' },
  })
}

const handleImageError = (anime) => {
  anime.imageError = true
}

const confirmDeleteAnime = (anime) => {
  $q.dialog({
    title: t('profile.confirmDelete'),
    message: t('profile.confirmDeleteMessage', { title: anime.title }),
    cancel: {
      label: t('common.cancel'),
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: t('profile.deleteButton'),
      color: 'negative',
      flat: true,
    },
    persistent: false,
  }).onOk(() => {
    deleteAnime(anime)
  })
}

const deleteAnime = async (anime) => {
  const loading = $q.notify({
    type: 'ongoing',
    message: t('profile.deletingAnime'),
    position: 'top',
  })

  try {
    const payload = {
      post_id: anime.anime_id,
      status: currentStatus.value,
      access_token: user.value.access_token,
    }

    await api.delete('/profile/delete-anime', { data: payload })

    // ✅ Tắt loading khi thành công
    loading()

    $q.notify({
      type: 'positive',
      message: t('profile.deleteSuccess'),
      position: 'top',
      timeout: 2000,
    })

    refetchList()
  } catch (error) {
    console.error('Error deleting anime:', error)

    // ✅ Tắt loading khi lỗi
    loading()

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('profile.deleteError'),
      position: 'top',
      timeout: 3000,
    })
  }
}

const openAvatarModal = () => {
  showAvatarModal.value = true
}

const handleAvatarSaved = (newAvatar) => {
  // Update the profile data with the new avatar
  if (profileData.value?.user) {
    profileData.value.user.avatar = newAvatar
  }
}
</script>

<style lang="scss" scoped>
// ========== PAGE CONTAINER ==========
.profile-page {
  min-height: 100vh;
  background: #121212;
  padding-bottom: 60px;
}

.page-container {
  padding-top: 20px;
}

// ========== PROFILE HEADER ==========
.profile-header-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 3px solid rgba(0, 212, 255, 0.3);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
  }
}

.user-name {
  color: rgba(255, 255, 255, 0.95);
}

.profile-bio {
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
}

// ========== STATUS NAVIGATION ==========
.status-nav-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.status-tabs {
  :deep(.q-tab) {
    color: rgba(255, 255, 255, 0.6);

    &.q-tab--active {
      color: #00d4ff;
    }
  }

  :deep(.q-tab__label) {
    font-weight: 600;
  }
}

// ========== FILTER BAR ==========
.filter-bar {
  :deep(.q-card) {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.9);
  }

  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.9);
  }
}

// ========== ANIME GRID ==========
.anime-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

  @media (min-width: 1280px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (min-width: 1024px) and (max-width: 1279px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 600px) and (max-width: 767px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.anime-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.15);

    .play-overlay {
      opacity: 1;
    }

    .delete-button {
      opacity: 1;
    }
  }
}

.anime-poster-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3 / 4;

  .anime-poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .score-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(255, 193, 7, 0.9);
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .delete-button {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

.anime-info {
  .anime-title {
    color: rgba(255, 255, 255, 0.95);
    font-size: 0.9rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .anime-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    > div {
      &:not(:last-child)::after {
        content: '•';
        margin-left: 8px;
        color: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .anime-note {
    background: rgba(255, 255, 255, 0.03);
    padding: 4px 8px;
    border-radius: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// ========== EMPTY & ERROR STATES ==========
.empty-state,
.error-state {
  padding: 80px 20px;

  h3 {
    color: rgba(255, 255, 255, 0.95);
  }

  p {
    color: rgba(255, 255, 255, 0.5);
  }

  .q-icon {
    opacity: 0.3;
  }
}

// ========== SKELETON ==========
.anime-card-skeleton {
  .q-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
}

:deep(.q-skeleton) {
  background: rgba(255, 255, 255, 0.05);

  &::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  }
}
</style>
