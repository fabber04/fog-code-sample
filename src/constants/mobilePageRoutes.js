/** Routes that render their own mobile header (Layout hides global bar on phone). */
export const MOBILE_OWN_HEADER_ROUTES = [
  '/events',
  '/podcasts',
  '/library',
  '/bookmarks',
  '/devotionals',
  '/counseling',
  '/prayer-requests',
  '/masterclass',
  '/members',
];

export function routeHasOwnMobileHeader(pathname = '') {
  return MOBILE_OWN_HEADER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
