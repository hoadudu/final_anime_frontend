<template>
  <q-drawer
    v-model="drawerStore.leftDrawerOpen"
    overlay
    bordered
    class="bg-grey-2 drawer-high-priority"
    :width="310"
    elevation="150"
  >
    <div class="drawer-header">
      <q-btn flat round dense icon="close" @click="closeDrawer" class="close-btn" />
    </div>
    <q-scroll-area class="fit">
      <q-list padding>
        <q-item v-ripple clickable @click="handleLinkClick()">
          <q-item-section avatar>
            <q-icon color="grey" name="face" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('drawer.genre') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-ripple clickable @click="handleFilterClick()">
          <q-item-section avatar>
            <q-icon color="grey" name="filter_list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('drawer.filter') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item v-for="link in links2" :key="link.text" v-ripple clickable>
          <q-item-section avatar>
            <q-icon color="grey" :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-mt-md q-mb-xs" />

        <q-item-label header class="text-weight-bold text-uppercase">
          {{ t('drawer.moreFromYoutube') }}
        </q-item-label>

        <q-item v-for="link in links3" :key="link.text" v-ripple clickable>
          <q-item-section avatar>
            <q-icon color="grey" :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header>{{ t('drawer.language') }}</q-item-label>
        <q-item>
          <q-item-section>
            <q-btn-toggle
              v-model="drawerStore.language"
              spread
              no-caps
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="drawerStore.languageOptions"
              class="full-width"
              @update:model-value="handleLanguageChange"
            />
          </q-item-section>
        </q-item>

        <q-separator class="q-mt-md q-mb-lg" />

        <div class="q-px-md text-grey-9">
          <div class="row items-center q-gutter-x-sm q-gutter-y-xs">
            <a
              v-for="button in buttons1"
              :key="button.text"
              class="YL__drawer-footer-link"
              href="javascript:void(0)"
            >
              {{ button.text }}
            </a>
          </div>
        </div>
        <div class="q-py-md q-px-md text-grey-9">
          <div class="row items-center q-gutter-x-sm q-gutter-y-xs">
            <a
              v-for="button in buttons2"
              :key="button.text"
              class="YL__drawer-footer-link"
              href="javascript:void(0)"
            >
              {{ button.text }}
            </a>
          </div>
        </div>
      </q-list>
    </q-scroll-area>
    <ModalGenre v-model="showGenreModal" @apply="handleGenreApply" />
    <ModalFilter v-model="showFilterModal" @apply-filters="handleFilterApply" />
  </q-drawer>
</template>

<script setup>
import { onMounted, computed, watch, ref } from 'vue'
import { useDrawerStore } from 'src/stores/site-drawer'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import ModalGenre from 'src/components/modals/ModalGenre.vue'
import ModalFilter from 'src/components/modals/ModalFilter.vue'

const { locale, t } = useI18n()
const router = useRouter()
const $q = useQuasar()

const showGenreModal = ref(false)
const showFilterModal = ref(false)

const drawerStore = useDrawerStore()
onMounted(() => {
  drawerStore.fetchDrawerData()

  // Đồng bộ ngôn ngữ khi mount
  locale.value = drawerStore.language
})

function closeDrawer() {
  // Đóng drawer
  drawerStore.leftDrawerOpen = false
}

function handleLinkClick() {
  // Mở modal thể loại
  showGenreModal.value = true
}

function handleFilterClick() {
  // Desktop: Chuyển đến route /filter
  // Mobile/Tablet: Mở modal filter
  console.log('Filter clicked, platform:', $q.platform)
  console.log('Is desktop:', $q.platform.is.desktop)

  if ($q.platform.is.desktop) {
    // Desktop - Navigate to filter page
    router.push({ name: 'site-filter' })
    drawerStore.leftDrawerOpen = false
  } else {
    // Mobile/Tablet - Open filter modal
    console.log('Opening filter modal...')
    showFilterModal.value = true
  }
}

function handleGenreApply() {
  // Đóng drawer sau khi apply genres
  drawerStore.leftDrawerOpen = false
}

function handleFilterApply(filters) {
  // Navigate to filter page với query params
  const query = {}

  if (filters.type) query.type = filters.type
  if (filters.status) query.status = filters.status
  if (filters.season) query.season = filters.season
  if (filters.year) query.year = filters.year
  if (filters.sort) query.sort = filters.sort
  if (filters.genres && filters.genres.length > 0) query.genres = filters.genres.join(',')

  router.push({ name: 'site-filter', query })

  // Đóng drawer sau khi apply filters
  drawerStore.leftDrawerOpen = false
}

function handleLanguageChange(newLanguage) {
  drawerStore.setLanguage(newLanguage)
  locale.value = newLanguage // Thay đổi locale trong component
}

watch(
  () => drawerStore.language,
  (newLang) => {
    console.log('Language changed to:', newLang)
  },
)

const links2 = computed(() => drawerStore.links.links2)
const links3 = computed(() => drawerStore.links.links3)

const buttons1 = computed(() => drawerStore.buttons.buttons1)
const buttons2 = computed(() => drawerStore.buttons.buttons2)
</script>

<style lang="sass">
// Drawer header với nút close
.drawer-header
  display: flex
  justify-content: flex-end
  align-items: center
  padding: 8px 16px
  background: rgba(0, 0, 0, 0.05)
  border-bottom: 1px solid rgba(0, 0, 0, 0.1)
  min-height: 56px

  .close-btn
    color: #666

    &:hover
      color: #333
      background: rgba(0, 0, 0, 0.1)

// Responsive cho mobile
@media (max-width: 767px)
  .drawer-header
    padding: 12px 16px
    min-height: 60px
    background: rgba(139, 92, 246, 0.1)

    .close-btn
      font-size: 1.2rem
      color: #8b5cf6
      padding: 8px
      border-radius: 50%
      transition: all 0.3s ease

      &:hover
        background: rgba(139, 92, 246, 0.2)
        color: #7c3aed
        transform: scale(1.1)

.YL

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem
    &:hover
      color: #000
</style>
