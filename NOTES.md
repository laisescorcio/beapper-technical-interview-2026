### Payment history decisions
- Data and architecture. I plan to use useInfiniteQuery in libs/api, expose the data and actions through libs/api-controller, and keep screen behavior in libs/ui-api-interaction. React Query already manages cached pages and request state, so adding Zustand would duplicate that state.

- Ordering and pagination. I’ll ask the API for 20 payments at a time, newest first, starting at page 0. Scrolling near the end will load the next page when no request is in progress. A short page signals the end. If the last page is full, one extra request is needed to confirm there are no more payments.

- Shared screen and refresh. Both platforms will use the same screen in libs/components. Native will use pull-to-refresh, and web will have a Refresh button so users can update the list without reloading the page. Both will restart at page 0 because new payments can shift page boundaries and cause duplicates or gaps.

- Loading and errors. I’ll show skeleton rows on the first load and at the bottom when loading more, and show an empty message after a successful response with no payments. A failed first load will offer a retry. If loading more or refreshing fails, the visible payments will stay in place and users can retry the failed action. A next-page error will pause automatic loading until the retry succeeds.

- Refresh implementation. I chose a mutation for refresh because `useInfiniteQuery`'s regular `refetch()` can reload all previously loaded pages. With a mutation, I can fetch only page 0 and replace the cached pages on success. If it fails, the existing payments stay visible.

- Background refetch. I decided to disable `refetchOnWindowFocus` because the mock API adds a new payment when page 0 is requested again. This avoids unexpected changes when switching browser tabs.

- Web scrolling. I want to check if `SmartyFlatList` works with the existing web layout before making any changes. If `onEndReached` doesn't work as expected, I'll adjust only what's necessary.

- Expo configuration issue. The standard typecheck and lint command failed because Node tried to load `ConfigContext` as a runtime import, but it is only a TypeScript type. I investigated the issue with AI and verified that using `import type` fixes the loading error. The fix is a one-line change in `app.config.ts`, without changing the Nx or Expo setup.

- Request handling. I chose to use `isRequestActive()` to check if React Query is already fetching payments or refreshing the list. This helps prevent overlapping requests when the user scrolls quickly or tries to refresh while another request is running. It checks the current request state before starting a new action.

- Web scrolling. During testing, the list was loading all pages automatically because the browser was scrolling the document. I added a height limit only to the Payment History page, so the list has its own scroll area. This allows pagination to load more payments when the user scrolls near the end.

### What I Would Improve With More Time

- I would test how the list behaves when the user scrolls very quickly or triggers multiple requests at the same time.
- If I find duplicated requests, I would consider adding an extra guard with `useRef`.
- I would also review whether additional React Query options are needed to handle overlapping requests.

For this challenge, I decided to start with a simpler solution and use React Query's built-in features.