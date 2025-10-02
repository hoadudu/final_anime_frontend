<template>
  <div class="breadcrumb-container" v-if="anime && episode">
    <div class="breadcrumb-wrapper">
      <q-breadcrumbs class="breadcrumb-nav" active-color="primary">
        <q-breadcrumbs-el
          icon="home"
          :label="t('common.home')"
          :to="{ name: 'site-home' }"
          class="breadcrumb-item"
        />
        <q-breadcrumbs-el :label="anime.title" :to="animeLink" class="breadcrumb-item" />
        <q-breadcrumbs-el
          :label="episode.title || 'Episode ' + (episode.number || '')"
          class="breadcrumb-current"
        />
      </q-breadcrumbs>
    </div>
  </div>
  <div v-else class="q-my-sm"></div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  anime: { type: Object, required: true },
  episode: { type: Object, required: true },
  slug: { type: String, required: true },
})

const animeLink = computed(() => {
  // Prefer backend-provided link if present, else build from slug
  if (props.anime?.link) return props.anime.link
  // fallback to info route if needed
  return { name: 'site-anime', params: { slugWithId: `${props.slug}` } }
})
</script>

<style scoped>
.breadcrumb-container {
  margin-bottom: 8px;
}
.breadcrumb-wrapper {
  padding: 8px 0;
}
.breadcrumb-nav {
  font-size: 14px;
}
.breadcrumb-item {
  color: var(--q-white, #e4e3eef7);
}
.breadcrumb-current {
  font-weight: 600;
}
</style>
