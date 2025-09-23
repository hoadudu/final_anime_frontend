<template>
    <q-tooltip class="bg-dark text-white" :offset="[10, 10]" max-width="300px">
        <div class="tooltip-content">
            <div class="text-weight-bold q-mb-xs">{{ movie.title }}</div>

            <div v-if="movie.description" class="text-caption q-mb-sm">
                {{ truncateDescription(movie.description) }}
            </div>

            <div class="tooltip-meta">
                <div v-if="movie.aired" class="q-mb-xs">
                    <strong>{{ t('releaseDate') }}:</strong> {{ movie.aired }}
                </div>

                <div v-if="movie.rank" class="q-mb-xs">
                    <strong>{{ t('rating') }}:</strong> {{ movie.rank }}
                </div>

                <div v-if="movie.genres && movie.genres.length" class="q-mb-xs">
                    <strong>{{ t('genres') }}:</strong>
                    <div class="row q-gutter-xs q-mt-xs">
                        <q-chip v-for="genre in movie.genres.slice(0, 3)" :key="genre" dense color="primary"
                            text-color="white" size="sm">
                            {{ genre }}
                        </q-chip>
                        <q-chip v-if="movie.genres.length > 3" dense outline color="grey" text-color="grey" size="sm">
                            +{{ movie.genres.length - 3 }}
                        </q-chip>
                    </div>
                </div>
            </div>
        </div>
    </q-tooltip>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

defineProps({
    movie: {
        type: Object,
        required: true
    }
})


function truncateDescription(desc, maxLength = 100) {
    if (!desc) return ''
    return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc
}
</script>
