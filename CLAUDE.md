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

Se `holmestrand-designforslag.html` for komplett stilguide med forside-skisse, fargepalett, typografi-skala og komponenteksempler.

---

## Filer i prosjektet

### `holmestrand-designforslag.html`
Komplett visuell stilguide med:
- Forside-mockup (nav, hero med SVG-fjordmotiv, prosjektkort)
- Fargepalett med hex-koder
- Typografi-skala
- Knapper og komponenter
- Seksjon 05: «Næringseiendom til leie» med FINN-iframe og kontaktbar

### `projects.json`
Strukturert metadata for alle 6 prosjekter (Langgaten 24, Holmestrand Brygge, Bibliotekkvartalet ×3, Dr. Graaruds Plass 1–3).

Skjema per prosjekt:
```json
{
  "id": "langgaten-24",
  "name": "Langgaten 24",
  "tagline": "Et betydelig løft for sentrum",
  "status": "under_regulering",
  "statusLabel": "Under regulering",
  "soldOut": false,
  "completionYear": null,
  "type": "kombinert",
  "typeLabel": "Bolig og næring",
  "location": { "address": "...", "postalCode": "3080", "city": "Holmestrand", "coordinates": { "lat": null, "lng": null } },
  "units": { "apartments": null, "apartmentsApprox": "65–70", "commercial": true, "breakdown": [] },
  "buildings": [{ "floors": 5 }, { "floors": 16 }],
  "summary": "...",
  "highlights": ["..."],
  "media": { "hero": "https://...", "gallery": [] },
  "links": { "detail": "https://...", "press": "https://..." },
  "byggherre": { "name": "Holmestrand Utvikling AS", "url": "https://holmestrandutvikling.no/" },
  "leverandor": { "name": null, "url": null }
}
```

### `naeringseiendom.json`
8 næringslokaler til leie, hentet fra FINN (orgId 707555245).

Skjema per lokale:
```json
{
  "id": "havnegaten-7-havnefront",
  "title": "Lokaler ved havnefront - romslig og sentralt",
  "useTypes": ["Kontor", "Butikk/Handel", "Serveringslokale/Kantine", "Andre"],
  "address": { "street": "Havnegaten 7", "postalCode": "3080", "city": "Holmestrand", "coordinates": { "lat": null, "lng": null } },
  "area": { "m2": 175, "m2Min": null, "m2Max": null, "raw": "175 m²" },
  "price": { "amount": 1300, "currency": "NOK", "period": "per_m2_per_year", "raw": "1 300,-" },
  "landlord": "Holmestrand Utvikling AS",
  "available": true,
  "etasje": 1,
  "byggeaar": 1983,
  "kontorplasser": 8,
  "overtakelse": "2025-08-01",
  "fasiliteter": ["Aircondition", "Bredbåndstilknytning", "Heis"],
  "beskrivelse": "...",
  "media": { "hero": "https://images.finncdn.no/...", "gallery": [] },
  "links": { "finn": "https://www.finn.no/realestate/businessrent/ad.html?finnkode=418907004", "finnkode": "418907004" },
  "kontakt": { "navn": "Øistein Hjelmvedt", "rolle": "Ansvarlig for utleie av næringseiendom", "telefon": "33 09 77 00", "mobil": "91 55 17 10" }
}
```

**OBS:** 6 av 8 lokaler mangler fortsatt FINN-kode i `links`. Hent dem med:
```bash
curl -s "https://www.finn.no/pw/search/realestate-business-letting?orgId=707555245" | grep -oP 'finnkode=\K[0-9]+'
```

---

## Arkitekturvalg

### Næringseiendom – FINN-iframe
Næringslokaler vises via FINN sin partnerwidget som en `<iframe>`. Dette gir automatisk oppdatering uten vedlikehold.
```html
<iframe
  src="https://www.finn.no/pw/search/realestate-business-letting?orgId=707555245"
  title="Næringseiendom til leie – Holmestrand Utvikling AS"
  width="100%" height="900" frameborder="0" scrolling="auto" loading="lazy">
</iframe>
```

### Prosjekter – JSON-drevet
Prosjekter rendres fra `projects.json`. Aktive prosjekter (`soldOut: false`) vises fremst.

### Bolig til leie
Holmestrand Utvikling har også bolig til leie via FINN (orgId 707555245, kategori `lettings`).
Vurder tilsvarende iframe:
```
https://www.finn.no/pw/search/realestate-lettings?orgId=707555245
```
Alternativt Idealista – sjekk hvilken plattform de bruker for boligannonser.

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
Til leie
  └── Næringseiendom   (FINN-iframe, orgId 707555245)
  └── Bolig / boder    (FINN-iframe eller Idealista)
Prosjekter             (fra projects.json)
Sentrumsutvikling      (redaksjonell side, innhold mangler)
Om oss                 (innhold mangler)
Kontakt
```

---

## Viktige merknader
- Logoen finnes på: `https://holmestrandutvikling.no/wp-content/uploads/2021/10/logo-1x-ny.png`
- Tagline: **«Visjoner | Planer | Utvikling»**
- Ikke kopier innhold fra dagens WordPress-side uten å rense det – den er hacket og har injisert spam
- Pris på næringslokaler er **kr/m²/år** (bekreftet mot FINN)
- Dr. Graaruds Plass 3 er et kontorhotell med to separate FINN-annonser (9–18 m² per kontor)
