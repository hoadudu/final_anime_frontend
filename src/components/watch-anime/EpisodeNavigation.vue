<template>
  <div class="row q-col-gutter-sm">
    <div class="col-6">
      <q-btn outline color="primary" class="full-width" :disable="!prev" @click="go(prev)">
        {{ $t('watch.prevEpisode') || 'Previous Episode' }}
      </q-btn>
    </div>
    <div class="col-6">
      <q-btn color="primary" class="full-width" :disable="!next" @click="go(next)">
        {{ $t('watch.nextEpisode') || 'Next Episode' }}
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  prev: { type: Object, default: null },
  next: { type: Object, default: null },
  slug: { type: String, required: true },
})

const router = useRouter()

function go(target) {
  if (!target) return
  const number = target.number || target.sort_number || ''
  router.push({ name: 'site-watch', params: { slug: props.slug, number, id: target.id } })
}
</script>
