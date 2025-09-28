<template>
    <div class="videos-content">
        <div class="text-h6 q-mb-md">Videos</div>

        <!-- Videos Grid -->
        <div class="videos-grid">
            <q-card v-for="video in videos" :key="video.id" class="video-card cursor-pointer" flat
                @click="playVideo(video)">
                <div class="video-thumbnail-container">
                    <!-- YouTube Thumbnail -->
                    <div class="video-thumbnail" :style="{ backgroundImage: `url(${getYoutubeThumbnail(video.url)})` }">
                        <div class="video-overlay">
                            <q-btn round color="red" icon="play_arrow" size="lg" class="play-button"
                                @click.stop="playVideo(video)" />
                        </div>

                        <!-- Video Duration (if available) -->
                        <div class="video-duration" v-if="video.duration">
                            {{ formatDuration(video.duration) }}
                        </div>

                        <!-- Video Type Badge -->
                        <div class="video-type-badge" v-if="getVideoType(video.title)">
                            <q-badge :color="getVideoTypeColor(video.title)" :label="getVideoType(video.title)"
                                rounded />
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loadingVideo === video.id" class="video-loading">
                        <q-spinner color="red" size="3em" />
                        <div class="q-mt-sm">Loading video...</div>
                    </div>
                </div>

                <q-card-section class="video-info">
                    <div class="video-title" :title="video.title">
                        {{ video.title }}
                    </div>
                    <div class="video-meta text-grey-6">
                        <q-icon name="play_circle" size="14px" class="q-mr-xs" />
                        {{ getVideoSource(video.url) }}
                        <span v-if="video.views" class="q-ml-md">
                            <q-icon name="visibility" size="14px" class="q-mr-xs" />
                            {{ formatViews(video.views) }}
                        </span>
                    </div>
                </q-card-section>

                <!-- Action Buttons -->
                <div class="video-actions">
                    <q-btn flat round icon="open_in_new" color="primary" size="sm"
                        @click.stop="openExternal(video.url)">
                        <q-tooltip>Open in new tab</q-tooltip>
                    </q-btn>
                    <q-btn flat round :icon="isWatchLater(video.id) ? 'watch_later' : 'schedule'"
                        :color="isWatchLater(video.id) ? 'orange' : 'grey-5'" size="sm"
                        @click.stop="toggleWatchLater(video)">
                        <q-tooltip>{{ isWatchLater(video.id) ? 'Remove from' : 'Add to' }} Watch Later</q-tooltip>
                    </q-btn>
                    <q-btn flat round icon="share" color="grey-5" size="sm" @click.stop="shareVideo(video)">
                        <q-tooltip>Share</q-tooltip>
                    </q-btn>
                </div>
            </q-card>
        </div>

        <!-- Video Modal -->
        <q-dialog v-model="showVideoModal" maximized>
            <q-card class="video-modal">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">{{ currentVideo?.title }}</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section class="video-player-container">
                    <div v-if="currentVideo" class="video-player">
                        <iframe :src="getEmbedUrl(currentVideo.url)" frameborder="0" allowfullscreen
                            class="video-iframe"></iframe>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- Empty State -->
        <q-card v-if="!videos || videos.length === 0" flat bordered class="empty-state">
            <q-card-section class="text-center q-pa-xl">
                <q-icon name="video_library" size="60px" color="grey-5" />
                <div class="q-mt-md text-h6 text-grey-6">No Videos Available</div>
                <div class="text-grey-5">Trailers and promotional videos will appear here</div>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
    videos: {
        type: Array,
        default: () => []
    }
})


const videos = computed(() => props.videos || [])
// Emits
const emit = defineEmits(['play-video', 'external-open', 'watch-later-changed', 'video-shared'])

// Reactive state
const showVideoModal = ref(false)
const currentVideo = ref(null)
const loadingVideo = ref(null)
const watchLaterList = ref([]) // Store in localStorage or Vuex in real app

// Methods
const playVideo = (video) => {
    currentVideo.value = video
    showVideoModal.value = true
    emit('play-video', video)
}

