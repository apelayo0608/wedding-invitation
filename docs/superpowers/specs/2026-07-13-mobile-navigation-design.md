# Mobile invitation navigation

## Goal

Keep the invitation's primary section links available on phones so guests can jump to Details, Entourage, or RSVP without returning to the top of the page.

## Design

The existing desktop navigation remains unchanged. At widths of 700px and below, the header displays the same three anchor links in a compact, horizontally scrollable row beside the monogram. Links use the existing uppercase, letter-spaced wedding styling and retain the fixed header's translucent background.

## Behavior and verification

Each link targets the existing `#details`, `#entourage`, or `#rsvp` section. Existing scroll-margin preserves visibility below the fixed header. Automated source tests confirm that mobile CSS keeps the navigation visible and scrollable, and the Vite production build remains successful.
