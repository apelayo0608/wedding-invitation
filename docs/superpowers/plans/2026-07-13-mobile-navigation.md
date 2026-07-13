# Mobile Invitation Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Details, Entourage, and RSVP navigation links available on mobile invitation screens.

**Architecture:** Reuse the existing header anchors in `src/main.jsx`. Change only the mobile breakpoint styling in `src/styles.css` so the link row remains visible and can scroll horizontally without wrapping. A source-level regression test protects the mobile rule.

**Tech Stack:** React, Vite, CSS, Node.js built-in test runner.

## Global Constraints

- Desktop navigation remains unchanged.
- Mobile links target `#details`, `#entourage`, and `#rsvp`.
- The row remains usable on narrow screens through horizontal scrolling.

---

### Task 1: Keep invitation links visible on mobile

**Files:**
- Modify: `tests/anchors.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `.site-nav nav` anchors in `src/main.jsx`
- Produces: a visible, horizontally scrollable mobile navigation row

- [ ] **Step 1: Write the failing test**

```js
test('keeps invitation links visible and scrollable on mobile', () => {
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.site-nav nav\s*\{\s*display:\s*flex;[\s\S]*overflow-x:\s*auto;/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/anchors.test.js`

Expected: FAIL because the existing mobile breakpoint sets `.site-nav nav` to `display: none`.

- [ ] **Step 3: Write minimal implementation**

```css
.site-nav nav { display: flex; flex: 1; justify-content: center; gap: 20px; overflow-x: auto; white-space: nowrap; }
.site-nav nav::-webkit-scrollbar { display: none; }
```

Replace the mobile `display: none` rule with these declarations at the existing mobile breakpoint.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/anchors.test.js`

Expected: PASS with three passing tests.

- [ ] **Step 5: Verify full production build**

Run: `npm.cmd test; npm.cmd run build`

Expected: all tests pass and Vite exits with code 0.

- [ ] **Step 6: Commit and deploy**

```powershell
git add src/styles.css tests/anchors.test.js docs/superpowers
git commit -m "feat: keep invitation links visible on mobile"
git push
```