const getYoutubeThumbnail = (url) => {
    const videoId = extractYouTubeID(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` :
        'https://via.placeholder.com/320x180/f5f5f5/999?text=Video'
}

const extractYouTubeID = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : false
}

const getEmbedUrl = (url) => {
    const videoId = extractYouTubeID(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url
}

const getVideoSource = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'YouTube'
    } else if (url.includes('vimeo.com')) {
        return 'Vimeo'
    } else if (url.includes('dailymotion.com')) {
        return 'Dailymotion'
    }
    return 'External'
}

const getVideoType = (title) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('pv') || lowerTitle.includes('promotional')) {
        return 'PV'
    } else if (lowerTitle.includes('trailer')) {
        return 'Trailer'
    } else if (lowerTitle.includes('teaser')) {
        return 'Teaser'
    } else if (lowerTitle.includes('cm')) {
        return 'CM'
    }
    return null
}

const getVideoTypeColor = (title) => {
    const type = getVideoType(title)
    const colors = {
        'PV': 'red',
        'Trailer': 'purple',
        'Teaser': 'orange',
        'CM': 'green'
    }
    return colors[type] || 'grey-6'
}

const openExternal = (url) => {
    window.open(url, '_blank')
    emit('external-open', url)
}

const toggleWatchLater = (video) => {
    const index = watchLaterList.value.findIndex(id => id === video.id)
    if (index > -1) {
        watchLaterList.value.splice(index, 1)
    } else {
        watchLaterList.value.push(video.id)
    }
    emit('watch-later-changed', video, isWatchLater(video.id))
}

const isWatchLater = (videoId) => {
    return watchLaterList.value.includes(videoId)
}

const shareVideo = (video) => {
    if (navigator.share) {
        navigator.share({
            title: video.title,
            url: video.url
        })
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(video.url)
        window.Quasar.notify({
            message: 'Video URL copied to clipboard!',
            type: 'positive',
            position: 'bottom'
        })
    }
    emit('video-shared', video)
}

const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatViews = (views) => {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M views`
    } else if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K views`
    }
    return `${views} views`
}
</script>

<style lang="scss" scoped>
.videos-content {
    .videos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 16px;
        }
    }

    .video-card {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        background: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);

            .video-overlay {
                opacity: 1;
                background: rgba(0, 0, 0, 0.7);
            }

            .play-button {
                transform: scale(1.2);
            }

            .video-actions {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .video-thumbnail-container {
            position: relative;
            height: 180px;
            overflow: hidden;

            .video-thumbnail {
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-color: #f5f5f5;
                position: relative;
            }

            .video-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .play-button {
                transition: transform 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

                .q-btn__content {
                    font-size: 24px;
                }
            }

            .video-duration {
                position: absolute;
                bottom: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .video-type-badge {
                position: absolute;
                top: 8px;
                left: 8px;

                .q-badge {
                    font-weight: 600;
                    font-size: 10px;
                    padding: 4px 8px;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.9);
                }
            }

            .video-loading {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #666;
            }
        }

        .video-info {
            padding: 16px;
            padding-bottom: 60px; // Space for actions

            .video-title {
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .video-meta {
                font-size: 12px;
                display: flex;
                align-items: center;
                font-weight: 500;
            }
        }

        .video-actions {
            position: absolute;
            bottom: 12px;
            right: 12px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        }
    }

    .video-modal {
        .video-player-container {
            padding: 0;
            height: calc(100vh - 80px);

            .video-player {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                .video-iframe {
                    width: 100%;
                    height: 100%;
                    max-width: 1200px;
                    max-height: 675px;
                }
            }
        }
    }

    .empty-state {
        margin-top: 20px;
        border-radius: 16px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
}

// Dark mode support
.body--dark {
    .videos-content {
        .video-card {
            background: #2d3748;

            .video-info {
                .video-title {
                    color: #f7fafc;
                }
            }

            .video-type-badge .q-badge {
                background: rgba(45, 55, 72, 0.9);
                color: #f7fafc;
            }
        }

        .empty-state {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        }

        .video-modal {
            background: #1a202c;
        }
    }
}
</style>