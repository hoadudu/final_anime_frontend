<template>
  <q-card flat bordered class="episode-card">
    <!-- Team Tabs -->
    <q-card-section v-if="hasMultipleTeams" class="team-tabs-section">
      <q-tabs
        v-model="selectedTeamIndex"
        dense
        class="team-tabs"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab
          v-for="(team, index) in teams"
          :key="`team-${team.team_id}-${index}`"
          :name="index"
          class="team-tab"
        >
          <div class="tab-content">
            <span class="tab-name">{{ team.team_name || `Team ${team.team_id}` }}</span>
            <span
              v-if="teamEpisodeCounts[index] > 0 && index !== selectedTeamIndex"
              class="tab-count"
            >
              {{ teamEpisodeCounts[index] }}
            </span>
          </div>
        </q-tab>
      </q-tabs>
    </q-card-section>

    <q-separator v-if="hasMultipleTeams" />

    <q-card-section class="episode-header">
      <div class="header-left">
        <q-btn
          flat
          dense
          round
          icon="menu"
          size="sm"
          class="header-btn"
          @click="hasMultipleGroups ? openGroupSelect() : null"
          :disable="!hasMultipleGroups"
        >
          <q-tooltip>{{
            hasMultipleGroups ? $t('watch.selectEpisodeGroup') : $t('watch.episodeList')
          }}</q-tooltip>
        </q-btn>

        <q-select
          v-if="hasMultipleGroups"
          ref="groupSelectRef"
          dense
          outlined
          v-model="selectedGroupIndex"
          :options="groupOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          class="group-select"
        />
      </div>
      <q-input
        dense
        outlined
        v-model="search"
        :placeholder="$t('watch.searchEpisode')"
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
    </q-card-section>
    <q-separator />

    <!-- Group Info Section -->
    <q-card-section v-if="selectedGroup.name" class="group-info-section">
      <div class="group-info">
        <q-icon name="folder" size="20px" color="primary" class="q-mr-sm" />
        <span class="group-name">{{ selectedGroup.name }}</span>
        <!-- <span v-if="selectedGroup.range_start && selectedGroup.range_end" class="group-range">
          ({{ selectedGroup.range_start }} - {{ selectedGroup.range_end }})
        </span> -->
      </div>
    </q-card-section>

    <q-separator v-if="selectedGroup.name" />

    <q-card-section class="episode-grid-section">
      <div v-if="filteredEpisodes.length > 0" class="episode-grid">
        <div
          v-for="ep in filteredEpisodes"
          :key="ep.id"
          class="episode-item"
          :class="getEpisodeClass(ep)"
          @click="goTo(ep)"
        >
          <span class="episode-number">{{ ep.number || ep.sort_number || ep.title || '?' }}</span>
        </div>
      </div>
      <div v-else class="no-episodes">
        <q-icon name="movie" size="40px" color="grey-6" />
        <div class="text-grey-6 q-mt-sm">
          {{ selectedGroup.name ? `No episodes in ${selectedGroup.name}` : $t('watch.noEpisodes') }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
// import { linkWatch } from 'src/utils/helper'

const props = defineProps({
  // New structure: { teams: [{ team_id, groups: [{ name, range_start, range_end, episodes: [...] }] }] }
  episodes: { type: Object, required: true },
  activeEpisodeId: { type: [String, Number], default: null },
  slug: { type: String, required: true },
  lastWatchedId: { type: [String, Number], default: null },
  // Array of episode IDs that user has clicked/visited before (for "watched" state - tím nhạt)
  watchedEpisodeIds: { type: Array, default: () => [] },
})

const router = useRouter()
const search = ref('')
const groupSelectRef = ref(null) // Reference to q-select component

// Process teams data
const teams = computed(() => {
  if (props.episodes && Array.isArray(props.episodes.teams)) {
    return props.episodes.teams
  }
  return []
})

const selectedTeamIndex = ref(0)
const selectedTeam = computed(
  () => teams.value[selectedTeamIndex.value] || { team_id: null, groups: [] },
)

const groups = computed(() => selectedTeam.value.groups || [])

const hasMultipleTeams = computed(() => teams.value.length > 1)
const hasMultipleGroups = computed(() => groups.value.length > 1)

// Calculate total episodes for each team
const teamEpisodeCounts = computed(() => {
  return teams.value.map((team) => {
    const groups = team.groups || []
    return groups.reduce((total, group) => {
      return total + (Array.isArray(group.episodes) ? group.episodes.length : 0)
    }, 0)
  })
})

const groupOptions = computed(() =>
  groups.value.map((g, idx) => ({ label: g.name || `Group ${idx + 1}`, value: idx })),
)

const selectedGroupIndex = ref(0)
const selectedGroup = computed(() => groups.value[selectedGroupIndex.value] || { episodes: [] })

watch(
  () => ({
    teams: teams.value,
    activeId: props.activeEpisodeId,
  }),
  ({ teams, activeId }) => {
    if (!Array.isArray(teams) || !activeId) return

    // Find which team contains the active episode
    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const team = teams[teamIndex]
      if (Array.isArray(team?.groups)) {
        const groupIndex = team.groups.findIndex(
          (group) =>
            Array.isArray(group?.episodes) && group.episodes.some((ep) => ep.id === activeId),
        )

        if (groupIndex !== -1) {
          if (teamIndex !== selectedTeamIndex.value) {
            selectedTeamIndex.value = teamIndex
          }
          if (groupIndex !== selectedGroupIndex.value) {
            selectedGroupIndex.value = groupIndex
          }
          return
        }
      }
    }
  },
  { immediate: true },
)

