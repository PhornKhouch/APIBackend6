# Ancora School SMS — Admin Client

Plain HTML/CSS/JS single-page app (no build step, no framework — matches the
project BRD). Open `index.html` directly or serve the folder with any static
server.

## Structure

```
client/
  index.html                 App shell: sidebar + topbar + #content mount point
  assets/css/                variables → base → layout → components → responsive
  js/
    config.js                API_BASE_URL + per-resource USE_MOCKS flags
    navConfig.js              Single source of truth for sidebar items + routes
    main.js                   Entry point, wired via <script type="module">
    router.js                 Maps a nav key to a page renderer, updates the title
    state/auth.js             Token storage (localStorage)
    api/
      httpClient.js           fetch wrapper: base URL, auth header, error handling
      resourceFactory.js      Builds list/create/update/remove for a REST resource
      <resource>Api.js        One file per resource (students, teachers, ...)
    components/               Reusable render functions (sidebar, table, charts, ...)
    pages/
      dashboard.js            Custom dashboard layout (stats, charts, activity)
      genericListPage.js      Generic description + table page
      listPagesConfig.js      Config (title, columns, api) for every generic page
  data/mock.js                Fixture data shaped like the real API responses
```

## Wiring up a real endpoint

Each resource (`js/api/studentsApi.js`, `teachersApi.js`, etc.) currently
returns data from `data/mock.js`. Once its node-api route exists:

1. Flip the flag in `js/config.js` → `CONFIG.USE_MOCKS.<resource> = false`.
2. Confirm the path in the matching `js/api/<resource>Api.js` matches the
   real route.
3. Delete the resource's fixture block in `data/mock.js` once nothing else
   references it.

Two resources already point at real node-api routes:
- `usersApi.js` → `/api/user` (`node-api/src/routes/userRoute.js`)
- `teachersApi.js` → `/api/v1/teacher` (currently a stub route)

## Adding a new section

1. Add an entry to `NAV_ITEMS` in `js/navConfig.js` (key, label, icon).
2. Add a resource file in `js/api/` (use `resourceFactory.js` unless the
   backend contract is irregular, as with `usersApi.js`).
3. Add fixture rows to `data/mock.js`.
4. Add an entry to `LIST_PAGES` in `js/pages/listPagesConfig.js` with the
   table columns. The section is now routable with no other changes —
   `router.js` picks up any key present in `LIST_PAGES`.

For a page that needs custom layout instead of a table (like the dashboard),
add a `js/pages/<name>.js` render function and special-case it in
`js/router.js#getRenderer`.
