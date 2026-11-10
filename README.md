# Liemex

The redesigned website for Liemex (Baltic Pine & European Timber), 1 Bedford Street, Port Adelaide.
Built by Lumen adl. Static HTML, CSS and JS; one small build script, no dependencies.

## Working on it

    node build.mjs     # regenerate the .html pages
    node serve.mjs     # preview at http://127.0.0.1:4318 (serves clean URLs, like Vercel)

- Pages: `src/pages/<name>.mjs` become `<name>.html`. Never hand-edit the `.html` files.
- Facts (address, hours, categories, species, reviews, gallery): `src/data.mjs`.
- Header, footer and page shell: `build.mjs`. Shared sections and the form: `src/ui.mjs`.
- Styles: `site.css`. Behaviour: `site.js`. Drawings (product sections, the board, the hero ruler): `src/draw.mjs`.
- The idea is "sawn, machined, laid": planks lift off photos (`data-reveal="photo"`), headings rise word by
  word (`data-split`), hairlines and drawings draw in (`data-rule`, `data-draw`), one statement darkens as it is
  read (`data-words`). On the homepage a board is machined as you scroll (`#bench`) and the work photos run
  sideways (`#work`). With reduced motion or no JavaScript everything rests in its finished state and nothing pins.
- The room (`room.js`): pick a timber and see it laid in a living room. three.js and its add-ons are self-hosted
  in `vendor/`, the scanned chair, plant and vase in `models/` (Poly Haven, CC0). It loads on the first click only.
- Enquiry form: posts to `api/enquiry.js` (Vercel function, emails through Resend). It needs
  `RESEND_API_KEY` and `ENQUIRY_EMAIL_FROM` set in Vercel; until then the form tells people to call.

## Before launch

- `PREVIEW` in `build.mjs` is `true`: every page is `noindex` and `robots.txt` blocks crawlers, so the
  preview can't compete with the live site. Set it to `false`, rebuild and open up `robots.txt`.
- `vercel.json` redirects the old WordPress addresses to the new pages. The 350-odd WooCommerce
  product pages and 16 species pages are folded into `/products` and `/timber-species`.
- The catalogue PDFs still link to the files on the WordPress site. Move them into this repo first.

## The proposal and its film

- `proposal.html` (at `/proposal`) is Lumen adl's proposal to Liemex. `preview.html` holds the alternative looks it frames.
- The film in it is rendered from `film/film.html`, a 1920 x 1080 composition that drives the real site in a
  window. Re-render with `node serve.mjs &` then `node film/record.cjs`; it writes `media/liemex-film-*.mp4`.
  The 3D room scene takes about half an hour on a machine with no graphics card.