const filteredEpisodes = computed(() => {
  const list = Array.isArray(selectedGroup.value?.episodes) ? selectedGroup.value.episodes : []
  const q = search.value.trim().toLowerCase()

  // console.log('Search:', q)
  // console.log('Episodes:', list)
  if (!q) return list
  return list.filter((e) =>
    String(e.title || e.number)
      .toLowerCase()
      .includes(q),
  )
})

function goTo(ep) {
  router.push(ep.link)
}

function openGroupSelect() {
  // Open the group select dropdown
  if (groupSelectRef.value) {
    groupSelectRef.value.showPopup()
  }
}

function getEpisodeClass(ep) {
  // Active episode - currently watching (tím đậm)
  if (ep.id === props.activeEpisodeId) return 'episode-active'

  // Last watched episode - tập đã xem trước đó (cam)
  if (ep.id === props.lastWatchedId) return 'episode-last-watched'

  // Special episode (ngoại truyện) - if API provides episode_type or is_special
  if (ep.episode_type === 'special' || ep.is_special) return 'episode-special'

  // All watched episodes - tất cả tập đã click vào (tím nhạt)
  // Logic giống "visited links" - chỉ những tập thực sự đã click mới được đánh dấu
  if (props.watchedEpisodeIds.includes(ep.id)) {
    return 'episode-watched'
  }

  // Default - not watched yet
  return 'episode-default'
}
</script>

<style scoped>
.episode-card {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  color: #f1f5f9;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(139, 92, 246, 0.1);
}

.episode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.header-btn {
  color: #94a3b8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 8px;
}

