<template>
  <q-page :class="[pagePadding, 'flex-center']">
    <div class="q-mx-auto" style="max-width: 1920px; width: 100%">
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
import SiteLatestEpisode from 'src/components/home-page/site-latest-episode-posts/SiteLatestEpisodePosts.vue'
import TopTen from 'src/components/side-bar/TopTen.vue'

import { computed } from 'vue'
import { useQuasar, useMeta } from 'quasar'
const $q = useQuasar()

const pagePadding = computed(() => {
  if ($q.screen.lt.sm) return 'q-px-sm'
  if ($q.screen.lt.md) return 'q-px-md'
  return 'q-px-lg'
})

// Setup comprehensive meta tags for homepage
useMeta(() => ({
  title: 'Anime47 - Xem Anime Online Chất Lượng Cao Miễn Phí',
  titleTemplate: null, // Don't add suffix for homepage

  meta: {
    description: {
      name: 'description',
      content: 'Xem anime online chất lượng cao miễn phí tại Anime47. Cập nhật nhanh nhất các anime mới, anime hot, anime vietsub, lồng tiếng. Kho anime khổng lồ với đầy đủ thể loại từ hành động, lãng mạn, hài hước đến kinh dị.',
    },
    keywords: {
      name: 'keywords',
      content: 'xem anime online, anime vietsub, anime lồng tiếng, anime mới nhất, anime hot, anime hành động, anime lãng mạn, anime hài hước, trang xem anime, anime miễn phí, anime chất lượng cao, anime full hd',
    },
    equiv: {
      'http-equiv': 'Content-Type',
      content: 'text/html; charset=UTF-8',
    },
    author: {
      name: 'author',
      content: 'Anime47 Team',
    },

    // Open Graph meta tags
    ogTitle: {
      property: 'og:title',
      content: 'Anime47 - Xem Anime Online Chất Lượng Cao Miễn Phí',
    },
    ogDescription: {
      property: 'og:description',
      content: 'Khám phá thế giới anime tại Anime47! Xem anime mới nhất, hot nhất với chất lượng HD. Cập nhật nhanh, vietsub chuẩn, hoàn toàn miễn phí.',
    },
    ogImage: {
      property: 'og:image',
      content: process.env.CLIENT ? `${window.location.origin}/icons/favicon-512x512.png` : '/icons/favicon-512x512.png',
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    ogUrl: {
      property: 'og:url',
      content: process.env.CLIENT ? `${window.location.origin}` : '/',
    },
    ogLocale: {
      property: 'og:locale',
      content: 'vi_VN',
    },
    ogSiteName: {
      property: 'og:site_name',
      content: 'Anime47',
    },

    // Twitter Card meta tags
    twitterCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    twitterTitle: {
      name: 'twitter:title',
      content: 'Anime47 - Xem Anime Online Chất Lượng Cao',
    },
    twitterDescription: {
      name: 'twitter:description',
      content: 'Khám phá thế giới anime tại Anime47! Anime mới nhất, hot nhất với chất lượng HD.',
    },
    twitterImage: {
      name: 'twitter:image',
      content: process.env.CLIENT ? `${window.location.origin}/icons/favicon-512x512.png` : '/icons/favicon-512x512.png',
    },
  },

  link: {
    canonical: {
      rel: 'canonical',
      href: process.env.CLIENT ? `${window.location.origin}` : '/',
    },
  },

  script: {
    ldJson: {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Anime47',
        alternateName: 'Anime Vui',
        description: 'Trang web xem anime online chất lượng cao miễn phí với kho anime khổng lồ, cập nhật nhanh nhất.',
        url: process.env.CLIENT ? window.location.origin : '/',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: process.env.CLIENT ? `${window.location.origin}/tim-kiem?q={search_term_string}` : '/tim-kiem?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Anime47',
          logo: {
            '@type': 'ImageObject',
            url: process.env.CLIENT ? `${window.location.origin}/icons/favicon-512x512.png` : '/icons/favicon-512x512.png'
          }
        },
        sameAs: [
          // Add social media links if available
          // 'https://facebook.com/Anime47',
          // 'https://twitter.com/Anime47'
        ],
        genre: ['Animation', 'Entertainment', 'Japanese Animation', 'Anime'],
        inLanguage: 'vi-VN',
        audience: {
          '@type': 'Audience',
          audienceType: 'Anime Fans'
        }
      }, null, 2),
    },
  },

  htmlAttr: {
    lang: 'vi',
  },

  bodyAttr: {
    itemscope: '',
    itemtype: 'https://schema.org/WebPage',
  },
}))
</script>
