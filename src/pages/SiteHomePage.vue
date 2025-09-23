<template>
  <!-- site hero section here if home -->
  <SiteHeroSection />

  <q-page class="flex justify-center q-px-lx">
    <SiteTrendingCarousel />
  </q-page>

</template>

<script setup>
import SiteHeroSection from 'src/components/site-hero-section/SiteHeroSection.vue'
import SiteTrendingCarousel from 'src/components/site-trending-carousel/SiteTrendingCarousel.vue'

</script>
