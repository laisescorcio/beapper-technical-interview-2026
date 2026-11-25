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

On native, I used `StackRootFlatList` to support pull-to-refresh. On web, I added a Refresh button so users can update the list without reloading the entire page.

Both platforms share the same refresh logic.

I chose a mutation for refresh because the regular `refetch()` from `useInfiniteQuery` can reload all previously loaded pages.

With the mutation, I request only page 0 and replace the cached pages after a successful response. This avoids duplicated or missing payments when new payments change the order of the list.

If refresh fails, the previous payments stay visible.

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

### Refresh Error UI

During testing, I noticed that both Refresh and Retry buttons were visible when a refresh failed.

Since both buttons perform the same action, I decided to hide Refresh when there is an error and show only Retry.

After a successful retry, Refresh appears again.


### Empty State UI

During testing, I noticed that the Refresh button was visible even when there were no payments. I decided to hide it in the empty state to keep the screen simple and show only the empty message.

### Initial Load Error UI

During testing, I noticed that both Refresh and Retry were visible when the initial request failed. I decided to show only Retry in this state to avoid having two buttons for the same action. I kept Refresh available in the empty state so users can check for new payments.


### Expo Configuration Issue

The standard typecheck and lint command initially failed because Node tried to load `ConfigContext` as a runtime import, but it is only a TypeScript type.

I investigated the issue with AI and changed the import to `import type` in `app.config.ts`.

After this change, the standard typecheck and lint command passed without additional flags.

## 3. Testing Limitations

### Native Testing

I couldn't test the React Native app because I don't have an iOS or Android simulator available.

I tested the shared screen and refresh behavior on web, but native pull-to-refresh still needs to be tested on a device.

On native, the list uses `StackRootFlatList` for pull-to-refresh, while web uses a Refresh button. Both use the same refresh logic.

## 4. What I Would Improve With More Time

I would test more edge cases, especially very fast scrolling and multiple requests happening close together.

If I found duplicate requests, I would first check if `isRequestActive()` is working correctly.

If needed, I would consider using `cancelRefetch: false` to prevent repeated pagination requests, or an extra guard with `useRef` to block overlapping requests.

For this challenge, I decided not to add these protections because I didn't find duplicate requests during testing. I preferred to keep the solution simple and use React Query's existing features whenever possible.

I would also do more accessibility testing, especially with screen readers, to make sure loading messages, errors, and buttons are announced correctly.