const PROPS_PATH = 'assets/images/props';

export const PROP_REGISTRY = {

  'tree':            { key: 'PROP_TREE',              src: `${PROPS_PATH}/tree.png`,            defaultScale: 1.5 },
  'pine':            { key: 'PROP_PINE',              src: `${PROPS_PATH}/pine.png`,            defaultScale: 1.6 },
  'palm':            { key: 'PROP_PALM',              src: `${PROPS_PATH}/palm.png`,            defaultScale: 1.6 },
  'bush':            { key: 'PROP_BUSH',              src: `${PROPS_PATH}/bush.png`,            defaultScale: 2 },
  'shrooms':         { key: 'PROP_SHROOMS',           src: `${PROPS_PATH}/shrooms.png`,         defaultScale: 2.5 },

  'rock':            { key: 'PROP_ROCK',              src: `${PROPS_PATH}/rock.png`,            defaultScale: 2 },
  'rock-1':          { key: 'PROP_ROCK_1',            src: `${PROPS_PATH}/rock-1.png`,          defaultScale: 2 },
  'rock-2':          { key: 'PROP_ROCK_2',            src: `${PROPS_PATH}/rock-2.png`,          defaultScale: 3 },

  'crate':           { key: 'PROP_CRATE',             src: `${PROPS_PATH}/crate.png`,           defaultScale: 3 },
  'big-crate':       { key: 'PROP_BIG_CRATE',         src: `${PROPS_PATH}/big-crate.png`,       defaultScale: 3 },

  'block':           { key: 'PROP_BLOCK',             src: `${PROPS_PATH}/block.png`,           defaultScale: 2 },
  'block-big':       { key: 'PROP_BLOCK_BIG',         src: `${PROPS_PATH}/block-big.png`,       defaultScale: 2 },
  'small-platform':  { key: 'PROP_SMALL_PLATFORM',    src: `${PROPS_PATH}/small-platform.png`,  defaultScale: 2 },
  'platform-long':   { key: 'PROP_PLATFORM_LONG',     src: `${PROPS_PATH}/platform-long.png`,   defaultScale: 2 },

  'house':           { key: 'PROP_HOUSE',             src: `${PROPS_PATH}/house.png`,           defaultScale: 2.3 },
  'straw-house':     { key: 'PROP_STRAW_HOUSE',       src: `${PROPS_PATH}/straw-house.png`,     defaultScale: 1.6 },
  'wooden-house':    { key: 'PROP_WOODEN_HOUSE',      src: `${PROPS_PATH}/wooden-house.png`,    defaultScale: 1.6 },
  'tree-house':      { key: 'PROP_TREE_HOUSE',        src: `${PROPS_PATH}/tree-house.png`,      defaultScale: 1.6 },
  'plant-house':     { key: 'PROP_PLANT_HOUSE',       src: `${PROPS_PATH}/plant-house.png`,     defaultScale: 1.6 },

  'sign':            { key: 'PROP_SIGN',              src: `${PROPS_PATH}/sign.png`,            defaultScale: 2.3 },
  'face-block':      { key: 'PROP_FACE_BLOCK',        src: `${PROPS_PATH}/face-block.png`,      defaultScale: 2 },
  'skulls':          { key: 'PROP_SKULLS',            src: `${PROPS_PATH}/skulls.png`,          defaultScale: 2 },

  'crank-down':      { key: 'PROP_CRANK_DOWN',        src: `${PROPS_PATH}/crank-down.png`,      defaultScale: 1 },
  'crank-up':        { key: 'PROP_CRANK_UP',          src: `${PROPS_PATH}/crank-up.png`,        defaultScale: 1 },
  'door-opened':     { key: 'PROP_DOOR_OPENED',       src: `${PROPS_PATH}/door-opened.png`,     defaultScale: 1 },
  'door':            { key: 'PROP_DOOR',              src: `${PROPS_PATH}/door.png`,            defaultScale: 1 },

  'spikes':          { key: 'PROP_SPIKES',            src: `${PROPS_PATH}/spikes.png`,          defaultScale: 1 },
  'spikes-top':      { key: 'PROP_SPIKES_TOP',        src: `${PROPS_PATH}/spikes-top.png`,      defaultScale: 1 },
  'spike-skull':     { key: 'PROP_SPIKE_SKULL',       src: `${PROPS_PATH}/spike-skull.png`,     defaultScale: 1 },
};

export const PROP_ASSET_ENTRIES = Object.values(PROP_REGISTRY).map(({ key, src }) => ({ key, src }));
