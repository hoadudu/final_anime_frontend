<template>
  <q-header elevated class="bg-transparent text-grey-8 q-py-xs" height-hint="68">
    <q-toolbar class="YL__toolbar-blur">
      <q-btn
        flat
        dense
        round
        @click="toggleLeftDrawer"
        :aria-label="t('header.menuButton')"
        :icon="drawerStore.leftDrawerOpen ? 'close' : 'menu'"
      />

      <q-btn flat no-caps no-wrap class="q-ml-xs" v-if="$q.screen.gt.xs">
        <q-icon :name="fabYoutube" color="red" size="28px" />
        <q-toolbar-title shrink class="text-weight-bold"> YouTube </q-toolbar-title>
      </q-btn>

      <q-space />

      <div class="YL__toolbar-input-container row no-wrap">
        <q-input
          dense
          outlined
          square
          v-model="search"
          :placeholder="t('header.searchPlaceholder')"
          class="bg-white col"
          @keyup.enter="handleSearch"
          @focus="showLiveSearch = true"
        >
          <template v-slot:append v-if="search">
            <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
          </template>
        </q-input>
        <q-btn
          class="YL__toolbar-input-btn"
          color="grey-3"
          text-color="grey-8"
          icon="search"
          unelevated
          @click="handleSearch"
          :disable="!search"
        />
      </div>

      <q-space />

      <div class="q-gutter-sm row items-center no-wrap">
        <q-btn round dense flat color="grey-8" icon="video_call" v-if="$q.screen.gt.sm">
          <q-tooltip>{{ t('header.createVideo') }}</q-tooltip>
        </q-btn>
        <q-btn round dense flat color="grey-8" icon="apps" v-if="$q.screen.gt.sm">
          <q-tooltip>{{ t('header.apps') }}</q-tooltip>
        </q-btn>
        <q-btn round dense flat color="grey-8" icon="message" v-if="$q.screen.gt.sm">
          <q-tooltip>{{ t('header.messages') }}</q-tooltip>
        </q-btn>
        <q-btn round dense flat color="grey-8" icon="notifications">
          <q-badge color="red" text-color="white" floating> 2 </q-badge>
          <q-tooltip>{{ t('header.notifications') }}</q-tooltip>
        </q-btn>
        <template v-if="authState.isInitialized && authState.hasValidToken">
          <q-btn round flat>
            <q-avatar size="26px">
              <img
                :src="authState.user?.avatarUrl || 'https://cdn.quasar.dev/img/boy-avatar.png'"
              />
            </q-avatar>
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 160px">
                <q-item clickable v-ripple @click="goProfile">
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>{{ t('common.profile') }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-ripple @click="handleLogout">
                  <q-item-section avatar><q-icon name="logout" /></q-item-section>
                  <q-item-section>{{ t('common.logout') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-tooltip>{{ t('header.account') }}</q-tooltip>
          </q-btn>
        </template>
        <template v-else-if="authState.isInitialized">
          <q-btn round dense flat color="primary" icon="login" @click="$emit('open-auth')">
            <q-tooltip>{{ t('common.login') }}</q-tooltip>
          </q-btn>
        </template>
        <template v-else>
          <!-- Loading state while auth is being initialized -->
          <q-btn round dense flat disabled>
            <q-avatar size="26px" color="grey-4">
              <q-icon name="hourglass_empty" size="16px" />
            </q-avatar>
          </q-btn>
        </template>
      </div>
    </q-toolbar>

    <!-- Live Search Results -->
    <LiveSearch
      :is-open="showLiveSearch"
      :results="liveSearchResults"
      :is-loading="false"
      @close="closeLiveSearch"
      @anime-click="handleAnimeClick"
    />
  </q-header>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { fabYoutube } from '@quasar/extras/fontawesome-v6'
import { useDrawerStore } from 'src/stores/site-drawer'
import { useAuth } from 'src/composables/auth/useAuth'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import LiveSearch from 'src/components/LiveSeach.vue'

const { t } = useI18n()
const router = useRouter()
const $q = useQuasar()
const drawerStore = useDrawerStore()
const authStore = useAuthStore()
const search = ref('')

// Auth state - use storeToRefs for proper reactivity
const { isAuthenticated, user } = storeToRefs(authStore)

// Auth actions
const { logout: logoutAction } = useAuth()

// Auth state for template
const authState = computed(() => {
  return {
    isInitialized: true,
    hasValidToken: isAuthenticated.value,
    user: user.value,
  }
})

// Live search state
const showLiveSearch = ref(false)

// Extract results from API response (keeping for compatibility)
const liveSearchResults = computed(() => {
  return []
})

function toggleLeftDrawer() {
  drawerStore.toggleLeftDrawer()
}

/**
 * Clear search input and close live search
 */
function clearSearch() {
  search.value = ''
  showLiveSearch.value = false
}

/**
 * Close live search overlay
 */
function closeLiveSearch() {
  showLiveSearch.value = false
}

/**
 * Handle anime card click in live search
 */
function handleAnimeClick(anime) {
  // Optional: you can track analytics here
  console.log('Anime clicked:', anime.title)
}

async function handleLogout() {
  try {
    await logoutAction()

    // Show success notification
    $q.notify({
      type: 'positive',
      message: t('auth.logoutSuccess'),
      timeout: 5000,
      position: 'top',
    })

    // Redirect to home if needed
    if (router.currentRoute.value.meta?.requiresAuth) {
      router.push({ name: 'home' })
    }
  } catch (error) {
    console.error('Logout error:', error)

    // Even if logout API fails, user is logged out locally
    $q.notify({
      type: 'warning',
      message: t('auth.logoutWarning'),
      timeout: 5000,
      position: 'top',
    })
  }
}

function goProfile() {
  // Replace with actual profile route when available
  router.push({ name: 'home' }).catch(() => {})
}

/**
 * Xử lý tìm kiếm anime
 * Navigate đến trang search với keyword query parameter
 */
function handleSearch() {
  const keyword = search.value.trim()

  if (!keyword) {
    return
  }

  // Close live search
  showLiveSearch.value = false

  // Navigate đến trang tìm kiếm với keyword
  router
    .push({
      name: 'site-search',
      query: {
        keyword: keyword,
        page: 1,
      },
    })
    .then(() => {
      // Clear search input sau khi navigate thành công (optional)
      // search.value = ''
    })
    .catch(() => {
      // Nếu đã ở trang search, router.push sẽ fail, nhưng query vẫn update
      // Không cần làm gì
    })
}

// Watch for route changes to close live search
watch(
  () => router.currentRoute.value,
  () => {
    showLiveSearch.value = false
  },
)
</script>

<style lang="sass">
.YL
  &__toolbar-blur
    background: rgba(255,255,255,0.7)
    backdrop-filter: blur(8px)
    box-shadow: 0 1px 2px rgba(0,0,0,.1)
  &__toolbar-input-container
    min-width: 100px
    width: 55%

  &__toolbar-input-btn
    border-radius: 0
    border-style: solid
    border-width: 1px 1px 1px 0
    border-color: rgba(0,0,0,.24)
    max-width: 60px
    width: 100%

    &:hover
      color: #000

// Search input enhancements
.q-field__append
  .q-icon
    font-size: 18px
    opacity: 0.6
    transition: opacity 0.2s ease

    &:hover
      opacity: 1
</style>
