# Payment History – Technical Notes

## 1. Technical Decisions

### Architecture and State Management

The `api` layer fetches payments and manages the cache with React Query. The API controller filters invalid entries, maps valid responses to the `Payment` model in `core`, and exposes the data and request states. The `ui-api-interaction` layer decides when to load, retry, or refresh. The shared screen in `components` renders the list and formats each payment.

React Query is the source of truth for cached pages and request states. The interaction checks for an active payment request when the user scrolls, retries, or refreshes. Automatic refetch on window focus is disabled so switching tabs does not update the list unexpectedly.

### Ordering and Pagination

The API returns up to 20 payments per page, starting at page 0 and sorted by payment date, newest first. The next page loads as the user scrolls near the end. A page with fewer than 20 entries ends pagination. If the last page is full, one extra request confirms the end. The page size check uses the number of entries returned by the API, before invalid entries are filtered out.

### Refresh

The web Refresh button runs a mutation that fetches only page 0. On success, it replaces the cached pages with that page. The list starts at the top and pagination resumes at page 1. If the request fails, the cached payments reappear with a Retry button.

### Loading and Error States

The initial load and refresh show the project's skeleton rows in place of the list. Loading the next page shows a skeleton in the footer while keeping the existing payments visible. An empty result shows a receipt icon and a message.

The first-page and pagination errors use the shared `SmartyAlertPanel`. Each Retry repeats the failed action. After a pagination error, scrolling no longer triggers automatic requests for that page until Retry succeeds.

## 2. Changes Made During Testing

- **Web scrolling.** The Payment History page limits the list height so it has its own scroll area. This lets pagination respond to scrolling inside the list.
- **Back navigation.** The Payment History header takes the user directly to the dashboard's Account page (`/dashboard/account`). This gives the button the same destination even when the user opens Payment History from a direct link.
- **Expo configuration.** The Expo configuration uses type-only imports so Node can load it during the workspace checks.

## 3. Verification and Testing Limitations

I ran `npx nx run-many -t typecheck lint --skip-nx-cache` on Node 22. I also checked `default`, `empty`, `error`, and `next-page-error` with the mock API and React Query. Browser checks covered refresh, the return to the top, and pagination after refresh. I also verified that Back opens Account after opening Payment History directly or from a browser tab that was on the Change Email page.

On macOS, I used VoiceOver to check that it reads the payment description, amount, date, and status. I also checked that VoiceOver recognizes Retry as a button and that I could activate it with the keyboard. I would test loading and error announcements across more states.

The native app uses the shared screen. I did not run it on an iOS or Android device or simulator. The Refresh button and the direct dashboard Back behavior are web-specific.
