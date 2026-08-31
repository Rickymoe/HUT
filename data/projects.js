// Kanonisk prosjektliste. Prosjektsiden bruker alle felt; forsiden viser
// de 3 første og foretrekker cardName / cardStatusLabel / cardSummary når de finnes.
window.HUT_PROJECTS = [
  {
    id: "langgaten-24", name: "Langgaten 24", tagline: "Et betydelig løft for sentrum",
    status: "under_regulering", statusLabel: "Under regulering", soldOut: false,
    completionYear: null, typeLabel: "Bolig og næring",
    units: { apartments: null, apartmentsApprox: "65–70" },
    summary: "Nytt sentrumsprosjekt på tomta der det tidligere lå en bensinstasjon. Planlagt som to bygg – ett på fem og ett på seksten etasjer – som kombinerer leiligheter og næringsarealer.",
    highlights: ["Ca. 65–70 nye leiligheter", "Nye næringsarealer", "To bygg: 5 og 16 etasjer"],
    media: { hero: "Prosjekter/Langgaten24/Langgaten24.png" },
    cardStatusLabel: "Under regulering",
    cardSummary: "Nytt sentrumsprosjekt på tomta der det tidligere lå en bensinstasjon. To bygg på fem og seksten etasjer med leiligheter og næringsarealer."
  },
  {
    id: "holmestrand-brygge", name: "Holmestrand Brygge", tagline: "Byen på brygga",
    status: "ferdigstilt", statusLabel: "Sluttsolgt og ferdigstilt", soldOut: true,
    completionYear: 2021, typeLabel: "Bolig og næring",
    units: { apartments: 75, apartmentsApprox: null },
    summary: "Ferdigstilt boligprosjekt på brygga i Holmestrand med 75 leiligheter og nye næringslokaler. Sluttsolgt i 2021.",
    highlights: ["75 nye leiligheter", "Nye næringslokaler", "Sentral beliggenhet på brygga"],
    media: { hero: "Prosjekter/HolmestrandBrygge/HolmestranBrygge.png" },
    cardStatusLabel: "Ferdigstilt 2021",
    cardSummary: "75 leiligheter og nye næringslokaler på brygga i Holmestrand. Binder sentrum til sjøkanten."
  },
  {
    id: "bibliotekkvartalet-3-kapittel", name: "Bibliotekkvartalet – Tredje kapittel", tagline: "Tredje kapittel",
    status: "ferdigstilt", statusLabel: "Sluttsolgt og ferdigstilt", soldOut: true,
    completionYear: 2018, typeLabel: "Bolig",
    units: { apartments: 26, apartmentsApprox: null },
    summary: "Tredje og siste byggetrinn i Bibliotekkvartalet, med 12 familieleiligheter og 14 kompakte leiligheter. Sluttsolgt og ferdigstilt i 2018.",
    highlights: ["12 familieleiligheter", "14 kompakte leiligheter"],
    media: { hero: "Prosjekter/Biblitekkvartalet.kap3/Bibliotekkvartalet.kap3.png" },
    cardName: "Bibliotekkvartalet",
    cardStatusLabel: "Ferdigstilt",
    cardSummary: "Tre byggetrinn med til sammen 68 leiligheter i historiske omgivelser midt i Holmestrand sentrum."
  },
  {
    id: "bibliotekkvartalet-2-kapittel", name: "Bibliotekkvartalet – Andre kapittel", tagline: "Andre kapittel",
    status: "ferdigstilt", statusLabel: "Sluttsolgt og ferdigstilt", soldOut: true,
    completionYear: 2018, typeLabel: "Bolig",
    units: { apartments: 23, apartmentsApprox: null },
    summary: "Andre byggetrinn i Bibliotekkvartalet, med 7 familieleiligheter og 16 kompakte leiligheter. Sluttsolgt og ferdigstilt i 2018.",
    highlights: ["7 familieleiligheter", "16 kompakte leiligheter"],
    media: { hero: "Prosjekter/Bibliotekkvartalet.kap2/Bibliotekkvartalet.kap2.png" }
  },
  {
    id: "bibliotekkvartalet-1-kapittel", name: "Bibliotekkvartalet – Første kapittel", tagline: "Første kapittel",
    status: "ferdigstilt", statusLabel: "Sluttsolgt og ferdigstilt", soldOut: true,
    completionYear: 2017, typeLabel: "Bolig",
    units: { apartments: 19, apartmentsApprox: null },
    summary: "Første byggetrinn i Bibliotekkvartalet, med 10 unike utsiktsleiligheter og 9 kompakte leiligheter. Sluttsolgt og ferdigstilt i 2017.",
    highlights: ["10 unike utsiktsleiligheter", "9 kompakte leiligheter"],
    media: { hero: "Prosjekter/Bibliotekkvartalet.kap1/Bibliotekkvartalet.kap1.png" }
  },
  {
    id: "dr-graaruds-plass-1-3", name: "Dr. Graaruds Plass 1–3", tagline: null,
    status: "ferdigstilt", statusLabel: "Sluttsolgt og ferdigstilt", soldOut: true,
    completionYear: 2012, typeLabel: "Bolig og næring",
    units: { apartments: 39, apartmentsApprox: null },
    summary: "Ferdigstilt prosjekt med 39 leiligheter og nye næringsarealer på Dr. Graaruds Plass. Sluttsolgt og ferdigstilt i 2012.",
    highlights: ["39 nye leiligheter", "Nye næringsarealer"],
    media: { hero: "Prosjekter/DrGraarudsPlass/DrGraarudsplass.png" }
  }
];
