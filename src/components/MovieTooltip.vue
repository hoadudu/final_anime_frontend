<template>
    <q-tooltip v-if="!$q.platform.is.mobile" class="bg-dark text-white" :offset="[10, 10]" max-width="300px">
        <div class="tooltip-content">
            <div class="text-weight-bold q-mb-xs">{{ movie.title }}</div>

            <div v-if="Object.keys(groupedTitles).length > 0" class="alternative-titles q-mb-sm">
                <div v-for="(titles, language) in groupedTitles" :key="language" class="language-group q-mb-xs">
                    <div class="language-label">{{ language }}:</div>
                    <div class="titles-list">
                        {{ titles.join(', ') }}
                    </div>
                </div>
            </div>

            <div v-if="movie.description" class="text-caption q-mb-sm">
                {{ truncateDescription(movie.description) }}
            </div>

            <div class="tooltip-meta">
                <div v-if="movie.aired" class="q-mb-xs">
                    <strong>{{ t('tooltip.releaseDate') }}:</strong> {{ movie.aired }}
                </div>

                <!-- <div v-if="movie.rank" class="q-mb-xs">
                    <strong>{{ t('tooltip.rating') }}:</strong> {{ movie.rank }}
                </div> -->

                <div v-if="movie.views" class="q-mb-xs">
                    <strong>{{ t('tooltip.views') }}:</strong> {{ movie.views }}
                </div>

                <div v-if="movie.genres && movie.genres.length" class="q-mb-xs">
                    <strong>{{ t('tooltip.genres') }}:</strong>
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
import { computed } from 'vue'
import { useQuasar } from 'quasar'
const { t } = useI18n()
const $q = useQuasar()

const props = defineProps({
    movie: {
        type: Object,
        required: true
    }
})

// Lấy tất cả các tên thay thế từ trường titles, phân loại theo ngôn ngữ
const groupedTitles = computed(() => {
    const result = {}

    if (props.movie.titles && Array.isArray(props.movie.titles) && props.movie.titles.length > 0) {
        // Lọc các tiêu đề khác với tiêu đề chính
        const filteredTitles = props.movie.titles.filter(item => item.title !== props.movie.title)

        // Nhóm các tiêu đề theo ngôn ngữ
        filteredTitles.forEach(item => {
            if (!result[item.language]) {
                result[item.language] = []
            }
            result[item.language].push(item.title)
        })
    }

    return result
})

function truncateDescription(desc, maxLength = 100) {
    if (!desc) return ''
    return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc
}
</script>

<style scoped>
.alternative-titles {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8rem;
}

.language-group {
    display: flex;
    flex-direction: column;
}

.language-label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin-right: 0.3rem;
}

.titles-list {
    font-style: italic;
    color: rgba(255, 255, 255, 0.7);
}

.tooltip-content {
    width: 100%;
}
</style>
