/**
 * Simple routing utility for navigation between pages
 * This provides a React-agnostic way to handle page transitions
 */

export type Page =
  | 'login'
  | 'create-password'
  | 'dashboard'
  | 'access-expired'
  | 'admin-login'
  | 'admin-panel'

interface RouteState {
  currentPage: Page
  params?: Record<string, any>
}

let currentRoute: RouteState = {
  currentPage: 'login',
}

const subscribers: Set<(route: RouteState) => void> = new Set()

export function useRouter() {
  return {
    currentPage: currentRoute.currentPage,
    params: currentRoute.params,

    navigate: (page: Page, params?: Record<string, any>) => {
      currentRoute = { currentPage: page, params }
      subscribers.forEach((fn) => fn(currentRoute))
    },

    subscribe: (callback: (route: RouteState) => void) => {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
  }
}
