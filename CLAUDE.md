# Holmestrand Utvikling AS – Ny nettside

## Prosjektet
Vi bygger en helt ny nettside for **Holmestrand Utvikling AS** (holmestrandutvikling.no).
Selskapet driver med eiendomsutvikling og utleie i Holmestrand sentrum.
Dagens nettside er en WordPress-installasjon som er kompromittert (spam-lenker injisert i innholdet) og skal erstattes fullstendig.

Målet er en rask, moderne, statisk nettside (HTML/CSS/JS eller et rammeverk du velger) med følgende sider:
- Forside
- Til leie → Næringseiendom
- Til leie → Bolig / boder
- Prosjekter
- Sentrumsutvikling
- Om oss
- Kontakt

---

## Designsystem – «Fjord & Lyng»

### Farger (hentet direkte fra logoen)
```css
--ink:        #04313a;   /* Dyp petrol – tekst og mørke flater */
--fjord:      #007898;   /* Logofarge primær – petrol/fjordturkis */
--sea:        #1f93ad;   /* Lysere teal-aksent */
--mist:       #bdd9e0;   /* Lys petrol-flate */
--moss:       #687830;   /* Logofarge aksent – lyng/mosegrønt (CTA, knapper) */
--moss-light: #7f9040;   /* Hover på mosegrønt */
--lys-lyng:   #aeb87b;   /* Myk grønn flate */
--sand:       #e7e1d2;   /* Varm bakgrunn */
--sand-deep:  #d6cdb8;
--paper:      #f4f1e9;   /* Sidebakgrunn */
--line:       rgba(4,49,58,.14);
```

### Typografi
- **Display/Overskrifter:** `Fraunces` (Google Fonts) – serif med kursiv, vekt 300–600
- **Brødtekst/UI:** `Schibsted Grotesk` (Google Fonts) – norsk groteskfont, vekt 400–700

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Designprinsipper
- Nordisk, redaksjonell og rolig – premiumfølelse uten å være kald
- Mye luft/whitespace mellom elementer
- Eyebrow-etiketter i mosegrønt med liten linje foran
- Display-overskrifter i Fraunces, gjerne med kursiv på nøkkelord
- Knapper: avrundede (border-radius 100px), to varianter – lynggrønn (primær CTA) og petrol (sekundær)
- Bakgrunnsflater veksler mellom `--paper` og `--sand`

Fasit for designsystemet er `style.css` (tokens øverst) – den opprinnelige
stilguide-fila `holmestrand-designforslag.html` er slettet.

---

## Filer i prosjektet

- `index.html` … `kontakt.html` – én HTML-fil per side (8 sider)
- `style.css` – felles stilark, designsystem «Fjord & Lyng»
- `main.js` – eneste JS-inngang: laster nav/footer-partials (`partials/nav.html`,
  `partials/footer.html`) via `fetch()` + sessionStorage-cache, + scroll-reveal,
  hamburger, webkamera-popup, hero-karusell, stat-tellere
- `data/projects.js` – `window.HUT_PROJECTS`, 6 prosjekter (Langgaten 24,
  Holmestrand Brygge, Bibliotekkvartalet ×3, Dr. Graaruds Plass 1–3). Lastes som
  klassisk `<script src>` FØR sidas inline-script (ikke `type="module"`).
- `data/news.js` – `window.HUT_NEWS`, nyhetssaker. Samme lastemønster.
- `Logo/HUTLogo.png` – original PNG-logo, nå kun kilde for faviconene (selve
  merket er inline-SVG i partialene).

Tidligere `holmestrand-designforslag.html`, `projects.json`, `nyheter.json` og
`naeringseiendom.json` er alle slettet – ikke anta at de finnes.

---

## Arkitekturvalg

### Til leie – lenke til FINN (IKKE iframe)
`til-leie.html` er et rent utlenkings-kort til FINNs offentlige søk, med
fane-velger næring/bolig:
- næring: `https://www.finn.no/realestate/businessrent/search.html?orgId=707555245`
- bolig:  `https://www.finn.no/realestate/lettings/search.html?orgId=707555245`

FINN partner-widget i `<iframe>` (`finn.no/pw/search/...`) ble vurdert og
forkastet:
- ren JS + `<meta robots="noindex,nofollow">` → gir null SEO til
  holmestrandutvikling.no uansett
- krever aktiv FINN-partneravtale + godkjent domene
- HUT kjørte nettopp den løsningen på WP-siden i ~1,5 år (2024–2025) uten
  Google-effekt

Vei til SEO senere («alt. C»): statiske annonsekort bygget fra data HUT
leverer (regneark e.l.) + **HUT-eide** bilder + `RealEstateListing`-JSON-LD.
Krever ingen FINN-avtale. Skraping av finn.no er ikke lov. Blokkert på at HUT
leverer innhold.

### Prosjekter – data-drevet
Prosjekter rendres fra `data/projects.js` (`window.HUT_PROJECTS`).

---

## Kontaktinformasjon (til Kontakt-siden)
```
Holmestrand Utvikling AS
Dr. Graaruds Plass 3, 2. etg
3080 Holmestrand
Telefon: +47 33 09 77 00

Ansvarlig næringseiendom: Øistein Hjelmvedt – mobil 91 55 17 10
Facebook: https://www.facebook.com/Holmestrand-Utvikling-as-313412958677095/
Webkamera havn: https://holmestrandutvikling.no/webkamera/
Google Maps: lat 59.488086, lng 10.315639
```

---

## Navigasjonsstruktur
```
Hjem
Til leie                (fane-velger; begge faner lenker til FINN-søk, orgId 707555245)
Prosjekter              (fra data/projects.js)
Sentrumsutvikling
Aktuelt                 (fra data/news.js)
Om oss
Kontakt
```

---

## Viktige merknader
- Logoen finnes på: `https://holmestrandutvikling.no/wp-content/uploads/2021/10/logo-1x-ny.png`
- Tagline: **«Visjoner | Planer | Utvikling»**
- Ikke kopier innhold fra dagens WordPress-side uten å rense det – den er hacket og har injisert spam
- Pris på næringslokaler er **kr/m²/år** (bekreftet mot FINN)
- Dr. Graaruds Plass 3 er et kontorhotell med to separate FINN-annonser (9–18 m² per kontor)
- Sidene laster nav/footer via `fetch()` (delte partials i `partials/`), så de må åpnes gjennom en lokal webserver (`python3 -m http.server 8000`) – ikke som `file://` (da blir nav/footer tomme)
