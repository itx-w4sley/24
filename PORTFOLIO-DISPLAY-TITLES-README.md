# Portfolio display titles (33 original artworks)

The portfolio previously displayed the raw image filenames such as `Photo1`, `banner2`, `wasleylogo5`, and `TechuraSolutionsC2_Dashboard`.

This update adds a `LEGACY_DISPLAY_TITLES` map in **`lib/projects.js`**. Your public portfolio grid, homepage cards, individual project pages, and page titles now use polished display names.

## To customize a name

Open `lib/projects.js` and change only the value in `LEGACY_DISPLAY_TITLES`. For example:

```js
'Photo1': 'Photography Collection — 01',
```

can become:

```js
'Photo1': 'Perth City Photography',
```

**Do not rename the map key (`Photo1`) or the PNG filename**, unless you also update `LEGACY_ARTWORK` and the asset paths. The archive links, slugs, and image URL filenames remain unchanged.

## Install on Vercel

For the quick patch, replace only **`lib/projects.js`** in your GitHub repository. Commit to `main` and let Vercel deploy. The full ZIP contains the same patch combined with the other Studio 5.1 changes.

The image files themselves still need to exist at `public/assets/<original filename>.png`. This change renames only captions, not files or images.

The photography titles are intentionally neutral because the actual photographs were not supplied for identifying their subjects.