.header-btn:hover {
  color: #e2e8f0;
  background: rgba(139, 92, 246, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

.group-select {
  min-width: 140px;
  max-width: 200px;
}

.search-input {
  max-width: 240px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus-within {
  transform: translateY(-1px);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
}

.episode-card .q-input :deep(.q-field__native),
.episode-card .q-input :deep(.q-field__control),
.episode-card .q-select :deep(.q-field__native),
.episode-card .q-select :deep(.q-field__control) {
  color: #e2e8f0;
  font-size: 0.875rem;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.episode-card .q-input :deep(.q-field__control):focus-within,
.episode-card .q-select :deep(.q-field__control):focus-within {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
}

/* Team Tabs */
.team-tabs-section {
  padding: 16px 24px 0 24px;
}

.team-tabs {
  background: transparent;
}

.team-tabs :deep(.q-tabs__content) {
  border-bottom: 2px solid rgba(139, 92, 246, 0.2);
  margin-bottom: 16px;
}

.team-tabs :deep(.q-tabs__track) {
  background: transparent;
}

.team-tab {
  min-width: 90px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: none;
  color: #94a3b8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 12px 16px;
  margin-bottom: -2px;
}

.team-tab:hover {
  color: #e2e8f0;
  background: rgba(139, 92, 246, 0.08);
}

.team-tab.q-tab--active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.team-tab.q-tab--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%);
  border-radius: 2px 2px 0 0;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

/* Tab Content */
.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.tab-name {
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-count {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  border: 1px solid rgba(139, 92, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.1);
}

.team-tab:hover .tab-count {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.2);
}

.team-tab.q-tab--active .tab-count {
  display: none;
}

/* Group Info Section */
.group-info-section {
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
  border-left: 4px solid #8b5cf6;
  border-radius: 0 12px 12px 0;
  margin: 0 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.group-info-section:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%);
  transform: translateX(2px);
}

.group-info {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #f1f5f9;
}

.group-name {
  color: #8b5cf6;
  font-weight: 600;
  font-size: 1rem;
}

.group-range {
  color: #94a3b8;
  font-weight: 400;
  margin-left: 12px;
  font-size: 0.875rem;
}

.episode-grid-section {
  padding: 24px;
}

.episode-grid-section::before {
  content: 'Episodes';
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #8b5cf6;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-episodes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}

.no-episodes .q-icon {
  color: #64748b;
  opacity: 0.6;
  margin-bottom: 16px;
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.episode-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.episode-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(139, 92, 246, 0.08);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
}

.episode-item:hover::before {
  opacity: 1;
}

.episode-number {
  user-select: none;
  position: relative;
  z-index: 1;
}

/* Default - chưa xem */
.episode-default {
  background: #374151;
  color: #d1d5db;
  border: 1px solid rgba(139, 92, 246, 0.15);
}

.episode-default:hover {
  background: #4b5563;
  color: #f3f4f6;
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.3);
  border-radius: 10px;
}

/* Active - đang xem */

.episode-active {
  background: #10b981;
  color: #ffffff;
  border: 1px solid #059669;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
}

.episode-active:hover:hover {
  background: #059669;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 28px rgba(16, 185, 129, 0.3);
  border-radius: 10px;
}

/* Last watched - tập đã xem trước đó (cam) */
.episode-last-watched {
  background: #7abba5bd;
  color: #ffffff;
  border: 1px solid #328c6e;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.25);
}

.episode-last-watched:hover {
  background: #d97706;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 28px rgba(245, 158, 11, 0.35);
  border-radius: 10px;
}

/* Watched - tất cả tập đã xem (xanh lá nhạt) */
.episode-watched {
  background: #5a5a6a;
  color: #ffffff;
  border: 2px solid #7f7595;
  box-shadow:
    0 6px 20px rgba(99, 102, 241, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.4);
}

.episode-watched:hover {
  background: #5855eb;
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 8px 28px rgba(99, 102, 241, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.5);
  border-radius: 10px;
}

/* .episode-watched {
  background: #10b981;
  color: #ffffff;
  border: 1px solid #059669;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
}

.episode-watched:hover {
  background: #059669;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 28px rgba(16, 185, 129, 0.3);
  border-radius: 10px;
} */

/* Special - ngoại truyện */
.episode-special {
  background: #ec4899;
  color: #ffffff;
  border: 1px solid #be185d;
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.2);
}

.episode-special:hover {
  background: #be185d;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 28px rgba(236, 72, 153, 0.3);
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 1200px) {
  .episode-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }

  .episode-item {
    font-size: 0.85rem;
  }
}

@media (max-width: 1023px) {
  .episode-header {
    padding: 16px 20px;
    gap: 12px;
  }

  .search-input {
    max-width: 200px;
  }

  .group-select {
    min-width: 120px;
    max-width: 160px;
  }

  .team-tabs-section {
    padding: 12px 20px 0 20px;
  }

  .group-info-section {
    padding: 14px 20px;
    margin: 0 20px;
  }

  .episode-grid-section {
    padding: 20px;
  }
}

@media (max-width: 767px) {
  .episode-header {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    gap: 12px;
  }

  .search-input {
    max-width: 100%;
  }

  .group-select {
    min-width: 140px;
    max-width: 180px;
  }

  .team-tabs-section {
    padding: 12px 16px 0 16px;
  }

  .team-tab {
    min-width: 80px;
    font-size: 0.8rem;
    padding: 10px 12px;
  }

  .group-info-section {
    padding: 12px 16px;
    margin: 0 16px;
  }

  .episode-grid-section {
    padding: 16px;
  }

  .episode-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }

  .episode-item {
    font-size: 0.85rem;
  }
}

@media (max-width: 479px) {
  .episode-header {
    padding: 12px;
    gap: 12px;
  }

  .header-left {
    gap: 8px;
  }

  .team-tabs-section {
    padding: 8px 12px 0 12px;
  }

  .team-tab {
    min-width: 70px;
    font-size: 0.75rem;
    padding: 8px 10px;
  }

  .group-info-section {
    padding: 10px 12px;
    margin: 0 12px;
  }

  .episode-grid-section {
    padding: 12px;
  }

  .episode-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
  }

  .episode-item {
    font-size: 0.8rem;
  }

  .group-info {
    font-size: 0.875rem;
  }

  .group-name {
    font-size: 0.95rem;
  }
}
</style>
