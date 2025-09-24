<template>
  <q-page class="q-px-lg flex-center">
    <div class="q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%;">
      <SiteHeroSection />
      <SiteTrendingCarousel />
      <SiteAnimeFeatured />



    </div>

  </q-page>


</template>

<script setup>
import SiteHeroSection from 'src/components/site-hero-section/SiteHeroSection.vue'
import SiteTrendingCarousel from 'src/components/site-trending-carousel/SiteTrendingCarousel.vue'
import SiteAnimeFeatured from 'src/components/site-anime-featured/SiteAnimeFeatured.vue'

</script>
