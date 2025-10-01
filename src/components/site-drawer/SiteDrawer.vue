<template>
  <q-drawer v-model="drawerStore.leftDrawerOpen" overlay bordered class="bg-grey-2 drawer-high-priority" :width="310"
    elevation="150">
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
            <q-btn-toggle v-model="drawerStore.language" spread no-caps toggle-color="primary" color="white"
              text-color="primary" :options="drawerStore.languageOptions" class="full-width"
              @update:model-value="handleLanguageChange" />
          </q-item-section>
        </q-item>

        <q-separator class="q-mt-md q-mb-lg" />

        <div class="q-px-md text-grey-9">
          <div class="row items-center q-gutter-x-sm q-gutter-y-xs">
            <a v-for="button in buttons1" :key="button.text" class="YL__drawer-footer-link" href="javascript:void(0)">
              {{ button.text }}
            </a>
          </div>
        </div>
        <div class="q-py-md q-px-md text-grey-9">
          <div class="row items-center q-gutter-x-sm q-gutter-y-xs">
            <a v-for="button in buttons2" :key="button.text" class="YL__drawer-footer-link" href="javascript:void(0)">
              {{ button.text }}
            </a>
          </div>
        </div>
      </q-list>
    </q-scroll-area>
    <ModalGenre v-model="showGenreModal" />
  </q-drawer>
</template>

<script setup>
import { onMounted, computed, watch, ref } from 'vue'
import { useDrawerStore } from 'src/stores/site-drawer'
import { useI18n } from 'vue-i18n'
import ModalGenre from 'src/components/modals/ModalGenre.vue'

const { locale, t } = useI18n()
const showGenreModal = ref(false)

const drawerStore = useDrawerStore()
onMounted(() => {
  drawerStore.fetchDrawerData()

  // Đồng bộ ngôn ngữ khi mount
  locale.value = drawerStore.language
})

function handleLinkClick() {
  // Mở modal thể loại
  showGenreModal.value = true
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
.YL

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
  
</style>
