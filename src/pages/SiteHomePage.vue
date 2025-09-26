<template>
  <q-page class="q-px-lg flex-center">
    <div class="q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%;">
      <SiteHeroSection />
      <SiteTrendingCarousel />
      <SiteAnimeFeatured />
      <!-- Main Content + Sidebar -->
      <div class="row q-col-gutter-md q-mt-lg">
        <!-- Main Content -->
        <div class="col-12 col-md-9">
          <SiteLatestEpisode />
        </div>

        <!-- Sidebar right-->
        <div class="col-12 col-md-3">
          <TopTen />
        </div>
      </div>




    </div>

  </q-page>


</template>

<script setup>
import SiteHeroSection from 'src/components/home-page/site-hero-section/SiteHeroSection.vue'
import SiteTrendingCarousel from 'src/components/home-page/site-trending-carousel/SiteTrendingCarousel.vue'
import SiteAnimeFeatured from 'src/components/home-page/site-anime-featured/SiteAnimeFeatured.vue'
import SiteLatestEpisode from 'src/components/home-page/site-latest-episode/SiteLatestEpisodePosts.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'

</script>
