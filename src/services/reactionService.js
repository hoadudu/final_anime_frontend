import { api } from 'boot/axios'

/**
 * Post Reactions Service
 * 
 * Handles API calls for managing user reactions to anime posts.
 * Supports three reaction types: boring, awesome, excellent.
 */

/**
 * Get reactions for a specific post
 * @param {number} postId - The ID of the anime post
 * @returns {Promise<Object>} Response containing reaction counts and user's current reaction
 */
export async function getPostReactions(postId) {
    const response = await api.get(`/posts/${postId}/reactions`)
    return response.data
}

/**
 * Add or change a reaction to a post
 * @param {number} postId - The ID of the anime post
 * @param {string} reaction - The reaction type: 'boring', 'awesome', or 'excellent'
 * @returns {Promise<Object>} Response containing updated reaction data
 */
export async function addReaction(postId, reaction) {
    const response = await api.post(`/posts/${postId}/react`, {
        reaction: reaction
    })
    return response.data
}

/**
 * Remove user's reaction from a post
 * @param {number} postId - The ID of the anime post
 * @returns {Promise<Object>} Response containing updated reaction data
 */
export async function removeReaction(postId) {
    const response = await api.delete(`/posts/${postId}/react`)
    return response.data
}

/**
 * Reaction types configuration
 */
export const REACTION_TYPES = {
    BORING: 'boring',
    AWESOME: 'awesome',
    EXCELLENT: 'excellent'
}

/**
 * Reaction display configuration with emojis and labels
 */
export const REACTION_CONFIG = {
    [REACTION_TYPES.BORING]: {
        emoji: '😫',
        labelKey: 'reactions.boring',
        defaultLabel: 'Nhàm Chán'
    },
    [REACTION_TYPES.AWESOME]: {
        emoji: '😃',
        labelKey: 'reactions.awesome',
        defaultLabel: 'Tuyệt Vời'
    },
    [REACTION_TYPES.EXCELLENT]: {
        emoji: '😍',
        labelKey: 'reactions.excellent',
        defaultLabel: 'Xuất Sắc'
    }
}