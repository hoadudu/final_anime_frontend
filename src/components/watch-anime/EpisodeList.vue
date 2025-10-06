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
        <span v-if="selectedGroup.range_start && selectedGroup.range_end" class="group-range">
          ({{ selectedGroup.range_start }} - {{ selectedGroup.range_end }})
        </span>
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
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 60%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e8e8e8;
}

.episode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.header-btn {
  color: #b0b0b0;
  transition: transform 0.2s ease;
}

.header-btn:hover {
  color: #e0e0e0;
  transform: scale(1.1);
}

.header-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #e8e8e8;
  white-space: nowrap;
}

.group-select {
  min-width: 120px;
  max-width: 180px;
}

.search-input {
  max-width: 180px;
}

.episode-card .q-input :deep(.q-field__native),
.episode-card .q-input :deep(.q-field__control),
.episode-card .q-select :deep(.q-field__native),
.episode-card .q-select :deep(.q-field__control) {
  color: #e0e0e0;
  font-size: 0.85rem;
}

/* Team Tabs */
.team-tabs-section {
  padding: 8px 16px 0 16px;
}

.team-tabs {
  background: transparent;
}

.team-tab {
  min-width: 80px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: none;
  color: #b0b0b0;
  transition: all 0.2s ease;
}

.team-tab:hover {
  color: #e0e0e0;
  background: rgba(255, 255, 255, 0.05);
}

.team-tab.q-tab--active {
  color: #a855f7;
}

.team-tab.q-tab--active .q-tab__label {
  font-weight: 600;
}

/* Tab Content */
.tab-content {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.tab-name {
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-count {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  border: 1px solid rgba(168, 85, 247, 0.3);
  transition: all 0.2s ease;
}

.team-tab:hover .tab-count {
  background: rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.5);
}

.team-tab.q-tab--active .tab-count {
  display: none;
}

/* Group Info Section */
.group-info-section {
  padding: 12px 16px;
  background: rgba(168, 85, 247, 0.05);
  border-left: 3px solid #a855f7;
}

.group-info {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #e8e8e8;
}

.group-name {
  color: #a855f7;
  font-weight: 600;
}

.group-range {
  color: #b0b0b0;
  font-weight: 400;
  margin-left: 8px;
}

.episode-grid-section {
  padding: 16px;
}

.no-episodes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.episode-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.episode-number {
  user-select: none;
}

/* Default - chưa xem */
.episode-default {
  background: rgba(60, 60, 60, 0.8);
  color: #b0b0b0;
}

.episode-default:hover {
  background: rgba(70, 70, 70, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Active - đang xem */
.episode-active {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

.episode-active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
}

/* Last watched - tập đã xem trước đó (cam) */
.episode-last-watched {
  background: linear-gradient(135deg, #d4a574 0%, #b8864f 100%);
  color: #ffffff;
}

.episode-last-watched:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

/* Watched - tất cả tập đã xem (tím nhạt) */
.episode-watched {
  /* background: linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%); */
  background: linear-gradient(135deg, #c8d3c0 0%, #a8b0a0 100%);
  color: #ffffff;
}

.episode-watched:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(216, 180, 254, 0.4);
}

/* Special - ngoại truyện */
.episode-special {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.episode-special:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Responsive */
@media (max-width: 1023px) {
  .episode-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .header-left {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: 150px;
  }

  .team-tabs-section {
    padding: 6px 12px 0 12px;
  }

  .team-tab {
    min-width: 70px;
    font-size: 0.8rem;
  }

  .tab-count {
    font-size: 0.65rem;
    padding: 1px 4px;
    min-width: 16px;
  }
}

@media (max-width: 767px) {
  .episode-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .episode-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .team-tabs-section {
    padding: 4px 8px 0 8px;
  }

  .team-tab {
    min-width: 60px;
    font-size: 0.75rem;
    padding: 8px 12px;
  }

  .tab-count {
    font-size: 0.6rem;
    padding: 1px 3px;
    min-width: 14px;
  }

  .group-info-section {
    padding: 10px 12px;
  }
}

@media (max-width: 479px) {
  .episode-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .team-tabs-section {
    padding: 2px 4px 0 4px;
  }

  .team-tab {
    min-width: 50px;
    font-size: 0.7rem;
    padding: 6px 8px;
  }

  .tab-count {
    font-size: 0.55rem;
    padding: 0px 2px;
    min-width: 12px;
  }

  .group-info {
    font-size: 0.8rem;
  }
}
</style>
