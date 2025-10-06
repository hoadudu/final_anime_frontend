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
        <q-btn round flat>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <q-tooltip>{{ t('header.account') }}</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>

    <!-- Live Search Results -->
    <LiveSearch
      :is-open="showLiveSearch && search.length > 0"
      :results="liveSearchResults"
      :is-loading="isSearching"
      @close="closeLiveSearch"
      @anime-click="handleAnimeClick"
    />
  </q-header>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { fabYoutube } from '@quasar/extras/fontawesome-v6'
import { useDrawerStore } from 'src/stores/site-drawer'
import { useLiveSearchData } from 'src/composables/live-seach/useLiveSearchData'
import LiveSearch from 'src/components/LiveSeach.vue'

const { t } = useI18n()
const router = useRouter()
const drawerStore = useDrawerStore()
const search = ref('')
const showLiveSearch = ref(false)

// Fetch live search data - composable sẽ tự xử lý debouncing
const { data: liveSearchData, isLoading: isSearching } = useLiveSearchData(search)

// Extract results from API response
const liveSearchResults = computed(() => {
  if (!liveSearchData.value) return []
  return liveSearchData.value.results || liveSearchData.value.data || liveSearchData.value || []
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
