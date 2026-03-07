// This file centralizes all environment variables in one place.
// Instead of calling import.meta.env.VITE_API_KEY everywhere,
// you just import from this file — cleaner and easier to manage.

export const config = {
  apiKey: import.meta.env.VITE_API_KEY as string,
  baseUrl: import.meta.env.VITE_API_BASE_URL as string,
  
}