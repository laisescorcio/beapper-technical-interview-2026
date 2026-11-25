# Payment history implementation plan

Implement and verify one step at a time. The web and native routes already render `PaymentHistoryScreenView` from `libs/components`. Follow the Email address feature for library boundaries and import through public barrels. React Query owns the cache and request state, so the feature needs no Zustand store.

## 1. Add the paginated API query

In `libs/api`, use `useDxApi()` and the generated `subscriberPaymentGet` method with `useInfiniteQuery`. Start at page 0 and send `size: 20` and `sort: ['paymentDate,desc']` on each request. A page with fewer than 20 items ends pagination. A full page advances to the next index, so a full final page needs one extra request to confirm the end.

Disable automatic retries for this query so the mock's one-time errors reach the retry UI. Disable focus-triggered refetching for this query and keep the other defaults unless testing shows they interfere. An infinite-query refetch can reload all loaded pages when the data is stale, and every repeat page-0 request in the mock adds a payment. Disabling the focus trigger keeps switching browser tabs from changing the list.

**Review check.** Verify the first request parameters and that a short or empty page stops pagination.

## 2. Add page-zero refresh

In `libs/api`, use a React Query mutation that calls the same page-fetching function for page 0. The mutation gives refresh its own loading and error state. The infinite query's regular `refetch()` reloads all loaded pages, while manual refresh needs a single request. On success, replace the infinite-query cache in one write with the new first page and `pageParams: [0]`. This starts pagination again at page 1 and avoids mixing pages from before and after a new payment shifts the boundaries. Keep the existing cache if refresh fails.

**Review check.** With two pages loaded, verify that refresh issues only a page-0 request and replaces both pages on success. Force a failed refresh with a test stub because the built-in scenarios do not fail a refresh after a successful load. Verify that cached rows stay visible and that refresh can be retried.

## 3. Wire the controller and screen behavior

Expose flattened payments, request states, and actions in `libs/api-controller`. In `libs/ui-api-interaction`, allow end-of-list loading only when `hasNextPage` is true, no fetch or manual refresh is active, and there is no next-page error. Prevent overlapping refresh and pagination requests. Keep initial **Retry** and footer **Retry** as separate actions. The footer calls `fetchNextPage` explicitly so it retries the failed page while automatic pagination is paused. Share the refresh handler between platforms.

**Review check.** Repeated scroll events during a request produce a single fetch. After a next-page failure, scrolling issues no further requests until the user retries. Footer **Retry** requests the failed page without reloading page 0, and scrolling can resume after it succeeds.

## 4. Render rows and verify web scrolling

Use `SmartyFlatList` in the shared screen and render payments in the API's order. Show description, amount, date, and status. Use stable payment IDs where available, `SmartyPrice` for major-unit amounts, `SmartyDate` for dates, and `paymentHistoryStrings` for readable status labels and missing-value copy.

`SmartyFlatList` forwards `onEndReached`. Verify it in the browser with the first 20 real mock rows in the current dashboard layout before changing the layout. If the browser is scrolling the document and the list never gets the scroll events it needs, make the smallest scroll-viewport adjustment local to Payment history and repeat the check.

**Review check.** Confirm that only page 0 loads initially, then scroll near the end and confirm that page 1 loads. Check a fractional amount such as £3.50, all four statuses, and readable fallbacks for missing fields.

## 5. Render loading, empty, and retry states

Use `isPending` for the list's initial skeletons and `isFetchingNextPage` for footer skeletons. Show the empty message after a successful empty first page. Give the initial error its own **Retry**. Show a pagination error and **Retry** in the footer, and offer retry for a failed refresh. Keep existing rows visible during both of those failures. Reuse the shared skeleton and button components.

**Review check.** Verify screen-reader reading order within each row, text labels for all statuses, loading and error announcements, and that decorative skeletons are skipped. Check keyboard access, focus visibility, and clear button names on web.

## 6. Connect the platform refresh triggers

On native, pass the existing `StackRootFlatList` as the shared screen's list renderer using the `SmartyFlatListRenderer` contract. Reuse its pull-to-refresh control and top-bar inset, and drive its indicator from refresh state. On web, keep the existing route wrapper and show a **Refresh** button, using a small `.web.tsx` adapter if needed. Keep the list contents, states, and refresh handler shared.

**Review check.** Verify that scrolling loads more payments on both platforms. Trigger native pull-to-refresh and web **Refresh** without reloading the app. After loading several pages, confirm that refresh shows the new payment at the top, replaces the loaded pages, and the next scroll requests page 1. Verify that a refresh failure keeps the rows visible and the action can be retried.

## 7. Verify mock scenarios and run submission checks

Use `NEXT_PUBLIC_MOCK_API_SCENARIO` on web and `EXPO_PUBLIC_MOCK_API_SCENARIO` on native.

| Scenario | Expected result |
| --- | --- |
| `default` | Before any refresh, pages 0–4 contain 100 payments and page 5 is empty. No further page is requested. |
| `empty` | A successful page 0 shows the empty state and pagination stops. |
| `error` | The first page fails visibly. Initial **Retry** requests page 0 and displays the payments on success. |
| `next-page-error` | Each later page fails once. Existing rows stay visible, scrolling pauses pagination, and footer **Retry** requests the same page. |

Run `npx nx run-many -t typecheck lint` from the project root and confirm zero errors and warnings. Update `NOTES.md` with decisions and trade-offs. If native testing is skipped, record that explicitly and describe the expected differences in the refresh gesture, indicator placement, and scroll container.
