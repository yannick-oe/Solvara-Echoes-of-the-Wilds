/**
 * Zentrales Prop-Asset-Register.
 * Bildet logische Prop-IDs (wie sie in level JSON verwendet werden)
 * auf ImageCache-Keys ab, die in assetPaths.js definiert sind.
 *
 * Neue Props einfach hier eintragen – die Preload-Pipeline liest
 * PROP_ASSET_ENTRIES und macht sie über imageCache verfügbar.
 */

const PROPS_PATH = 'assets/images/props';

/**
 * Mapping: propId → { key, src }
 * key   = ImageCache-Schlüssel  (muss eindeutig sein)
 * src   = Dateipfad relativ zum Projektstamm
 */
export const PROP_REGISTRY = {
  'big-crate':       { key: 'PROP_BIG_CRATE',       src: `${PROPS_PATH}/big-crate.png`       },
  'block-big':       { key: 'PROP_BLOCK_BIG',        src: `${PROPS_PATH}/block-big.png`       },
  'block':           { key: 'PROP_BLOCK',             src: `${PROPS_PATH}/block.png`           },
  'bush':            { key: 'PROP_BUSH',              src: `${PROPS_PATH}/bush.png`            },
  'crank-down':      { key: 'PROP_CRANK_DOWN',        src: `${PROPS_PATH}/crank-down.png`      },
  'crank-up':        { key: 'PROP_CRANK_UP',          src: `${PROPS_PATH}/crank-up.png`        },
  'crate':           { key: 'PROP_CRATE',             src: `${PROPS_PATH}/crate.png`           },
  'door-opened':     { key: 'PROP_DOOR_OPENED',       src: `${PROPS_PATH}/door-opened.png`     },
  'door':            { key: 'PROP_DOOR',              src: `${PROPS_PATH}/door.png`            },
  'face-block':      { key: 'PROP_FACE_BLOCK',        src: `${PROPS_PATH}/face-block.png`      },
  'house':           { key: 'PROP_HOUSE',             src: `${PROPS_PATH}/house.png`           },
  'palm':            { key: 'PROP_PALM',              src: `${PROPS_PATH}/palm.png`            },
  'pine':            { key: 'PROP_PINE',              src: `${PROPS_PATH}/pine.png`            },
  'plant-house':     { key: 'PROP_PLANT_HOUSE',       src: `${PROPS_PATH}/plant-house.png`     },
  'platform-long':   { key: 'PROP_PLATFORM_LONG',     src: `${PROPS_PATH}/platform-long.png`   },
  'rock-1':          { key: 'PROP_ROCK_1',            src: `${PROPS_PATH}/rock-1.png`          },
  'rock-2':          { key: 'PROP_ROCK_2',            src: `${PROPS_PATH}/rock-2.png`          },
  'rock':            { key: 'PROP_ROCK',              src: `${PROPS_PATH}/rock.png`            },
  'shrooms':         { key: 'PROP_SHROOMS',           src: `${PROPS_PATH}/shrooms.png`         },
  'sign':            { key: 'PROP_SIGN',              src: `${PROPS_PATH}/sign.png`            },
  'skulls':          { key: 'PROP_SKULLS',            src: `${PROPS_PATH}/skulls.png`          },
  'small-platform':  { key: 'PROP_SMALL_PLATFORM',    src: `${PROPS_PATH}/small-platform.png`  },
  'spike-skull':     { key: 'PROP_SPIKE_SKULL',       src: `${PROPS_PATH}/spike-skull.png`     },
  'spikes-top':      { key: 'PROP_SPIKES_TOP',        src: `${PROPS_PATH}/spikes-top.png`      },
  'spikes':          { key: 'PROP_SPIKES',            src: `${PROPS_PATH}/spikes.png`          },
  'straw-house':     { key: 'PROP_STRAW_HOUSE',       src: `${PROPS_PATH}/straw-house.png`     },
  'tree-house':      { key: 'PROP_TREE_HOUSE',        src: `${PROPS_PATH}/tree-house.png`      },
  'tree':            { key: 'PROP_TREE',              src: `${PROPS_PATH}/tree.png`            },
  'wooden-house':    { key: 'PROP_WOODEN_HOUSE',      src: `${PROPS_PATH}/wooden-house.png`    },
};

/**
 * Flache { key, src } Liste für imageCache.preload().
 * Enthält nur Props die nicht bereits über assetPaths.js geladen werden,
 * um Doppelladungen zu vermeiden (crank-up/down, door, spikes bereits dort).
 *
 * Für Einfachheit werden ALLE Props hier ausgegeben – imageCache.preload()
 * überschreibt bei gleichem Key einfach; kein Schaden dabei.
 */
export const PROP_ASSET_ENTRIES = Object.values(PROP_REGISTRY).map(({ key, src }) => ({ key, src }));
