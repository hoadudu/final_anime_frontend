<template>
    <div class="images-gallery-content">
        <div class="text-h6 q-mb-md">Images</div>

        <!-- Image Type Tabs -->
        <div class="image-tabs q-mb-lg" v-if="hasImages">
            <q-btn-toggle v-model="activeTab" toggle-color="primary" :options="tabOptions" flat @input="switchTab" />
            <div class="tab-info text-grey-6 q-mt-sm">
                {{ getTabInfo() }}
            </div>
        </div>

        <!-- Images Masonry Grid -->
        <div class="images-masonry" v-if="currentImages.length > 0">
            <div v-for="(image, index) in currentImages" :key="image.id" class="image-item"
                :class="getImageClass(image.type)" @click="openLightbox(index)">
                <div class="image-container">
                    <q-img :src="image.url" :alt="`${image.type} image ${index + 1}`" class="gallery-image"
                        loading="lazy" fit="cover">
                        <template v-slot:loading>
                            <div class="image-loading">
                                <q-spinner color="primary" size="2em" />
                            </div>
                        </template>
                        <template v-slot:error>
                            <div class="image-error">
                                <q-icon name="broken_image" size="40px" color="grey-5" />
                                <div class="q-mt-sm text-caption">Failed to load</div>
                            </div>
                        </template>
                    </q-img>

                    <!-- Image Overlay -->
                    <div class="image-overlay">
                        <div class="overlay-content">
                            <q-btn round color="white" text-color="primary" icon="zoom_in" size="md" class="zoom-button"
                                @click.stop="openLightbox(index)" />
                            <div class="image-type-label">
                                {{ formatImageType(image.type) }}
                            </div>
                        </div>
                    </div>

                    <!-- Image Actions -->
                    <div class="image-actions">
                        <q-btn flat round icon="download" color="white" size="sm" @click.stop="downloadImage(image)">
                            <q-tooltip>Download</q-tooltip>
                        </q-btn>
                        <q-btn flat round :icon="isFavorite(image.id) ? 'favorite' : 'favorite_border'"
                            :color="isFavorite(image.id) ? 'red' : 'white'" size="sm"
                            @click.stop="toggleFavorite(image)">
                            <q-tooltip>{{ isFavorite(image.id) ? 'Remove from' : 'Add to' }} favorites</q-tooltip>
                        </q-btn>
                        <q-btn flat round icon="share" color="white" size="sm" @click.stop="shareImage(image)">
                            <q-tooltip>Share</q-tooltip>
                        </q-btn>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lightbox Modal -->
        <q-dialog v-model="showLightbox" maximized class="lightbox-dialog">
            <q-card class="lightbox-card">
                <q-card-section class="lightbox-header">
                    <div class="lightbox-title">
                        {{ formatImageType(currentImages[currentImageIndex]?.type) }}
                        <span class="image-counter">{{ currentImageIndex + 1 }} / {{ currentImages.length }}</span>
                    </div>
                    <q-space />
                    <div class="lightbox-actions">
                        <q-btn flat round icon="download" color="white"
                            @click="downloadImage(currentImages[currentImageIndex])" />
                        <q-btn flat round icon="fullscreen" color="white" @click="toggleFullscreen" />
                        <q-btn flat round icon="close" color="white" v-close-popup />
                    </div>
                </q-card-section>

                <q-card-section class="lightbox-content">
                    <div class="lightbox-navigation">
                        <q-btn v-if="currentImageIndex > 0" flat round icon="chevron_left" color="white" size="lg"
                            class="nav-button nav-prev" @click="previousImage" />

                        <div class="lightbox-image-container">
                            <q-img v-if="currentImages[currentImageIndex]" :src="currentImages[currentImageIndex].url"
                                class="lightbox-image" fit="contain"
                                :style="{ maxHeight: lightboxImageHeight + 'px' }" />
                        </div>

                        <q-btn v-if="currentImageIndex < currentImages.length - 1" flat round icon="chevron_right"
                            color="white" size="lg" class="nav-button nav-next" @click="nextImage" />
                    </div>

                    <!-- Thumbnail Strip -->
                    <div class="lightbox-thumbnails" v-if="currentImages.length > 1">
                        <div v-for="(image, index) in currentImages" :key="image.id" class="thumbnail-item"
                            :class="{ active: index === currentImageIndex }" @click="currentImageIndex = index">
                            <q-img :src="image.url" class="thumbnail-image" fit="cover" />
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- Empty State -->
        <q-card v-if="!hasImages" flat bordered class="empty-state">
            <q-card-section class="text-center q-pa-xl">
                <q-icon name="photo_library" size="60px" color="grey-5" />
                <div class="q-mt-md text-h6 text-grey-6">No Images Available</div>
                <div class="text-grey-5">Anime images will appear here once available</div>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Props
const props = defineProps({
    images: {
        type: Object,
        default: () => ({})
    }
})

// Emits
const emit = defineEmits(['tab-changed', 'image-viewed', 'image-downloaded', 'favorite-changed', 'image-shared'])

// Reactive state
const activeTab = ref('all')
const showLightbox = ref(false)
const currentImageIndex = ref(0)
const favoriteImages = ref([]) // Store in localStorage or Vuex in real app
const lightboxImageHeight = ref(window.innerHeight - 200)

// Computed properties
const hasImages = computed(() => {
    return Object.keys(props.images).some(key =>
        props.images[key] && props.images[key].length > 0
    )
})

const allImages = computed(() => {
    const images = []
    Object.keys(props.images).forEach(type => {
        if (props.images[type] && Array.isArray(props.images[type])) {
            images.push(...props.images[type])
        }
    })
    return images
})

const currentImages = computed(() => {
    if (activeTab.value === 'all') {
        return allImages.value
    }
    return props.images[activeTab.value] || []
})

