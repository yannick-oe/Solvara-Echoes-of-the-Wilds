// #region Constants
const LEGACY_TILE_REGISTRY = {

  g:    { txCol:  1, txRow:  1, pass: false, category: 'ground',   label: 'Grass Ground'             },
  dg:   { txCol:  3, txRow:  1, pass: false, category: 'ground',   label: 'Light Dirt'              },
  dv:   { txCol:  5, txRow:  1, pass: false, category: 'ground',   label: 'Mid Dirt'            },
  d:    { txCol:  7, txRow:  1, pass: false, category: 'ground',   label: 'Dark Dirt'            },
  srr:  { txCol:  9, txRow:  1, pass: false,  category: 'slope',    label: 'Right Slope Rise'      },
  src:  { txCol: 10, txRow:  1, pass: false,  category: 'slope',    label: 'Right Slope Curve'        },
  sc:   { txCol: 11, txRow:  1, pass: false, category: 'ground',   label: 'Ground Center'            },
  st:   { txCol: 13, txRow:  1, pass: false, category: 'ground',   label: 'Stone'                  },
  sta:  { txCol: 14, txRow:  1, pass: false, category: 'ground',   label: 'Stone Variant'         },
  sd:   { txCol: 16, txRow:  1, pass: false, category: 'ground',   label: 'Dark Stone'           },
  sda:  { txCol: 17, txRow:  1, pass: false, category: 'ground',   label: 'Dark Stone Variant'  },
  srg:  { txCol: 20, txRow:  1, pass: true,  category: 'slope',    label: 'Right Slope Gradient'     },
  srt:  { txCol: 19, txRow:  1, pass: true,  category: 'slope',    label: 'Right Slope Tip'       },
  slg:  { txCol: 22, txRow:  1, pass: true,  category: 'slope',    label: 'Left Slope Gradient'     },
  slt:  { txCol: 23, txRow:  1, pass: true,  category: 'slope',    label: 'Left Slope Tip'       },
  stf:  { txCol: 13, txRow:  2, pass: false, category: 'ground',   label: 'Stone Fill'          },
  staf: { txCol: 14, txRow:  2, pass: false, category: 'ground',   label: 'Stone Variant Fill'     },
  sdf:  { txCol: 16, txRow:  2, pass: false, category: 'ground',   label: 'Dark Stone Fill'   },
  sdaf: { txCol: 17, txRow:  2, pass: false, category: 'ground',   label: 'Dark Stone Variant Fill' },
  srfb: { txCol: 19, txRow:  2, pass: false, category: 'slope',    label: 'Right Slope Fill'      },
  srfm: { txCol: 20, txRow:  2, pass: false, category: 'slope',    label: 'Right Slope Fill Center'},
  slfm: { txCol: 22, txRow:  2, pass: false, category: 'slope',    label: 'Left Slope Fill Center'},
  slfb: { txCol: 23, txRow:  2, pass: false, category: 'slope',    label: 'Left Slope Fill'      },
  g2:   { txCol:  1, txRow:  3, pass: false, category: 'ground',   label: 'Grass Ground Variant 2'      },
  di:   { txCol:  3, txRow:  3, pass: false, category: 'ground',   label: 'Inner Dirt'             },
  dv2:  { txCol:  5, txRow:  3, pass: false, category: 'ground',   label: 'Dirt Variant 2'        },
  d2:   { txCol:  7, txRow:  3, pass: false, category: 'ground',   label: 'Dark Dirt 2'          },
  src2: { txCol:  8, txRow:  3, pass: true,  category: 'slope',    label: 'Right Slope Corner 2'       },
  slc2: { txCol: 10, txRow:  3, pass: true,  category: 'slope',    label: 'Left Slope Corner 2'       },
  de:   { txCol: 11, txRow:  3, pass: false, category: 'ground',   label: 'Dirt Edge'             },
  stt:  { txCol: 14, txRow:  4, pass: false, category: 'ground',   label: 'Stone Top'       },
  sdt:  { txCol: 16, txRow:  4, pass: false, category: 'ground',   label: 'Dark Stone Top'  },
  srh:  { txCol: 20, txRow:  4, pass: true,  category: 'slope',    label: 'Half Right Slope'         },
  slh:  { txCol: 22, txRow:  4, pass: true,  category: 'slope',    label: 'Half Left Slope'         },
  gf:   { txCol:  1, txRow:  5, pass: false, category: 'ground',   label: 'Deep Grass'             },
  df:   { txCol:  3, txRow:  5, pass: false, category: 'ground',   label: 'Dirt Fill'           },
  dvf:  { txCol:  5, txRow:  5, pass: false, category: 'ground',   label: 'Dirt Variant Fill'      },
  ddf:  { txCol:  7, txRow:  5, pass: false, category: 'ground',   label: 'Dark Dirt Fill'    },
  p:    { txCol:  8, txRow:  5, pass: false, oneWay: true, category: 'platform', label: 'Platform'       },
  pa:   { txCol:  9, txRow:  5, pass: false, oneWay: true, category: 'platform', label: 'Old Platform'   },
  stb:  { txCol: 14, txRow:  5, pass: false, category: 'ground',   label: 'Stone Bottom'      },
  sdb:  { txCol: 16, txRow:  5, pass: false, category: 'ground',   label: 'Dark Stone Bottom' },
  srs:  { txCol: 20, txRow:  5, pass: false, category: 'slope',    label: 'Right Slope Wedge'         },
  sls:  { txCol: 22, txRow:  5, pass: false, category: 'slope',    label: 'Left Slope Wedge'         },
  gtl:  { txCol:  1, txRow:  7, pass: true,  category: 'deco',     label: 'Grass Clump Left'         },
  gtr:  { txCol:  3, txRow:  7, pass: true,  category: 'deco',     label: 'Grass Clump Right'         },
  ll2:  { txCol:  5, txRow:  7, pass: false, category: 'ground',   label: 'Wood Block Left'            },
  lr2:  { txCol:  7, txRow:  7, pass: false, category: 'ground',   label: 'Wood Block Right'            },
  dcl:  { txCol:  9, txRow:  7, pass: true,  category: 'deco',     label: 'Deco Corner Left'            },
  dcr:  { txCol: 11, txRow:  7, pass: true,  category: 'deco',     label: 'Deco Corner Right'            },
  ab:   { txCol: 15, txRow:  7, pass: false, category: 'arch',     label: 'Arch Pillar A'         },
  ab2:  { txCol: 17, txRow:  7, pass: false, category: 'arch',     label: 'Arch Pillar B'         },
  ab3:  { txCol: 19, txRow:  7, pass: false, category: 'arch',     label: 'Arch Pillar C'         },
  pt:   { txCol: 15, txRow:  9, pass: false, category: 'arch',     label: 'Column Top'             },
  pm:   { txCol: 17, txRow:  9, pass: false, category: 'arch',     label: 'Column Center'            },
  pb:   { txCol: 19, txRow:  9, pass: false, category: 'arch',     label: 'Column Bottom'            },
  atl:      { txCol:  1, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Left'          },
  atm:      { txCol:  2, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Mid Left'    },
  atr:      { txCol:  4, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Mid Right'    },
  ate:      { txCol:  5, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Right'          },
  atlCave:  { txCol:  1, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Left (Cave)',       bgFill: '#2f2540' },
  atmCave:  { txCol:  2, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Mid Left (Cave)', bgFill: '#2f2540' },
  atrCave:  { txCol:  4, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Mid Right (Cave)', bgFill: '#2f2540' },
  ateCave:  { txCol:  5, txRow: 10, pass: false,  category: 'arch', label: 'Arch Top Right (Cave)',       bgFill: '#2f2540' },
  l:    { txCol:  7, txRow: 10, pass: true,  ladder: true, category: 'ladder', label: 'Ladder' },
  brl:  { txCol: 10, txRow: 10, pass: true,  category: 'deco',     label: 'Container Left'             },
  brr:  { txCol: 11, txRow: 10, pass: true,  category: 'deco',     label: 'Container Right'             },
  abl:      { txCol:  2, txRow: 11, pass: false,  category: 'arch', label: 'Arch Bottom Left'         },
  abr:      { txCol:  4, txRow: 11, pass: false,  category: 'arch', label: 'Arch Bottom Right'         },
  ablCave:  { txCol:  2, txRow: 11, pass: false,  category: 'arch', label: 'Arch Bottom Left (Cave)', bgFill: '#2f2540' },
  abrCave:  { txCol:  4, txRow: 11, pass: false,  category: 'arch', label: 'Arch Bottom Right (Cave)', bgFill: '#2f2540' },
  tb:   { txCol: 15, txRow: 11, pass: true, category: 'arch',     label: 'Temple Block 1'         },
  tba:  { txCol: 17, txRow: 11, pass: true, category: 'arch',     label: 'Temple Block 2'         },
  tbd:  { txCol: 19, txRow: 11, pass: true, category: 'arch',     label: 'Temple Block Dark'    },
  cb1:  { txCol:  7, txRow: 13, pass: true, category: 'cave',     label: 'Cave Block 1'          },
  cb2:  { txCol:  9, txRow: 13, pass: true, category: 'cave',     label: 'Cave Block 2'          },
  cb3:  { txCol: 11, txRow: 13, pass: true, category: 'cave',     label: 'Cave Block 3'          },
  cb4:  { txCol: 13, txRow: 13, pass: true, category: 'cave',     label: 'Cave Block 4'          },
  cw1:  { txCol:  7, txRow: 14, pass: true, category: 'cave',     label: 'Cave Wall 1'           },
  cw2:  { txCol:  9, txRow: 14, pass: true, category: 'cave',     label: 'Cave Wall 2'           },
  cw3:  { txCol: 11, txRow: 14, pass: true, category: 'cave',     label: 'Cave Wall 3'           },
  tbt:  { txCol: 15, txRow: 14, pass: true, category: 'temple',   label: 'Temple Tile Left'        },
  tbm:  { txCol: 17, txRow: 14, pass: true, category: 'temple',   label: 'Temple Tile Center'    },
  tbe:  { txCol: 19, txRow: 14, pass: true, category: 'temple',   label: 'Temple Tile Right'        },
  cl1:  { txCol:  1, txRow: 15, pass: true,  category: 'cave',     label: 'Cave Arch Top Left'     },
  cl2:  { txCol:  2, txRow: 15, pass: true, category: 'cave',     label: 'Cave Arch Top Mid Left'   },
  cl3:  { txCol:  4, txRow: 15, pass: true, category: 'cave',     label: 'Cave Arch Top Mid Right'   },
  cl4:  { txCol:  5, txRow: 15, pass: true,  category: 'cave',     label: 'Cave Arch Top Right'     },
  cp:   { txCol:  9, txRow: 15, pass: true, category: 'cave',     label: 'Cave Platform'       },
  cm1:  { txCol:  2, txRow: 16, pass: false, category: 'cave',     label: 'Cave Arch Middle Left'    },
  cm2:  { txCol:  4, txRow: 16, pass: false, category: 'cave',     label: 'Cave Arch Middle Right'    },
  cv1:  { txCol: 11, txRow: 16, pass: true, category: 'cave',     label: 'Cave Vine Wall'      },
  ts1:  { txCol: 14, txRow: 16, pass: true, category: 'temple',   label: 'Temple Stone 1'         },
  ts2:  { txCol: 15, txRow: 16, pass: true, category: 'temple',   label: 'Temple Stone 2'         },
  ts3:  { txCol: 17, txRow: 16, pass: true, category: 'temple',   label: 'Temple Stone 3'         },
  ts4:  { txCol: 18, txRow: 16, pass: true, category: 'temple',   label: 'Temple Stone 4'         },
  ts5:  { txCol: 19, txRow: 16, pass: true, category: 'temple',   label: 'Temple Stone 5'         },
  cb5:  { txCol:  1, txRow: 17, pass: true,  category: 'cave',     label: 'Cave Arch Bottom Left'    },
  cb6:  { txCol:  2, txRow: 17, pass: true, category: 'cave',     label: 'Cave Arch Bottom Mid Left'  },
  cb7:  { txCol:  4, txRow: 17, pass: true, category: 'cave',     label: 'Cave Arch Bottom Mid Right'  },
  cb8:  { txCol:  5, txRow: 17, pass: true,  category: 'cave',     label: 'Cave Arch Bottom Right'    },
  cv2:  { txCol: 11, txRow: 17, pass: true, category: 'cave',     label: 'Cave Vine Wall 2'    },
  ts6:  { txCol: 14, txRow: 17, pass: true, category: 'temple',   label: 'Temple Stone 6'         },
  ts7:  { txCol: 15, txRow: 17, pass: true, category: 'temple',   label: 'Temple Stone 7'         },
  cfl:  { txCol:  1, txRow: 18, pass: true, category: 'cave',     label: 'Cave Floor Left'          },
  cfc:  { txCol:  2, txRow: 18, pass: true, category: 'cave',     label: 'Cave Floor Center'      },
  cfr:  { txCol:  4, txRow: 18, pass: true, category: 'cave',     label: 'Cave Floor Mid Right'    },
  cfre: { txCol:  5, txRow: 18, pass: true, category: 'cave',     label: 'Cave Floor Right'          },
  cvd:  { txCol: 10, txRow: 18, pass: true,  category: 'deco',     label: 'Cave Deco Overlay'    },
  cvs:  { txCol: 11, txRow: 18, pass: true, category: 'cave',     label: 'Cave Vine Corner'      },
  cvc:  { txCol: 12, txRow: 18, pass: true, category: 'cave',     label: 'Cave Vine Angle'    },
  ta1:  { txCol: 14, txRow: 18, pass: true, category: 'temple',   label: 'Temple Wall 1'          },
  ta2:  { txCol: 15, txRow: 18, pass: true, category: 'temple',   label: 'Temple Wall 2'          },
  tv1:  { txCol: 17, txRow: 18, pass: true,  category: 'deco',     label: 'Temple Deco 1'          },
  tv2:  { txCol: 19, txRow: 18, pass: true,  category: 'deco',     label: 'Temple Deco 2'          },
  tv3:  { txCol: 21, txRow: 18, pass: true,  category: 'deco',     label: 'Temple Deco 3'          },
  ctp1: { txCol:  1, txRow: 20, pass: true, category: 'temple',   label: 'Temple Column Top'      },
  ctp2: { txCol:  3, txRow: 20, pass: true, category: 'temple',   label: 'Temple Arch Left'         },
  ctp3: { txCol:  4, txRow: 20, pass: true, category: 'temple',   label: 'Temple Arch Right'         },
  cbd1: { txCol:  9, txRow: 20, pass: true, category: 'cave',     label: 'Dark Cave 1'         },
  cbd2: { txCol: 10, txRow: 20, pass: true, category: 'cave',     label: 'Dark Cave 2'         },
  cbd3: { txCol: 11, txRow: 20, pass: true, category: 'cave',     label: 'Dark Cave 3'         },
  pvd:  { txCol: 13, txRow: 20, pass: true,  category: 'deco',     label: 'Purple Deco'              },
  pvb1: { txCol: 14, txRow: 20, pass: true, category: 'cave',     label: 'Purple Block 1'           },
  pvb2: { txCol: 15, txRow: 20, pass: true, category: 'cave',     label: 'Purple Block 2'           },
  pvb3: { txCol: 17, txRow: 20, pass: true, category: 'cave',     label: 'Purple Block 3'           },
  ctp4: { txCol:  3, txRow: 21, pass: false, category: 'temple',   label: 'Temple Arch Floor Left'   },
  ctp5: { txCol:  4, txRow: 21, pass: false, category: 'temple',   label: 'Temple Arch Floor Right'   },
  cbd4: { txCol:  9, txRow: 21, pass: false, category: 'cave',     label: 'Dark Cave Floor 1'   },
  cbd5: { txCol: 10, txRow: 21, pass: false, category: 'cave',     label: 'Dark Cave Floor 2'   },
  cbd6: { txCol: 11, txRow: 21, pass: false, category: 'cave',     label: 'Dark Cave Floor 3'   },
  pvb4: { txCol: 13, txRow: 21, pass: false, category: 'cave',     label: 'Purple Block Floor 1'     },
  pvb5: { txCol: 14, txRow: 21, pass: false, category: 'cave',     label: 'Purple Block Floor 2'     },
  pvb6: { txCol: 15, txRow: 21, pass: false, category: 'cave',     label: 'Purple Block Floor 3'     },
};

/** Builds canonical Key. @param {*} def - Def value. @returns {*} - Resulting value. */
function buildCanonicalKey(def) {
  const key = toCamelKey(def.label);
  if (!def.oneWay) return key;
  if (key === 'platform') return 'oneWayPlatform';
  if (key === 'oldPlatform') return 'oldOneWayPlatform';
  return key;
}

/** Handles to Camel Key. @param {*} label - Label value. @returns {string} - Derived text value. */
function toCamelKey(label) {
  const words = extractKeyWords(label);
  const [first, ...rest] = words;
  const tail = rest.map(cap).join('');
  return `${first.toLowerCase()}${tail}`;
}

/** Handles extract Key Words. @param {*} label - Label value. @returns {*} - Resulting value. */
function extractKeyWords(label) {
  const sanitized = label.replace(/[()./,-]/g, ' ').replace(/\s+/g, ' ').trim();
  return sanitized.match(/[A-Za-z0-9]+/g) ?? ['tile'];
}

/** Handles cap. @param {*} value - Value to apply. @returns {string} - Derived text value. */
function cap(value) {
  const clean = value.replace(/[^A-Za-z0-9]/g, '');
  if (!clean) return 'Tile';
  return clean[0].toUpperCase() + clean.slice(1);
}

/** Builds canonical Registry. @param {*} legacyRegistry - Legacy Registry value. @returns {*} - Resulting value. */
function buildCanonicalRegistry(legacyRegistry) {
  const registry = {};
  const aliases = {};
  for (const [legacyKey, def] of Object.entries(legacyRegistry)) {
    const baseKey = buildCanonicalKey(def);
    const key = uniqueCanonicalKey(registry, baseKey);
    registry[key] = { ...def, canonicalName: key };
    aliases[legacyKey] = key;
  }
  return { registry, aliases };
}

/** Handles unique Canonical Key. @param {*} registry - Registry value. @param {*} baseKey - Base Key value. @returns {*} - Resulting value. */
function uniqueCanonicalKey(registry, baseKey) {
  if (!registry[baseKey]) return baseKey;
  let index = 2;
  while (registry[`${baseKey}${index}`]) index++;
  return `${baseKey}${index}`;
}

const canonical = buildCanonicalRegistry(LEGACY_TILE_REGISTRY);

export const TILE_REGISTRY = canonical.registry;
export const LEGACY_TILE_ALIASES = canonical.aliases;

export const TILE_KEYS_BY_CATEGORY = Object.entries(TILE_REGISTRY).reduce(
  (acc, [key, def]) => {
    (acc[def.category] ??= []).push(key);
    return acc;
  },
   ({}),
);

export const COLLIDABLE_TILE_KEYS = Object.entries(TILE_REGISTRY)
  .filter(([, def]) => def.pass === false)
  .map(([key]) => key);

export const DECO_TILE_KEYS = Object.entries(TILE_REGISTRY)
  .filter(([, def]) => def.pass === true && !def.ladder)
  .map(([key]) => key);
// #endregion