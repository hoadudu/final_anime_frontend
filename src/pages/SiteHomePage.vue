<template>


  <q-page padding>
    <q-container class="q-px-lg">
      <SiteHeroSection />
      <SiteTrendingCarousel />
    </q-container>
  </q-page>

</template>

<script setup>
import SiteHeroSection from 'src/components/site-hero-section/SiteHeroSection.vue'
import SiteTrendingCarousel from 'src/components/site-trending-carousel/SiteTrendingCarousel.vue'

</script>
