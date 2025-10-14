<template>
  <div class="profile-stats-container">
    <q-card flat bordered class="stats-card">
      <q-card-section class="stats-content">
        <div class="profile-stats">
          <div class="stat-card">
            <div class="stat-value">{{ stats?.total_anime || 0 }}</div>
            <div class="stat-label">{{ t('profile.totalAnime') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats?.completed || 0 }}</div>
            <div class="stat-label">{{ t('profile.completed') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats?.watching || 0 }}</div>
            <div class="stat-label">{{ t('profile.watching') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ stats?.average_score?.toFixed(1) || 'N/A' }}
            </div>
            <div class="stat-label">{{ t('profile.avgScore') }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

// ========== PROPS ==========
defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
})

// ========== COMPOSABLES ==========
const { t } = useI18n()
</script>

<style lang="scss" scoped>
// ========== CONTAINER ==========
.profile-stats-container {
  margin-bottom: 24px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.stats-content {
  padding: 16px;
}

// ========== STATS GRID ==========
.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  .stat-card {
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(0, 212, 255, 0.2);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #00d4ff;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
  }

  // ========== RESPONSIVE DESIGN ==========
  @media (max-width: 1024px) {
    gap: 12px;

    .stat-card {
      padding: 14px 10px;

      .stat-value {
        font-size: 1.3rem;
      }

      .stat-label {
        font-size: 0.7rem;
      }
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .stat-card {
      padding: 16px 12px;

      .stat-value {
        font-size: 1.4rem;
      }

      .stat-label {
        font-size: 0.75rem;
      }
    }
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .stat-card {
      padding: 12px 8px;

      .stat-value {
        font-size: 1.2rem;
      }

      .stat-label {
        font-size: 0.65rem;
      }
    }
  }
}
</style>
