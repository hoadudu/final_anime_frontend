<template>


  <q-page class="padding justify-center">
    <q-container class="q-px-lg">
      <SiteHeroSection />
      <SiteTrendingCarousel />
    </q-container>
    <div>
      <p>Chiều rộng màn hình: {{ $q.screen.width }}px</p>
      <p>Breakpoint hiện tại:
        <span v-if="$q.screen.xs">XS</span>
        <span v-else-if="$q.screen.sm">SM</span>
        <span v-else-if="$q.screen.md">MD</span>
        <span v-else-if="$q.screen.lg">LG</span>
        <span v-else>XL</span>
      </p>
    </div>
  </q-page>

</template>

<script setup>
import SiteHeroSection from 'src/components/site-hero-section/SiteHeroSection.vue'
import SiteTrendingCarousel from 'src/components/site-trending-carousel/SiteTrendingCarousel.vue'

</script>
