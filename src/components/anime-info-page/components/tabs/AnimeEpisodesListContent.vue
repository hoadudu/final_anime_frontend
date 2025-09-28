<template>
    <div class="episodes-content">
        <div class="text-h6 q-mb-md">Episodes</div>

        <!-- Episodes Grid -->
        <div class="episodes-grid">
            <q-card v-for="(episode, index) in episodeList" :key="episode.id" class="episode-card cursor-pointer" flat
                bordered @click="playEpisode(episode)">
                <q-card-section class="episode-card-content">
                    <!-- Episode Number Badge -->
                    <div class="episode-number">
                        <q-badge color="primary" :label="`EP ${index + 1}`" rounded />
                    </div>

                    <!-- Episode Info -->
                    <div class="episode-info">
                        <div class="episode-title">
                            {{ episode.title || `Episode ${index + 1}` }}
                        </div>
                        <div class="episode-date text-grey-6">
                            <q-icon name="schedule" size="14px" class="q-mr-xs" />
                            {{ formatDate(episode.airDate) }}
                        </div>
                    </div>

                    <!-- Sub/Dub Info -->
                    <div class="episode-options">
                        <div v-if="episode.subCount > 0" class="option-badge sub-badge">
                            <q-icon name="subtitles" size="14px" />
                            <span class="q-ml-xs">SUB</span>
                        </div>
                        <div v-if="episode.dubCount > 0" class="option-badge dub-badge">
                            <q-icon name="record_voice_over" size="14px" />
                            <span class="q-ml-xs">DUB</span>
                        </div>
                    </div>

                    <!-- Play Button -->
                    <div class="play-button">
                        <q-btn round color="primary" icon="play_arrow" size="md" @click.stop="playEpisode(episode)" />
                    </div>
                </q-card-section>

                <!-- Hover Effect Overlay -->
                <div class="episode-overlay">
                    <q-icon name="play_circle_filled" size="40px" color="white" />
                </div>
            </q-card>
        </div>

        <!-- Empty State -->
        <q-card v-if="!episodeList || episodeList.length === 0" flat bordered class="empty-state">
            <q-card-section class="text-center q-pa-xl">
                <q-icon name="movie" size="60px" color="grey-5" />
                <div class="q-mt-md text-h6 text-grey-6">No Episodes Available</div>
                <div class="text-grey-5">Episodes will appear here once they're released</div>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { computed } from 'vue'
// import { useRouter } from 'vue-router'

// Props
const props = defineProps({
    episodeList: {
        type: Array,
        default: () => []
    }
})

// Emits
const emit = defineEmits(['episode-play'])

// const router = useRouter()

// Computed properties
const episodeList = computed(() => props.episodeList || [])

// Methods
const playEpisode = (episode) => {
    emit('episode-play', episode)
    // Có thể chuyển hướng tới trang xem episode
    // router.push(`/watch/${episode.id}`)
}

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'

    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Unknown'

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    } catch (error) {
        console.log(error);
        return 'Unknown'
    }
}
</script>


<style lang="scss" scoped>
.episodes-content {
    .episodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 12px;
        }
    }

    .episode-card {
        position: relative;
        transition: all 0.3s ease;
        border-radius: 12px;
        overflow: hidden;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

            .episode-overlay {
                opacity: 1;
            }

            .play-button .q-btn {
                transform: scale(1.1);
            }
        }

        .episode-card-content {
            position: relative;
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            min-height: 80px;
        }

        .episode-number {
            flex-shrink: 0;

            .q-badge {
                font-weight: 600;
                font-size: 12px;
                padding: 6px 12px;
            }
        }

        .episode-info {
            flex: 1;
            min-width: 0;

            .episode-title {
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .episode-date {
                font-size: 12px;
                display: flex;
                align-items: center;
            }
        }

        .episode-options {
            display: flex;
            gap: 8px;
            flex-shrink: 0;

            .option-badge {
                display: flex;
                align-items: center;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;

                &.sub-badge {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                &.dub-badge {
                    background: #f3e5f5;
                    color: #7b1fa2;
                }
            }
        }

        .play-button {
            flex-shrink: 0;

            .q-btn {
                transition: transform 0.2s ease;
            }
        }

        .episode-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(25, 118, 210, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    }

    .empty-state {
        margin-top: 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }
}

// Dark mode support
.body--dark {
    .episodes-content {
        .episode-card {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);

            .episode-title {
                color: #f7fafc;
            }

            .episode-options {
                .sub-badge {
                    background: rgba(29, 118, 210, 0.2);
                    color: #64b5f6;
                }

                .dub-badge {
                    background: rgba(123, 31, 162, 0.2);
                    color: #ba68c8;
                }
            }
        }

        .empty-state {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        }
    }
}
</style>