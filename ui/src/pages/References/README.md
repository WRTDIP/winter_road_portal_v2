# References

The three Northern Transportation Network Study StoryMaps are stored locally in
`content.json`, with their images in `public/references`. Republication permission
was confirmed by the site owner. The original text, tables, citations, and source
links are preserved. The interactive remoteness map still loads from ArcGIS when
requested; reading the articles does not require ArcGIS.

To refresh the source snapshot, run `node scripts/import-references.mjs` from
`ui/`, review the content changes, then rebuild. New StoryMaps block types fail
explicitly so content cannot silently disappear.

The Vite plugin emits `build/references/index.html` containing the article text
before JavaScript runs. `npm run serve:build` uses `serve.json` to keep this route
out of the SPA fallback. Do not add `serve -s`: its catch-all rewrite masks the
static references document. Other hosting configurations must also serve this
file for `/references` before falling back to the app shell.

Focused checks: `node --test scripts/references.test.mjs`.