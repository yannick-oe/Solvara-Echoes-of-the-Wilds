/**
 * ============================================================
 * Zentrales Tile-Registry für alle nutzbaren Kacheln im Tileset.
 * ============================================================
 *
 * Jede Kachel-Definition hat folgende Felder:
 *   txCol    – Spalte im Tileset-PNG  (0-basiert, 16 px-Gitter)
 *   txRow    – Zeile  im Tileset-PNG  (0-basiert, 16 px-Gitter)
 *   pass     – true = physikalisch durchquerbar (kein Solid-Collider)
 *   oneWay?  – true = nur von oben begehbar (One-Way-Plattform)
 *   ladder?  – true = kletterbar (Leiter-Logik)
 *   category – Kachelgruppe (für Authoring / zukünftige Tools)
 *   label    – menschenlesbarer Name (Deutsch)
 *
 * Kategorie-Bedeutungen:
 *   'ground'   – solide Erd-/Stein-Kacheln (Wald-Biom, collide)
 *   'slope'    – Schrägen; slope-wedge = pass:true, slope-fill = pass:false
 *   'platform' – One-Way-Plattformen
 *   'ladder'   – Leitern
 *   'arch'     – Architektur-Elemente (Bögen, Säulen, Holzbalken)
 *   'cave'     – Höhlen-Biom, solid
 *   'temple'   – Tempel-Biom, solid
 *   'deco'     – Rein dekorativ / kein Collider  (pass: true)
 *
 * Tileset-Atlas: 400 × 368 px → 25 Spalten × 23 Zeilen à 16 px
 *
 * Durch die Zusammenführung in TileMap (registry ← level-JSON-override)
 * können Level-JSON-Dateien einzelne Kacheln lokal überschreiben.
 * Rückwärtskompatible Schlüssel: g, d, p, l
 */

