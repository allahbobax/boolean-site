/**
 * Генерирует URL для аватарки через ui-avatars.com
 */
export function generateAvatarUrl(username: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=256&bold=true`
}

export function getAvatarUrl(userAvatar: string | undefined | null): string {
  return userAvatar || '/default-avatar.jpg'
}
