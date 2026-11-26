# Payment History – Technical Notes

## 1. Technical Decisions

### Architecture and State Management

I used `useInfiniteQuery` in `libs/api`, exposed the data and actions through `libs/api-controller`, and kept screen behavior in `libs/ui-api-interaction`.

React Query already manages cached pages and request states, so I decided not to use Zustand to avoid duplicating state.

### Ordering and Pagination

I request 20 payments at a time, starting at page 0, with the newest payments first.

When the user scrolls near the end, the next page loads if no other request is running.

Since the API doesn't return the total number of payments, I use the number of items returned to identify the last page. If a page returns fewer than 20 payments, pagination stops. If the last page is full, one extra request is needed to confirm the end.

### Shared Screen and Refresh

Both web and native use the same screen in `libs/components`.

On web, I added a Refresh button so users can update the list without reloading the entire page.

I chose a mutation for refresh because the regular `refetch()` from `useInfiniteQuery` can reload all previously loaded pages.

With the mutation, I request only page 0 and replace the cached pages after a successful response. This avoids duplicated or missing payments when new payments change the order of the list.

A successful refresh returns the list to the top and pagination resumes at page 1. If refresh fails, the previous payments stay visible.

### Request Handling

I used `isRequestActive()` to check if React Query is already fetching payments or refreshing the list.

This helps prevent overlapping requests when the user scrolls quickly or tries to refresh while another request is running.

I also disabled `refetchOnWindowFocus` because the mock API adds a new payment when page 0 is requested again. This avoids unexpected changes when switching browser tabs.

### Loading and Error States

I used skeleton rows for the first load and when loading more payments.

If the API successfully returns no payments, the screen shows an empty message.

If the first request fails, the user can retry. If pagination or refresh fails, the existing payments stay visible and the user can retry the failed action.

After a pagination error, automatic loading pauses until the retry succeeds.

## 2. Changes Made During Testing

### Web Scrolling

During testing, I noticed that the list was loading all pages automatically because the browser was scrolling the document.

I added a height limit only to the Payment History page, so the list has its own scroll area. This allows pagination to load more payments when the user scrolls near the end.

### Refresh Error Testing

I modified the existing mock API to add a new `refresh-error` scenario, which was not included in the original README.

This allows me to test what happens when a refresh fails. The initial request works normally, but the second request for page 0 fails once. The existing payments stay visible, and Retry works after the failure.

I can test this scenario by running:

```bash
NEXT_PUBLIC_MOCK_API_SCENARIO=refresh-error npx nx dev web
```

### Refresh Button Visibility

On web, Refresh appears once payments load. An empty response shows only the empty message, and an initial load error offers Retry.

If refresh fails, the existing payments stay visible and Retry is the only refresh action shown. When Retry starts, Refresh reappears disabled until the request finishes. If the request fails again, Retry is shown again.

### Expo Configuration Issue

The standard typecheck and lint command initially failed because Node tried to load `ConfigContext` as a runtime import, but it is only a TypeScript type.

I investigated the issue with AI and changed the import to `import type` in `app.config.ts`.

After this change, the standard typecheck and lint command passed without additional flags.

## 3. Verification and Testing Limitations

### Verification

I ran `npx nx run-many -t typecheck lint --skip-nx-cache` on Node 22, and all 25 projects passed without TypeScript or ESLint errors.

I also checked all five mock scenarios (`default`, `empty`, `error`, `next-page-error`, and `refresh-error`) using the mock API, React Query, and the interaction handlers.

These checks covered pagination, empty results, request errors, retries, and refresh behavior.

The final automated checks ran outside the browser. I would still verify the visible states, keyboard navigation, screen-reader announcements, and scroll position after refresh in the browser.

### Accessibility Testing

I tested the Payment History screen using VoiceOver on macOS.

I confirmed that VoiceOver can read the payment description, amount, date, and status correctly.

I also tested keyboard navigation and confirmed that VoiceOver recognizes Retry as a button and that I can activate it using the keyboard.

With more time, I would test additional accessibility scenarios, especially automatic loading and error announcements.

### Platform Scope

I implemented and tested this challenge on web. The native app still uses the shared screen, and native behavior was not tested.

On web, the dashboard route provides a bounded scroll area and a Refresh button, with a text indicator during refresh. A native implementation would let users pull down from the top of the list inside the stack screen and show a refresh indicator below the top bar.

## 4. What I Would Improve With More Time

I would test more edge cases, especially very fast scrolling and multiple requests happening close together.

If I found duplicate requests, I would first check if `isRequestActive()` is working correctly.

If needed, I would consider using `cancelRefetch: false` to prevent repeated pagination requests, or an extra guard with `useRef` to block overlapping requests.

For this challenge, I decided not to add these protections because I didn't find duplicate requests during testing. I preferred to keep the solution simple and use React Query's existing features whenever possible.

I would also do more accessibility testing, especially with screen readers, to make sure loading messages, errors, and buttons are announced correctly.
