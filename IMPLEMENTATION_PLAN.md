# Payment history implementation plan

The web and native routes use the shared `PaymentHistoryScreenView` from `libs/components`. The feature follows the Email address example for layer boundaries and imports through the public library exports. React Query owns the payment cache and request state.

## 1. Fetch and paginate payments

In `libs/api`, `useInfiniteQuery` calls the generated `subscriberPaymentGet` method. Requests start at page 0, ask for 20 items, and sort by `paymentDate,desc`. The fetch function checks that the response is an array.

A page with fewer than 20 entries ends pagination. A full page advances to the next index, so a full final page needs one extra request. The page size check uses the original API response before individual entries are filtered. Automatic retries and refetching on window focus are disabled for this query.

**Review check.** Confirm the first request parameters and verify that a short or empty page stops pagination.

## 2. Refresh from page 0

A React Query mutation uses the same fetch function to request only page 0. On success, it replaces the cached pages with the new first page and `pageParams: [0]`. The list returns to the top and the next request is for page 1. A failed refresh leaves the cache intact.

**Review check.** With two pages loaded, confirm that Refresh requests only page 0, returns the list to the top, and resumes pagination at page 1.

## 3. Map payments and handle list actions

The API controller flattens the loaded pages, filters invalid entries, and maps the remaining DTOs to the `Payment` model in `core`. It exposes the payments, request states, and actions to the interaction layer.

The interaction layer checks for an active request when the user scrolls, retries, or refreshes. The initial Retry requests the first page again. The footer Retry requests the failed next page. Automatic pagination pauses after a next-page error until Retry succeeds.

**Review check.** Confirm that repeated actions during a request do not start overlapping requests and that a pagination retry requests the failed page.

## 4. Render the payment list

`SmartyFlatList` renders payments in API order and uses payment IDs as keys where available. `PaymentItem` shows description and amount on the first line, with date and a labeled status badge below. The row uses the project's design tokens, `SmartyDate` and `SmartyPrice` for formatting, and shared language strings for labels and missing values.

**Review check.** Verify the amount, date, all four status labels, and fallbacks for fields that are unavailable.

## 5. Show loading, empty, and error states

The initial load and refresh show the shared skeleton rows in place of the list. Pagination shows a skeleton in the footer and keeps the loaded payments visible. An empty result shows a receipt icon and a message.

First-page and pagination errors use `SmartyAlertPanel` with a compact Retry button. A refresh failure brings back the cached rows and offers Retry above the list. The web buttons have accessible names and visible keyboard focus.

**Review check.** Verify skeleton placement, the empty state, and each retry action. Check keyboard access and the reading order of the payment fields.

## 6. Connect the web controls

The web route limits the list height so pagination responds to scrolling inside the list. The Refresh button appears when there are payments and gives way to Retry if refresh fails. The header Back button uses `StackRootView`'s page-level callback to open `/dashboard/account`, including after a direct visit.

**Review check.** Scroll within the list to load the next page. Open Payment History directly and confirm that Back opens Account.

## 7. Verify the web scenarios and workspace checks

Set `NEXT_PUBLIC_MOCK_API_SCENARIO` when starting the web app.

| Scenario | Expected result |
| --- | --- |
| `default` | On a fresh session, pages 0–4 contain 100 payments. Page 5 is empty and pagination stops. |
| `empty` | Page 0 shows the empty state and pagination stops. |
| `error` | The first request fails. Initial Retry loads page 0. |
| `next-page-error` | Each later page fails once. Loaded rows stay visible, and footer Retry requests the failed page. |

Run `npx nx run-many -t typecheck lint --skip-nx-cache` on Node 22. See `NOTES.md` for the mock, browser, and VoiceOver checks that were carried out. The native app uses the shared view and was not run on a device or simulator.
