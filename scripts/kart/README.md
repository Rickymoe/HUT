# Eiendomsporteføljen-kart (om-oss.html)

Genererer det inline SVG-kartet i «Eiendomsporteføljen»-seksjonen på om-oss.

- `osm.json` – rå OpenStreetMap-geometri for Holmestrand sentrum (Overpass API,
  hentet 2026-09. Gatenett + byggverk + Torvet.)
- `genmap.py` – projiserer + roterer geometrien så Langgaten ligger vannrett,
  matcher HUTs geokodede adresser (Kartverket, koordinater i `GA`-dict) mot
  OSM-byggverk og fyller dem i petrol/mose. Skriver `hut-kart.svg`.

## Kjøre
    python3 scripts/kart/genmap.py

Deretter lim `hut-kart.svg` inn i `om-oss.html` (erstatt `<svg class="portefolje-kart reveal">…</svg>`).
CSS-en (`.kart-*`, `.hut-fp` osv.) og hover-scriptet ligger i om-oss.html.

## Endre
- Utsnitt: `minx/maxx/miny/maxy` + `SCALE`
- Hvilke gater får navn: `LAB`-dict
- Nye/endrede HUT-eiendommer: `GA`-dict (geokod adressen mot
  ws.geonorge.no/adresser/v1/sok først)
- Hente ferske OSM-data: Overpass-spørring i git-historikken for denne mappa
