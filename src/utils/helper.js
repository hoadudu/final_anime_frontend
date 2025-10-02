export function linkPost(slug, id) {
  return `/thong-tin/${slug}-${id}`;
}
export function linkWatch(slug, animeId, number, id) {
  return `/xem/${slug}-${animeId}/ep-${number}-${id}`;
}