// ---------------------------------------------------------------------------
// TILE_REGISTRY  –  Flat lookup: Kürzel → Kachel-Definition
// ---------------------------------------------------------------------------
export const TILE_REGISTRY = {

  // =========================================================================
  // WALD / ERD-BIOM   (Atlas-Zeilen 1 – 11)
  // =========================================================================

  // --- Oberflächen-Zeile 1  (txRow = 1) -----------------------------------

  /** Gras-Boden  ★ Pflicht-Kürzel – bleibt kompatibel mit level_01.json */
  g:    { txCol:  1, txRow:  1, pass: false, category: 'ground',   label: 'Gras-Boden'             },
  /** Heller Erd-Block */
  dg:   { txCol:  3, txRow:  1, pass: false, category: 'ground',   label: 'Erde hell'              },
  /** Mittlerer Erd-Block */
  dv:   { txCol:  5, txRow:  1, pass: false, category: 'ground',   label: 'Erde mittel'            },
  /** Dunkle Erde / Stein  ★ Pflicht-Kürzel */
  d:    { txCol:  7, txRow:  1, pass: false, category: 'ground',   label: 'Dunkle Erde'            },

  /** Schräge rechts – Spitze (visuell, kein Solid-Collider) */
  srr:  { txCol:  9, txRow:  1, pass: true,  category: 'slope',    label: 'Schräge R Anstieg'      },
  /** Schräge rechts – innere Kurve */
  src:  { txCol: 10, txRow:  1, pass: true,  category: 'slope',    label: 'Schräge R Kurve'        },
  /** Boden-Mittelblock */
  sc:   { txCol: 11, txRow:  1, pass: false, category: 'ground',   label: 'Boden Mitte'            },

  /** Stein-Block */
  st:   { txCol: 13, txRow:  1, pass: false, category: 'ground',   label: 'Stein'                  },
  /** Stein-Block Variante */
  sta:  { txCol: 14, txRow:  1, pass: false, category: 'ground',   label: 'Stein Variante'         },
  /** Dunkler Stein */
  sd:   { txCol: 16, txRow:  1, pass: false, category: 'ground',   label: 'Stein dunkel'           },
  /** Dunkler Stein Variante */
  sda:  { txCol: 17, txRow:  1, pass: false, category: 'ground',   label: 'Stein dunkel Variante'  },

  /** Schräge rechts – breiter Gradient (visuell) */
  srg:  { txCol: 20, txRow:  1, pass: true,  category: 'slope',    label: 'Schräge R Gradient'     },
  /** Schräge rechts – dünne Spitze (visuell) */
  srt:  { txCol: 19, txRow:  1, pass: true,  category: 'slope',    label: 'Schräge R Spitze'       },
  /** Schräge links – breiter Gradient (visuell) */
  slg:  { txCol: 22, txRow:  1, pass: true,  category: 'slope',    label: 'Schräge L Gradient'     },
  /** Schräge links – dünne Spitze (visuell) */
  slt:  { txCol: 23, txRow:  1, pass: true,  category: 'slope',    label: 'Schräge L Spitze'       },

  // --- Füll-Zeile 2  (txRow = 2) ------------------------------------------

  /** Stein Füllung */
  stf:  { txCol: 13, txRow:  2, pass: false, category: 'ground',   label: 'Stein Füllung'          },
  /** Stein Variante Füllung */
  staf: { txCol: 14, txRow:  2, pass: false, category: 'ground',   label: 'Stein Var. Füllung'     },
  /** Dunkler Stein Füllung */
  sdf:  { txCol: 16, txRow:  2, pass: false, category: 'ground',   label: 'Stein dunkel Füllung'   },
  /** Dunkler Stein Var. Füllung */
  sdaf: { txCol: 17, txRow:  2, pass: false, category: 'ground',   label: 'Stein dkl Var. Füllung' },

  /** Schräge R – Füll-Block rechts */
  srfb: { txCol: 19, txRow:  2, pass: false, category: 'slope',    label: 'Schräge R Füllung'      },
  /** Schräge R – Füll-Block Mitte */
  srfm: { txCol: 20, txRow:  2, pass: false, category: 'slope',    label: 'Schräge R Füllung Mitte'},
  /** Schräge L – Füll-Block Mitte */
  slfm: { txCol: 22, txRow:  2, pass: false, category: 'slope',    label: 'Schräge L Füllung Mitte'},
  /** Schräge L – Füll-Block links */
  slfb: { txCol: 23, txRow:  2, pass: false, category: 'slope',    label: 'Schräge L Füllung'      },

  // --- Oberflächen-Zeile 3  (txRow = 3) -----------------------------------

  /** Gras-Boden Variante 2 */
  g2:   { txCol:  1, txRow:  3, pass: false, category: 'ground',   label: 'Gras-Boden Var. 2'      },
  /** Erde innen / Unterboden */
  di:   { txCol:  3, txRow:  3, pass: false, category: 'ground',   label: 'Erde Innen'             },
  /** Erd-Variante 3 */
  dv2:  { txCol:  5, txRow:  3, pass: false, category: 'ground',   label: 'Erde Variante 2'        },
  /** Dunkle Erde 2 */
  d2:   { txCol:  7, txRow:  3, pass: false, category: 'ground',   label: 'Dunkle Erde 2'          },
  /** Schräge R – Ecke 2 */
  src2: { txCol:  8, txRow:  3, pass: true,  category: 'slope',    label: 'Schräge R Ecke 2'       },
  /** Schräge L – Ecke 2 */
  slc2: { txCol: 10, txRow:  3, pass: true,  category: 'slope',    label: 'Schräge L Ecke 2'       },
  /** Erd-Kante */
  de:   { txCol: 11, txRow:  3, pass: false, category: 'ground',   label: 'Erde Kante'             },

  // --- Stein-Oberfläche + Halb-Schrägen  Zeile 4  (txRow = 4) ------------

  /** Stein Oberfläche */
  stt:  { txCol: 14, txRow:  4, pass: false, category: 'ground',   label: 'Stein Oberfläche'       },
  /** Dunkler Stein Oberfläche */
  sdt:  { txCol: 16, txRow:  4, pass: false, category: 'ground',   label: 'Stein dkl. Oberfläche'  },
  /** Halb-Schräge rechts (visuell) */
  srh:  { txCol: 20, txRow:  4, pass: true,  category: 'slope',    label: 'Halb-Schräge R'         },
  /** Halb-Schräge links (visuell) */
  slh:  { txCol: 22, txRow:  4, pass: true,  category: 'slope',    label: 'Halb-Schräge L'         },

  // --- Tiefen-Füllung + Plattformen  Zeile 5  (txRow = 5) ----------------

  /** Gras-Tiefen-Füllung */
  gf:   { txCol:  1, txRow:  5, pass: false, category: 'ground',   label: 'Gras Tiefe'             },
  /** Erde Füllung */
  df:   { txCol:  3, txRow:  5, pass: false, category: 'ground',   label: 'Erde Füllung'           },
  /** Erd-Var. Füllung */
  dvf:  { txCol:  5, txRow:  5, pass: false, category: 'ground',   label: 'Erde Var. Füllung'      },
  /** Dunkle Erde Füllung */
  ddf:  { txCol:  7, txRow:  5, pass: false, category: 'ground',   label: 'Dunkle Erde Füllung'    },

  /** One-Way-Plattform  ★ Pflicht-Kürzel */
  p:    { txCol:  8, txRow:  5, pass: false, oneWay: true, category: 'platform', label: 'Plattform'       },
  /** One-Way-Plattform Variante */
  pa:   { txCol:  9, txRow:  5, pass: false, oneWay: true, category: 'platform', label: 'Plattform Alt'   },

  /** Stein Unterfläche */
  stb:  { txCol: 14, txRow:  5, pass: false, category: 'ground',   label: 'Stein Unterfläche'      },
  /** Dunkler Stein Unterfläche */
  sdb:  { txCol: 16, txRow:  5, pass: false, category: 'ground',   label: 'Stein dkl. Unterfläche' },
  /** Schräge R – voller Füll-Keil */
  srs:  { txCol: 20, txRow:  5, pass: false, category: 'slope',    label: 'Schräge R Keil'         },
  /** Schräge L – voller Füll-Keil */
  sls:  { txCol: 22, txRow:  5, pass: false, category: 'slope',    label: 'Schräge L Keil'         },

  // --- Deko / Trim-Zeile 7  (txRow = 7) -----------------------------------

  /** Gras-Büschel links (rein dekorativ, pass:true) */
  gtl:  { txCol:  1, txRow:  7, pass: true,  category: 'deco',     label: 'Gras-Büschel L'         },
  /** Gras-Büschel rechts (rein dekorativ) */
  gtr:  { txCol:  3, txRow:  7, pass: true,  category: 'deco',     label: 'Gras-Büschel R'         },
  /** Holzblock / Stamm links */
  ll2:  { txCol:  5, txRow:  7, pass: false, category: 'ground',   label: 'Holzblock L'            },
  /** Holzblock / Stamm rechts */
  lr2:  { txCol:  7, txRow:  7, pass: false, category: 'ground',   label: 'Holzblock R'            },
  /** Deko-Ecke links (halbtransparent) */
  dcl:  { txCol:  9, txRow:  7, pass: true,  category: 'deco',     label: 'Deko Ecke L'            },
  /** Deko-Ecke rechts (halbtransparent) */
  dcr:  { txCol: 11, txRow:  7, pass: true,  category: 'deco',     label: 'Deko Ecke R'            },
  /** Bogen-/Pillar-Block A */
  ab:   { txCol: 15, txRow:  7, pass: false, category: 'arch',     label: 'Bogenpfeiler A'         },
  /** Bogen-Block B */
  ab2:  { txCol: 17, txRow:  7, pass: false, category: 'arch',     label: 'Bogenpfeiler B'         },
  /** Bogen-Block C */
  ab3:  { txCol: 19, txRow:  7, pass: false, category: 'arch',     label: 'Bogenpfeiler C'         },

  // --- Säulen-Reihe 9  (txRow = 9) ----------------------------------------

  /** Säule oben */
  pt:   { txCol: 15, txRow:  9, pass: false, category: 'arch',     label: 'Säule oben'             },
  /** Säule Mitte */
  pm:   { txCol: 17, txRow:  9, pass: false, category: 'arch',     label: 'Säule Mitte'            },
  /** Säule unten */
  pb:   { txCol: 19, txRow:  9, pass: false, category: 'arch',     label: 'Säule unten'            },

  // --- Bogen + Leiter + Spezial  Zeile 10  (txRow = 10) ------------------

  /** Bogen – obere linke Zwickel (halbtransparent) */
  atl:  { txCol:  1, txRow: 10, pass: true,  category: 'arch',     label: 'Bogen oben L'           },
  /** Bogen – oberer Mittelbogen links */
  atm:  { txCol:  2, txRow: 10, pass: false, category: 'arch',     label: 'Bogen oben Mitte L'     },
  /** Bogen – oberer Mittelbogen rechts */
  atr:  { txCol:  4, txRow: 10, pass: false, category: 'arch',     label: 'Bogen oben Mitte R'     },
  /** Bogen – obere rechte Zwickel */
  ate:  { txCol:  5, txRow: 10, pass: true,  category: 'arch',     label: 'Bogen oben R'           },

  /** Leiter  ★ Pflicht-Kürzel */
  l:    { txCol:  7, txRow: 10, pass: true,  ladder: true, category: 'ladder', label: 'Leiter' },

  /** Fass / Kiste – linke Hälfte (dekorativ) */
  brl:  { txCol: 10, txRow: 10, pass: true,  category: 'deco',     label: 'Behälter L'             },
  /** Fass / Kiste – rechte Hälfte */
  brr:  { txCol: 11, txRow: 10, pass: true,  category: 'deco',     label: 'Behälter R'             },

  // --- Bogen-Unterzeile 11  (txRow = 11) ----------------------------------

  /** Bogen – untere linke Zwickel */
  abl:  { txCol:  2, txRow: 11, pass: true,  category: 'arch',     label: 'Bogen unten L'          },
  /** Bogen – untere rechte Zwickel */
  abr:  { txCol:  4, txRow: 11, pass: true,  category: 'arch',     label: 'Bogen unten R'          },
  /** Tempel-Block 1 */
  tb:   { txCol: 15, txRow: 11, pass: false, category: 'arch',     label: 'Tempel-Block 1'         },
  /** Tempel-Block 2 */
  tba:  { txCol: 17, txRow: 11, pass: false, category: 'arch',     label: 'Tempel-Block 2'         },
  /** Tempel-Block dunkel */
  tbd:  { txCol: 19, txRow: 11, pass: false, category: 'arch',     label: 'Tempel-Block dunkel'    },

  // =========================================================================
  // HÖHLEN-BIOM   (Atlas-Zeilen 13 – 21)
  // =========================================================================

  // --- Höhlen-Blöcke  Zeile 13  (txRow = 13) ------------------------------

  cb1:  { txCol:  7, txRow: 13, pass: false, category: 'cave',     label: 'Höhlenblock 1'          },
  cb2:  { txCol:  9, txRow: 13, pass: false, category: 'cave',     label: 'Höhlenblock 2'          },
  cb3:  { txCol: 11, txRow: 13, pass: false, category: 'cave',     label: 'Höhlenblock 3'          },
  cb4:  { txCol: 13, txRow: 13, pass: false, category: 'cave',     label: 'Höhlenblock 4'          },

  // --- Höhlen-Wände + Tempel  Zeile 14  (txRow = 14) ---------------------

  cw1:  { txCol:  7, txRow: 14, pass: false, category: 'cave',     label: 'Höhlenwand 1'           },
  cw2:  { txCol:  9, txRow: 14, pass: false, category: 'cave',     label: 'Höhlenwand 2'           },
  cw3:  { txCol: 11, txRow: 14, pass: false, category: 'cave',     label: 'Höhlenwand 3'           },
  /** Tempel-Kachel linke Hälfte */
  tbt:  { txCol: 15, txRow: 14, pass: false, category: 'temple',   label: 'Tempel-Kachel L'        },
  /** Tempel-Kachel Mitte */
  tbm:  { txCol: 17, txRow: 14, pass: false, category: 'temple',   label: 'Tempel-Kachel Mitte'    },
  /** Tempel-Kachel rechte Hälfte */
  tbe:  { txCol: 19, txRow: 14, pass: false, category: 'temple',   label: 'Tempel-Kachel R'        },

  // --- Höhlen-Bogenbau  Zeile 15  (txRow = 15) ----------------------------

  cl1:  { txCol:  1, txRow: 15, pass: true,  category: 'cave',     label: 'Höhlenbogen oben L'     },
  cl2:  { txCol:  2, txRow: 15, pass: false, category: 'cave',     label: 'Höhlenbogen oben M-L'   },
  cl3:  { txCol:  4, txRow: 15, pass: false, category: 'cave',     label: 'Höhlenbogen oben M-R'   },
  cl4:  { txCol:  5, txRow: 15, pass: true,  category: 'cave',     label: 'Höhlenbogen oben R'     },
  /** Höhlen-Plattform (solid) */
  cp:   { txCol:  9, txRow: 15, pass: false, category: 'cave',     label: 'Höhlen-Plattform'       },

  // --- Höhlen-Bogen Mitte  Zeile 16  (txRow = 16) -------------------------

  cm1:  { txCol:  2, txRow: 16, pass: false, category: 'cave',     label: 'Höhlenbogen Mitte L'    },
  cm2:  { txCol:  4, txRow: 16, pass: false, category: 'cave',     label: 'Höhlenbogen Mitte R'    },
  /** Höhlen-Ranken-Wand */
  cv1:  { txCol: 11, txRow: 16, pass: false, category: 'cave',     label: 'Höhle Ranken-Wand'      },
  ts1:  { txCol: 14, txRow: 16, pass: false, category: 'temple',   label: 'Tempel-Stein 1'         },
  ts2:  { txCol: 15, txRow: 16, pass: false, category: 'temple',   label: 'Tempel-Stein 2'         },
  ts3:  { txCol: 17, txRow: 16, pass: false, category: 'temple',   label: 'Tempel-Stein 3'         },
  ts4:  { txCol: 18, txRow: 16, pass: false, category: 'temple',   label: 'Tempel-Stein 4'         },
  ts5:  { txCol: 19, txRow: 16, pass: false, category: 'temple',   label: 'Tempel-Stein 5'         },

  // --- Höhlen-Bogen unten  Zeile 17  (txRow = 17) -------------------------

  cb5:  { txCol:  1, txRow: 17, pass: true,  category: 'cave',     label: 'Höhlenbogen unten L'    },
  cb6:  { txCol:  2, txRow: 17, pass: false, category: 'cave',     label: 'Höhlenbogen unten M-L'  },
  cb7:  { txCol:  4, txRow: 17, pass: false, category: 'cave',     label: 'Höhlenbogen unten M-R'  },
  cb8:  { txCol:  5, txRow: 17, pass: true,  category: 'cave',     label: 'Höhlenbogen unten R'    },
  cv2:  { txCol: 11, txRow: 17, pass: false, category: 'cave',     label: 'Höhle Ranken-Wand 2'    },
  ts6:  { txCol: 14, txRow: 17, pass: false, category: 'temple',   label: 'Tempel-Stein 6'         },
  ts7:  { txCol: 15, txRow: 17, pass: false, category: 'temple',   label: 'Tempel-Stein 7'         },

  // --- Höhlen-Boden + Deko  Zeile 18  (txRow = 18) -----------------------

  cfl:  { txCol:  1, txRow: 18, pass: false, category: 'cave',     label: 'Höhlenboden L'          },
  cfc:  { txCol:  2, txRow: 18, pass: false, category: 'cave',     label: 'Höhlenboden Mitte'      },
  cfr:  { txCol:  4, txRow: 18, pass: false, category: 'cave',     label: 'Höhlenboden Mitte R'    },
  cfre: { txCol:  5, txRow: 18, pass: false, category: 'cave',     label: 'Höhlenboden R'          },
  cvd:  { txCol: 10, txRow: 18, pass: true,  category: 'deco',     label: 'Höhlen-Deko Overlay'    },
  cvs:  { txCol: 11, txRow: 18, pass: false, category: 'cave',     label: 'Höhle Ranken-Ecke'      },
  cvc:  { txCol: 12, txRow: 18, pass: false, category: 'cave',     label: 'Höhle Ranken-Winkel'    },
  ta1:  { txCol: 14, txRow: 18, pass: false, category: 'temple',   label: 'Tempel-Wand 1'          },
  ta2:  { txCol: 15, txRow: 18, pass: false, category: 'temple',   label: 'Tempel-Wand 2'          },
  /** Tempel-Deko (Fackel/Ranke-Overlay, pass:true) */
  tv1:  { txCol: 17, txRow: 18, pass: true,  category: 'deco',     label: 'Tempel-Deko 1'          },
  tv2:  { txCol: 19, txRow: 18, pass: true,  category: 'deco',     label: 'Tempel-Deko 2'          },
  tv3:  { txCol: 21, txRow: 18, pass: true,  category: 'deco',     label: 'Tempel-Deko 3'          },

  // --- Tempel-Säule + Dunkle Höhle + Lila Blöcke  Zeile 20  (txRow = 20) -

  /** Tempel-Säule oben */
  ctp1: { txCol:  1, txRow: 20, pass: false, category: 'temple',   label: 'Tempel-Säule oben'      },
  /** Tempel-Bogen – linker Bogen */
  ctp2: { txCol:  3, txRow: 20, pass: false, category: 'temple',   label: 'Tempel-Bogen L'         },
  /** Tempel-Bogen – rechter Bogen */
  ctp3: { txCol:  4, txRow: 20, pass: false, category: 'temple',   label: 'Tempel-Bogen R'         },
  cbd1: { txCol:  9, txRow: 20, pass: false, category: 'cave',     label: 'Höhle dunkel 1'         },
  cbd2: { txCol: 10, txRow: 20, pass: false, category: 'cave',     label: 'Höhle dunkel 2'         },
  cbd3: { txCol: 11, txRow: 20, pass: false, category: 'cave',     label: 'Höhle dunkel 3'         },
  /** Lila Deko-Overlay (pass:true) */
  pvd:  { txCol: 13, txRow: 20, pass: true,  category: 'deco',     label: 'Lila Deko'              },
  pvb1: { txCol: 14, txRow: 20, pass: false, category: 'cave',     label: 'Lila Block 1'           },
  pvb2: { txCol: 15, txRow: 20, pass: false, category: 'cave',     label: 'Lila Block 2'           },
  pvb3: { txCol: 17, txRow: 20, pass: false, category: 'cave',     label: 'Lila Block 3'           },

  // --- Tempel-Bogen Boden + Höhlen-Boden  Zeile 21  (txRow = 21) ---------

  /** Tempel-Bogen Boden links */
  ctp4: { txCol:  3, txRow: 21, pass: false, category: 'temple',   label: 'Tempel-Bogen Boden L'   },
  /** Tempel-Bogen Boden rechts */
  ctp5: { txCol:  4, txRow: 21, pass: false, category: 'temple',   label: 'Tempel-Bogen Boden R'   },
  cbd4: { txCol:  9, txRow: 21, pass: false, category: 'cave',     label: 'Höhle dunkel Boden 1'   },
  cbd5: { txCol: 10, txRow: 21, pass: false, category: 'cave',     label: 'Höhle dunkel Boden 2'   },
  cbd6: { txCol: 11, txRow: 21, pass: false, category: 'cave',     label: 'Höhle dunkel Boden 3'   },
  pvb4: { txCol: 13, txRow: 21, pass: false, category: 'cave',     label: 'Lila Block Boden 1'     },
  pvb5: { txCol: 14, txRow: 21, pass: false, category: 'cave',     label: 'Lila Block Boden 2'     },
  pvb6: { txCol: 15, txRow: 21, pass: false, category: 'cave',     label: 'Lila Block Boden 3'     },
};


// ---------------------------------------------------------------------------
// Abgeleitete Lookups
// ---------------------------------------------------------------------------

/**
 * Kacheln gruppiert nach Kategorie.
 * { ground: ['g','dg',...], slope: [...], ... }
 */
export const TILE_KEYS_BY_CATEGORY = Object.entries(TILE_REGISTRY).reduce(
  (acc, [key, def]) => {
    (acc[def.category] ??= []).push(key);
    return acc;
  },
  /** @type {Record<string, string[]>} */ ({}),
);

/**
 * Alle Kürzel, die einen physikalischen Collider erzeugen
 * (pass === false, also solid ODER oneWay).
 */
export const COLLIDABLE_TILE_KEYS = Object.entries(TILE_REGISTRY)
  .filter(([, def]) => def.pass === false)
  .map(([key]) => key);

/**
 * Alle rein dekorativen Kürzel (pass === true, kein ladder).
 */
export const DECO_TILE_KEYS = Object.entries(TILE_REGISTRY)
  .filter(([, def]) => def.pass === true && !def.ladder)
  .map(([key]) => key);
