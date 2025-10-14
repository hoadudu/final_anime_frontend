import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import {
  getPostReactions,
  addReaction,
  removeReaction,
  REACTION_TYPES,
  REACTION_CONFIG
} from 'src/services/reactionService'
import { useAuthStore } from 'src/stores/auth'
import { queryKeys } from 'src/utils/queryKeys'
import { USER_QUERY_CONFIG } from 'src/utils/queryConfig'

/**
 * Composable for managing post reactions
 * @param {number|Ref<number>} postId - The ID of the anime post
 * @returns {Object} Reaction management functions and state
 */
export function usePostReactions(postId) {
  const $q = useQuasar()
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const authStore = useAuthStore()

  // Helper function to get the actual postId value
  const getPostId = () => {
    return typeof postId === 'function' ? postId() : (postId.value || postId)
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  // Query for getting post reactions
  const {
    data: reactionData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.user.reactions(postId),
    queryFn: () => getPostReactions(getPostId()),
    ...USER_QUERY_CONFIG,
    enabled: computed(() => !!getPostId()),
  })

  // Current user's reaction
  const myReaction = computed(() => reactionData.value?.my_reaction || null)

  // Reaction counts
  const reactions = computed(() => reactionData.value?.reactions || {
    [REACTION_TYPES.BORING]: 0,
    [REACTION_TYPES.AWESOME]: 0,
    [REACTION_TYPES.EXCELLENT]: 0
  })

  // Total reactions count
  const totalReactions = computed(() => reactionData.value?.total_reactions || 0)

  // Check if user has reacted with specific type
  const hasReacted = (reactionType) => {
    return myReaction.value === reactionType
  }

  // Mutation for adding/changing reaction
  const addReactionMutation = useMutation({
    mutationFn: ({ postId, reaction }) => addReaction(postId, reaction),
    onMutate: async ({ postId, reaction }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.reactions(postId) })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKeys.user.reactions(postId))

      // Optimistically update to the new value
      if (previousData) {
        const oldReaction = previousData.my_reaction
        const newData = { ...previousData }

        // Update reactions count
        newData.reactions = { ...previousData.reactions }

        // If user had a previous reaction, decrease its count
        if (oldReaction) {
          newData.reactions[oldReaction] = Math.max(0, (newData.reactions[oldReaction] || 0) - 1)
          newData.total_reactions = Math.max(0, previousData.total_reactions - 1)
        }

        // Increase new reaction count
        newData.reactions[reaction] = (newData.reactions[reaction] || 0) + 1
        newData.total_reactions = (newData.total_reactions || 0) + 1
        newData.my_reaction = reaction

        queryClient.setQueryData(queryKeys.user.reactions(postId), newData)
      }

      // Return context with the previous value
      return { previousData }
    },
    onSuccess: (data, { postId }) => {
      // Update with real server data
      queryClient.setQueryData(queryKeys.user.reactions(postId), data)

      // Show success message
      const reactionLabel = REACTION_CONFIG[data.my_reaction]?.defaultLabel || data.my_reaction
      $q.notify({
        type: 'positive',
        message: t('reactions.reactionAdded', { reaction: reactionLabel }),
        position: 'top-right',
        timeout: 1500
      })
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.user.reactions(postId), context.previousData)
      }

      console.error('Error adding reaction:', error)
      $q.notify({
        type: 'negative',
        message: t('reactions.errorAddingReaction') || 'Lỗi khi thêm phản ứng',
        position: 'top-right'
      })
    },
    onSettled: (data, error, { postId }) => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.user.reactions(postId) })
    }
  })

  // Mutation for removing reaction
  const removeReactionMutation = useMutation({
    mutationFn: (postId) => removeReaction(postId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.reactions(postId) })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKeys.user.reactions(postId))

      // Optimistically update to the new value
      if (previousData && previousData.my_reaction) {
        const oldReaction = previousData.my_reaction
        const newData = { ...previousData }

        // Update reactions count
        newData.reactions = { ...previousData.reactions }

        // Decrease the reaction count
        newData.reactions[oldReaction] = Math.max(0, (newData.reactions[oldReaction] || 0) - 1)
        newData.total_reactions = Math.max(0, previousData.total_reactions - 1)
        newData.my_reaction = null

        queryClient.setQueryData(queryKeys.user.reactions(postId), newData)
      }


      // Return context with the previous value
      return { previousData }
    },
    onSuccess: (data, postId) => {
      // Update with real server data
      queryClient.setQueryData(queryKeys.user.reactions(postId), data)

      // Show success message
      $q.notify({
        type: 'info',
        message: t('reactions.reactionRemoved') || 'Đã xóa phản ứng',
        position: 'top-right',
        timeout: 1500
      })
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.user.reactions(postId), context.previousData)
      }

      console.error('Error removing reaction:', error)
      $q.notify({
        type: 'negative',
        message: t('reactions.errorRemovingReaction') || 'Lỗi khi xóa phản ứng',
        position: 'top-right'
      })
    },
    onSettled: (data, error, postId) => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.user.reactions(postId) })
    }
  })

  // Function to handle reaction click
  const handleReaction = async (reactionType) => {
    if (!isAuthenticated.value) {
      $q.notify({
        type: 'warning',
        message: t('reactions.loginRequired') || 'Vui lòng đăng nhập để phản ứng',
        position: 'top-right'
      })
      return
    }

    const currentPostId = getPostId()

    // If user already has this reaction, remove it
    if (myReaction.value === reactionType) {
      removeReactionMutation.mutate(currentPostId)
    } else {
      // Add or change reaction
      addReactionMutation.mutate({
        postId: currentPostId,
        reaction: reactionType
      })
    }
  }

  // Get reaction percentage for display
  const getReactionPercentage = (reactionType) => {
    if (totalReactions.value === 0) return 0
    return Math.round((reactions.value[reactionType] / totalReactions.value) * 100)
  }

  // Check if any mutation is loading
  const isMutating = computed(() =>
    addReactionMutation.isPending.value || removeReactionMutation.isPending.value
  )

  return {
    // Data
    reactions,
    myReaction,
    totalReactions,
    isLoading,
    error,

    // Functions
    handleReaction,
    hasReacted,
    getReactionPercentage,
    refetch,

    // State
    isAuthenticated,
    isMutating,

    // Constants
    REACTION_TYPES,
    REACTION_CONFIG
  }
}
