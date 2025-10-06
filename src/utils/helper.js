export function linkPost(slug, id) {
  return `/thong-tin/${slug}-${id}`
}

/**
 * Generate watch page URL
 * @param {string} slug - Anime slug (without postId)
 * @param {number|string} number - Episode number
 * @param {number|string} episodeId - Episode ID
 * @param {number|string} postId - Post/Anime ID (required for episode list API)
 * @returns {string} Watch page URL with format: /xem/{slug}-{postId}/ep-{number}-{episodeId}
 */
export function linkWatch(slug, number, episodeId, postId) {
  // If slug already contains postId (format: slug-postId), use as is
  const fullSlug = postId && !slug.endsWith(`-${postId}`) ? `${slug}-${postId}` : slug
  return `/xem/${fullSlug}/ep-${number}-${episodeId}`
}

export function getEpisodeNumber(episode) {
  if (!episode) return null
  return episode.number || episode.sort_number || null
}

export function resolveWatchProgressEntry(progressMap, animeInfo) {
  if (!progressMap || !animeInfo) return null

  const slugKey = animeInfo.slug ? `slug-${animeInfo.slug}` : null
  const idKey = animeInfo.id ? `anime-${animeInfo.id}` : null

  return (slugKey && progressMap[slugKey]) || (idKey && progressMap[idKey]) || null
}