const tabOptions = computed(() => {
    const options = [{ label: 'All', value: 'all' }]

    Object.keys(props.images).forEach(type => {
        if (props.images[type] && props.images[type].length > 0) {
            options.push({
                label: `${formatImageType(type)} (${props.images[type].length})`,
                value: type
            })
        }
    })

    return options
})

// Methods
const switchTab = (tab) => {
    activeTab.value = tab
    emit('tab-changed', tab)
}

const getTabInfo = () => {
    const count = currentImages.value.length
    const type = activeTab.value === 'all' ? 'images' : `${activeTab.value} images`
    return `${count} ${type} available`
}

const getImageClass = (type) => {
    return {
        'poster-image': type === 'poster',
        'cover-image': type === 'cover',
        'screenshot-image': type === 'screenshot'
    }
}

const formatImageType = (type) => {
    const types = {
        'poster': 'Poster',
        'cover': 'Cover',
        'screenshot': 'Screenshot',
        'banner': 'Banner',
        'background': 'Background'
    }
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const openLightbox = (index) => {
    currentImageIndex.value = index
    showLightbox.value = true
    emit('image-viewed', currentImages.value[index])
}

const nextImage = () => {
    if (currentImageIndex.value < currentImages.value.length - 1) {
        currentImageIndex.value++
    }
}

const previousImage = () => {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--
    }
}

const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `anime-${image.type}-${image.id}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    emit('image-downloaded', image)
}

const toggleFavorite = (image) => {
    const index = favoriteImages.value.findIndex(id => id === image.id)
    if (index > -1) {
        favoriteImages.value.splice(index, 1)
    } else {
        favoriteImages.value.push(image.id)
    }
    emit('favorite-changed', image, isFavorite(image.id))
}

const isFavorite = (imageId) => {
    return favoriteImages.value.includes(imageId)
}

const shareImage = (image) => {
    if (navigator.share) {
        navigator.share({
            title: `${formatImageType(image.type)} Image`,
            url: image.url
        })
    } else {
        navigator.clipboard.writeText(image.url)
        window.Quasar.notify({
            message: 'Image URL copied to clipboard!',
            type: 'positive',
            position: 'bottom'
        })
    }
    emit('image-shared', image)
}

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}

const handleKeyPress = (event) => {
    if (showLightbox.value) {
        switch (event.key) {
            case 'ArrowLeft':
                previousImage()
                break
            case 'ArrowRight':
                nextImage()
                break
            case 'Escape':
                showLightbox.value = false
                break
        }
    }
}

const updateLightboxHeight = () => {
    lightboxImageHeight.value = window.innerHeight - 200
}

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('resize', updateLightboxHeight)
    document.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateLightboxHeight)
    document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style lang="scss" scoped>
.images-gallery-content {
    .image-tabs {
        text-align: center;

        .tab-info {
            font-size: 12px;
            font-weight: 500;
        }
    }

    .images-masonry {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;

        @media (max-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        @media (max-width: 480px) {
            grid-template-columns: 1fr;
            gap: 12px;
        }

        .image-item {
            cursor: pointer;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.3s ease;

            &:hover {
                transform: translateY(-4px);

                .image-overlay {
                    opacity: 1;
                }

                .image-actions {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            &.poster-image {
                grid-row: span 2;
            }

            &.cover-image {
                grid-column: span 1;
            }

            .image-container {
                position: relative;
                height: 200px;

                &.poster-image {
                    height: 300px;
                }

                .gallery-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 12px;
                }

                .image-loading,
                .image-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: #f5f5f5;
                    color: #666;
                }

                .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg,
                            rgba(25, 118, 210, 0.8) 0%,
                            rgba(156, 39, 176, 0.8) 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    border-radius: 12px;

                    .overlay-content {
                        text-align: center;
                        color: white;

                        .zoom-button {
                            margin-bottom: 12px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        }

                        .image-type-label {
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                    }
                }

                .image-actions {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;

                    .q-btn {
                        backdrop-filter: blur(10px);
                        background: rgba(0, 0, 0, 0.5);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                }
            }
        }
    }

    .empty-state {
        margin-top: 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
}

// Lightbox Styles
.lightbox-dialog {
    .lightbox-card {
        background: rgba(0, 0, 0, 0.95);
        color: white;

        .lightbox-header {
            padding: 16px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            .lightbox-title {
                font-size: 18px;
                font-weight: 600;

                .image-counter {
                    margin-left: 16px;
                    font-size: 14px;
                    opacity: 0.7;
                }
            }

            .lightbox-actions {
                display: flex;
                gap: 8px;
            }
        }

        .lightbox-content {
            padding: 0;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 80px);

            .lightbox-navigation {
                flex: 1;
                display: flex;
                align-items: center;
                position: relative;

                .nav-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);

                    &.nav-prev {
                        left: 20px;
                    }

                    &.nav-next {
                        right: 20px;
                    }
                }

                .lightbox-image-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;

                    .lightbox-image {
                        max-width: 100%;
                        border-radius: 8px;
                    }
                }
            }

            .lightbox-thumbnails {
                display: flex;
                gap: 8px;
                padding: 16px 24px;
                overflow-x: auto;
                border-top: 1px solid rgba(255, 255, 255, 0.1);

                .thumbnail-item {
                    flex-shrink: 0;
                    width: 60px;
                    height: 60px;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s ease;
                    border: 2px solid transparent;

                    &:hover {
                        opacity: 0.8;
                    }

                    &.active {
                        opacity: 1;
                        border-color: #1976d2;
                    }

                    .thumbnail-image {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
    }
}

// Dark mode support
.body--dark {
    .images-gallery-content {
        .empty-state {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        }
    }
}
</style>