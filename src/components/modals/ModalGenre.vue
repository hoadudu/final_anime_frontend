<template>
    <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card class="modal-card">
            <!-- Header -->
            <q-card-section class="modal-header row items-center q-pb-none">
                <div class="text-h5 text-weight-bold">{{ t('genres.selectGenres') }}</div>
                <q-space />
                <q-btn flat round dense icon="close" @click="closeModal" />
            </q-card-section>

            <!-- Search bar -->
            <q-card-section class="q-pt-none">
                <q-input v-model="searchQuery" outlined :placeholder="t('genres.searchGenres')"
                    prepend-inner-icon="search" clearable class="q-mb-md" />
            </q-card-section>

            <!-- Genre tabs -->
            <q-card-section class="q-pt-none">
                <q-tabs v-model="activeTab" dense class="text-primary" active-color="primary" indicator-color="primary"
                    align="left">
                    <q-tab name="all" :label="t('common.all')" />
                    <q-tab name="genres" :label="t('genres.genres')" />
                    <q-tab name="explicit" :label="t('genres.explicit')" />
                    <q-tab name="themes" :label="t('genres.themes')" />
                    <q-tab name="demographics" :label="t('genres.demographics')" />
                </q-tabs>
            </q-card-section>

            <!-- Loading state -->
            <div v-if="genreStore.isLoading" class="flex flex-center q-pa-xl">
                <q-spinner-dots color="primary" size="40px" />
                <div class="q-mt-md">{{ t('genres.loadingGenres') }}</div>
            </div>

            <!-- Error state -->
            <div v-if="genreStore.error" class="flex flex-center q-pa-xl">
                <q-banner class="bg-negative text-white">
                    <q-icon name="error" size="md" class="q-mr-md" />
                    {{ genreStore.error }}
                    <template v-slot:action>
                        <q-btn flat :label="t('common.retry')" @click="genreStore.fetchGenres" />
                    </template>
                </q-banner>
            </div>

            <!-- Genre grid -->
            <q-card-section class="q-pt-none" style="max-height: 60vh; overflow-y: auto;">
                <div class="genre-grid">
                    <q-card v-for="genre in filteredGenres" :key="genre.id" flat bordered clickable :class="[
                        'genre-card',
                        selectedGenres.includes(genre.id) ? 'genre-selected' : 'genre-unselected'
                    ]" @click="toggleGenre(genre)">
                        <q-card-section class="q-pa-md text-center">
                            <div class="genre-name text-weight-medium">{{ genre.name }}</div>
                            <div class="genre-count text-caption text-grey-6">
                                {{ genre.posts_count }} {{ t('genres.anime') }}
                            </div>
                            <q-icon v-if="selectedGenres.includes(genre.id)" name="check_circle" color="primary"
                                size="sm" class="genre-check-icon" />
                        </q-card-section>
                    </q-card>
                </div>
            </q-card-section>

            <!-- Selected genres summary -->
            <q-card-section v-if="selectedGenres.length > 0" class="q-pt-none">
                <div class="text-subtitle2 q-mb-sm">{{ t('genres.selectedGenres') }} ({{ selectedGenres.length }}):
                </div>
                <div class="row q-gutter-xs">
                    <q-chip v-for="genreId in selectedGenres" :key="genreId" removable color="primary"
                        text-color="white" @remove="removeGenre(genreId)">
                        {{ getGenreName(genreId) }}
                    </q-chip>
                </div>
            </q-card-section>

            <!-- Footer actions -->
            <q-card-actions align="right" class="q-pa-md">
                <q-btn flat :label="t('common.clearAll')" @click="clearAllGenres"
                    :disable="selectedGenres.length === 0" />
                <q-btn flat :label="t('common.cancel')" @click="closeModal" />
                <q-btn color="primary" :label="t('common.apply')" @click="applyGenres"
                    :disable="selectedGenres.length === 0" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGenreStore } from 'src/stores/site-genre'

const { t } = useI18n()

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['update:modelValue', 'apply'])

// Store
const genreStore = useGenreStore()

// State
const searchQuery = ref('')
const activeTab = ref('all')
const selectedGenres = ref([])

// Computed
const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const filteredGenres = computed(() => {
    let genres = genreStore.genres

    // Filter by tab
    if (activeTab.value !== 'all') {
        if (activeTab.value === 'explicit') {
            genres = genres.filter(g => g.category === 'explicit_genres')
        } else {
            genres = genres.filter(g => g.category === activeTab.value)
        }
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        genres = genres.filter(g =>
            g.name.toLowerCase().includes(query)
        )
    }

    return genres.sort((a, b) => b.posts_count - a.posts_count)
})

// Methods
const closeModal = () => {
    isOpen.value = false
}

const toggleGenre = (genre) => {
    const index = selectedGenres.value.indexOf(genre.id)
    if (index > -1) {
        selectedGenres.value.splice(index, 1)
    } else {
        selectedGenres.value.push(genre.id)
    }
}

const removeGenre = (genreId) => {
    const index = selectedGenres.value.indexOf(genreId)
    if (index > -1) {
        selectedGenres.value.splice(index, 1)
    }
}

const getGenreName = (genreId) => {
    const genre = genreStore.genres.find(g => g.id === genreId)
    return genre ? genre.name : ''
}

const clearAllGenres = () => {
    selectedGenres.value = []
}

const applyGenres = () => {
    const selectedGenreObjects = genreStore.genres.filter(g =>
        selectedGenres.value.includes(g.id)
    )

    emit('apply', {
        ids: selectedGenres.value,
        genres: selectedGenreObjects
    })

    closeModal()
}

// Watch for modal open/close
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        // Reset state when opening
        searchQuery.value = ''
        activeTab.value = 'all'
        // Load genres if not already loaded
        if (genreStore.genres.length === 0) {
            genreStore.fetchGenres()
        }
    }
})

onMounted(() => {
    // Load genres on component mount
    if (genreStore.genres.length === 0) {
        genreStore.fetchGenres()
    }
})
</script>

<style lang="scss" scoped>
.modal-card {
    min-height: 90vh;
}

.modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .q-btn {
        color: white;
    }
}

.genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.genre-card {
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
}

.genre-unselected {
    border: 1px solid rgba(0, 0, 0, 0.12);

    &:hover {
        border-color: var(--q-primary);
    }
}

.genre-selected {
    border: 2px solid var(--q-primary);
    background-color: rgba(25, 118, 210, 0.04);
}

.genre-name {
    font-size: 1rem;
    margin-bottom: 4px;
}

.genre-count {
    font-size: 0.75rem;
}

.genre-check-icon {
    position: absolute;
    top: 8px;
    right: 8px;
}

// Responsive
@media (max-width: 768px) {
    .genre-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
    }

    .modal-card {
        min-height: 100vh;
    }
}

@media (max-width: 480px) {
    .genre-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;
    }
}
</style>
