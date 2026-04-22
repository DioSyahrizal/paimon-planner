import type { EnkaRawResponse } from './types'

const ENKA_BASE_URL = 'https://enka.network/api/uid'
const USER_AGENT = 'PaimonPlanner/1.0.0'

export class EnkaApiError extends Error {
  constructor(public readonly status: number) {
    super(`Enka API error: ${status}`)
    this.name = 'EnkaApiError'
  }
}

export async function fetchEnkaUser(uid: string): Promise<EnkaRawResponse> {
  const response = await fetch(`${ENKA_BASE_URL}/${uid}`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new EnkaApiError(response.status)
  }

  return response.json() as Promise<EnkaRawResponse>
}

export function getEnkaErrorMessage(error: unknown): string {
  if (error instanceof EnkaApiError) {
    switch (error.status) {
      case 400: return 'Invalid UID format.'
      case 404: return 'Player not found. Check your UID.'
      case 424: return 'Game is under maintenance. Try again later.'
      case 429: return 'Rate limited. Please wait before refreshing.'
      case 500:
      case 503: return 'Enka.Network is unavailable. Try again later.'
      default: return `Unexpected error (${error.status}).`
    }
  }
  return 'Network error. Check your connection.'
}
