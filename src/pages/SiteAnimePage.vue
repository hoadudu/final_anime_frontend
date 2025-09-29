<template>
    <q-page class="anime-page">
        <div class="page-container q-mx-auto q-px-lg" style="max-width: 1920px; width: 100%;">

            <!-- Main Anime Info -->
            <AnimeInfo :slugWithId="slugWithId" />

            <!-- Additional Content with Sidebar Layout -->
            <div class="additional-content q-mt-xl">
                <div class="row q-col-gutter-lg">
                    <!-- Extended Content Area -->
                    <div class="col-12 col-lg-9">
                        <!-- Recommendations Section -->
                        <q-card flat bordered class="recommendations-card">
                            <q-card-section>
                                <div class="text-h6 q-mb-md">
                                    <q-icon name="recommend" class="q-mr-sm" />
                                    {{ t('animePage.recommendations') }}
                                </div>
                                <div class="text-center q-pa-xl">
                                    <q-icon name="construction" size="50px" color="grey" />
                                    <div class="q-mt-md">{{ t('animePage.recommendationsComingSoon') }}</div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>

                    <!-- Enhanced Sidebar -->
                    <div class="col-12 col-lg-3">
                        <div class="sidebar-content">
                            <!-- Top Anime Card -->
                            <TopTen />

                            <!-- Recent Reviews Card -->
                            <q-card flat bordered class="sidebar-card q-mb-lg">
                                <q-card-section>
                                    <div class="text-h6 q-mb-md">
                                        <q-icon name="rate_review" class="q-mr-sm" />
                                        {{ t('animePage.recentReviews') }}
                                    </div>
                                    <div class="text-center q-pa-md">
                                        <q-icon name="construction" size="30px" color="grey" />
                                        <div class="q-mt-sm text-caption">{{ t('animePage.comingSoon') }}</div>
                                    </div>
                                </q-card-section>
                            </q-card>

                            <!-- News Card -->
                            <q-card flat bordered class="sidebar-card">
                                <q-card-section>
                                    <div class="text-h6 q-mb-md">
                                        <q-icon name="article" class="q-mr-sm" />
                                        {{ t('animePage.latestNews') }}
                                    </div>
                                    <div class="text-center q-pa-md">
                                        <q-icon name="construction" size="30px" color="grey" />
                                        <div class="q-mt-sm text-caption">{{ t('animePage.comingSoon') }}</div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import AnimeInfo from 'src/components/anime-info-page/AnimeInfo.vue';
import TopTen from 'src/components/side-bar/TopTen.vue'

const { t } = useI18n();
const route = useRoute();

const slugWithId = computed(() => route.params.slugWithId);
</script>
