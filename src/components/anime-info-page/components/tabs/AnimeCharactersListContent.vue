<template>
    <div class="characters-content">
        <div class="text-h6 q-mb-md">Characters</div>

        <!-- Characters Grid -->
        <div class="characters-grid">
            <q-card v-for="character in characters" :key="character.id" class="character-card cursor-pointer" flat
                @click="viewCharacter(character)">
                <div class="character-image-container">
                    <q-img :src="character.image_url" :alt="character.name" class="character-image" loading="lazy"
                        fit="cover">
                        <template v-slot:loading>
                            <div class="character-loading">
                                <q-spinner color="primary" size="3em" />
                            </div>
                        </template>
                        <template v-slot:error>
                            <div class="character-error">
                                <q-icon name="person" size="40px" color="grey-5" />
                            </div>
                        </template>
                    </q-img>

                    <!-- Role Badge -->
                    <div class="role-badge">
                        <q-badge :color="getRoleColor(character.role)" :label="character.role.toUpperCase()" rounded />
                    </div>

                    <!-- Hover Overlay -->
                    <div class="character-overlay">
                        <q-btn round color="white" text-color="primary" icon="visibility" size="md"
                            @click.stop="viewCharacter(character)" />
                    </div>
                </div>

                <q-card-section class="character-info">
                    <div class="character-name" :title="character.name">
                        {{ character.name }}
                    </div>
                    <div class="character-role text-grey-6">
                        <q-icon :name="getRoleIcon(character.role)" size="14px" class="q-mr-xs" />
                        {{ formatRole(character.role) }}
                    </div>
                </q-card-section>

                <!-- Favorite Button -->
                <div class="favorite-btn">
                    <q-btn round flat :icon="isFavorite(character.id) ? 'favorite' : 'favorite_border'"
                        :color="isFavorite(character.id) ? 'red' : 'grey-5'" size="sm"
                        @click.stop="toggleFavorite(character)" />
                </div>
            </q-card>
        </div>

        <!-- Filter Section -->
        <div v-if="characters && characters.length > 0" class="characters-filter q-mb-md">
            <q-btn-toggle v-model="roleFilter" toggle-color="primary" :options="roleOptions" flat
                @input="filterCharacters" />
        </div>

        <!-- Empty State -->
        <q-card v-if="!characters || characters.length === 0" flat bordered class="empty-state">
            <q-card-section class="text-center q-pa-xl">
                <q-icon name="people" size="60px" color="grey-5" />
                <div class="q-mt-md text-h6 text-grey-6">No Characters Available</div>
                <div class="text-grey-5">Character information will appear here once available</div>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// Props
const { characters } = defineProps({
    characters: {
        type: Array,
        default: () => []
    }
})

// Emits
const emit = defineEmits([
    'view-character',
    'favorite-changed',
    'filter-changed'
])

// State
const roleFilter = ref('all')
const favoriteCharacters = ref([])
const roleOptions = [
    { label: 'All', value: 'all' },
    { label: 'Main', value: 'main' },
    { label: 'Supporting', value: 'supporting' }
]

// Computed
// const filteredCharacters = computed(() => {
//     if (roleFilter.value === 'all') {
//         return props.characters
//     }
//     return props.characters.filter(char => char.role === roleFilter.value)
// })

// Methods
function viewCharacter(character) {
    emit('view-character', character)
}

function toggleFavorite(character) {
    const index = favoriteCharacters.value.findIndex(id => id === character.id)
    if (index > -1) {
        favoriteCharacters.value.splice(index, 1)
    } else {
        favoriteCharacters.value.push(character.id)
    }
    emit('favorite-changed', character, isFavorite(character.id))
}

function isFavorite(characterId) {
    return favoriteCharacters.value.includes(characterId)
}

function getRoleColor(role) {
    const colors = {
        'main': 'primary',
        'supporting': 'secondary',
        'minor': 'grey-6'
    }
    return colors[role] || 'grey-6'
}

function getRoleIcon(role) {
    const icons = {
        'main': 'star',
        'supporting': 'stars',
        'minor': 'person'
    }
    return icons[role] || 'person'
}

function formatRole(role) {
    return role.charAt(0).toUpperCase() + role.slice(1) + ' Character'
}

function filterCharacters() {
    nextTick(() => {
        emit('filter-changed', roleFilter.value)
    })
}
</script>



<style lang="scss" scoped>
.characters-content {
    .characters-filter {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
    }

    .characters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;

        @media (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
        }

        @media (max-width: 480px) {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
    }

    .character-card {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        background: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);

            .character-overlay {
                opacity: 1;
            }

            .character-image {
                transform: scale(1.1);
            }

            .favorite-btn {
                opacity: 1;
            }
        }

        .character-image-container {
            position: relative;
            height: 260px;
            overflow: hidden;

            @media (max-width: 480px) {
                height: 200px;
            }

            .character-image {
                width: 100%;
                height: 100%;
                transition: transform 0.3s ease;
            }

            .character-loading,
            .character-error {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }

            .role-badge {
                position: absolute;
                top: 12px;
                left: 12px;
                z-index: 2;

                .q-badge {
                    font-weight: 600;
                    font-size: 10px;
                    padding: 4px 8px;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
            }

            .character-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg,
                        rgba(25, 118, 210, 0.8) 0%,
                        rgba(156, 39, 176, 0.8) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(2px);
            }
        }

        .character-info {
            padding: 16px;
            background: white;

            .character-name {
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.3;

                @media (max-width: 480px) {
                    font-size: 14px;
                }
            }

            .character-role {
                font-size: 12px;
                display: flex;
                align-items: center;
                font-weight: 500;
            }
        }

        .favorite-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 2;

            .q-btn {
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.2);
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
    .characters-content {
        .character-card {
            background: #2d3748;

            .character-info {
                background: #2d3748;

                .character-name {
                    color: #f7fafc;
                }
            }

            .role-badge .q-badge,
            .favorite-btn .q-btn {
                background: rgba(45, 55, 72, 0.9);
                border-color: rgba(255, 255, 255, 0.1);
            }
        }

        .empty-state {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        }
    }
}

// Role-specific card styling
.character-card {
    &.main-character {
        border: 2px solid #1976d2;
    }

    &.supporting-character {
        border: 2px solid #7b1fa2;
    }
}
</style>