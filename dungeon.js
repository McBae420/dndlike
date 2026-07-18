const savedCharacterKey = "avtizm4.character";
const rewardHistoryKey = "avtizm4.rewards";
const pendingDungeonRewardKey = "avtizm4.pendingDungeonReward";
const startingInventory = [
  {
    id: "starting-torches",
    name: "Torches",
    quantity: 3,
    source: "Starting Gear",
    text: "Basic adventuring light sources.",
  },
  {
    id: "starting-rations",
    name: "Rations",
    quantity: 1,
    source: "Starting Gear",
    text: "One day of preserved food.",
  },
];

const dungeonPlans = {
  1: { level: 1, rooms: [7, 8], width: 38, height: 28, name: "Dungeon 1", exitFeel: "medium/hard" },
  2: { level: 2, rooms: [8, 10], width: 44, height: 32, name: "Dungeon 2", exitFeel: "hard" },
  3: { level: 3, rooms: [9, 11], width: 50, height: 36, name: "Dungeon 3", exitFeel: "hard" },
  4: { level: 4, rooms: [10, 12], width: 56, height: 40, name: "Dungeon 4", exitFeel: "hard/low deadly" },
  5: { level: 5, rooms: [4, 6], width: 40, height: 30, name: "Final Boss Area", exitFeel: "boss set-piece", boss: true },
};

const themeData = {
  "goblin cave": {
    flavor: ["muddy den", "echoing guard post", "fungus-lit hollow", "stolen supply cache"],
    monsters: [
      { name: "Goblin Cutter", hp: 7, attack: 4, speed: 6, range: 1, ai: "brute", weight: 5 },
      { name: "Goblin Slinger", hp: 6, attack: 3, speed: 6, range: 4, ai: "archer", weight: 3 },
      { name: "Wolf Pup", hp: 8, attack: 4, speed: 7, range: 1, ai: "predator", weight: 2 },
    ],
    traps: ["snare cord", "loose scree", "pit covered with hides"],
    hazards: ["narrow ledge", "smoky cook fire"],
  },
  "undead crypt": {
    flavor: ["sealed ossuary", "cold reliquary", "cracked memorial hall", "dusty offering niche"],
    monsters: [
      { name: "Skeleton", hp: 13, attack: 5, speed: 6, range: 1, ai: "brute", weight: 4 },
      { name: "Bone Archer", hp: 10, attack: 4, speed: 6, range: 5, ai: "archer", weight: 2 },
      { name: "Crawling Hand", hp: 5, attack: 3, speed: 5, range: 1, ai: "predator", weight: 3 },
    ],
    traps: ["grave gas vent", "falling stone lid", "necrotic sigil"],
    hazards: ["choking dust", "unstable sarcophagus"],
  },
  "bandit hideout": {
    flavor: ["map table", "bunk room", "contraband store", "barricaded checkpoint"],
    monsters: [
      { name: "Bandit", hp: 11, attack: 4, speed: 6, range: 1, ai: "brute", weight: 4 },
      { name: "Lookout", hp: 9, attack: 4, speed: 6, range: 5, ai: "archer", weight: 3 },
      { name: "Thug", hp: 18, attack: 5, speed: 5, range: 1, ai: "defender", weight: 2 },
    ],
    traps: ["tripwire alarm", "crossbow latch", "oil slick"],
    hazards: ["stacked crates", "burning lanterns"],
  },
  "spider nest": {
    flavor: ["webbed burrow", "egg chamber", "silk-choked tunnel", "drained campsite"],
    monsters: [
      { name: "Spiderling", hp: 6, attack: 3, speed: 6, range: 1, ai: "predator", weight: 5 },
      { name: "Venom Spider", hp: 12, attack: 5, speed: 7, range: 1, ai: "predator", weight: 3 },
      { name: "Web Spitter", hp: 10, attack: 3, speed: 5, range: 4, ai: "archer", weight: 2 },
    ],
    traps: ["sticky web floor", "camouflaged web drop", "venom sac"],
    hazards: ["webbed difficult ground", "egg clutch"],
  },
  "cultist temple": {
    flavor: ["candle maze", "ritual prep room", "defaced shrine", "chanting antechamber"],
    monsters: [
      { name: "Cultist", hp: 9, attack: 4, speed: 6, range: 1, ai: "brute", weight: 4 },
      { name: "Acolyte", hp: 13, attack: 5, speed: 6, range: 4, ai: "caster", weight: 2 },
      { name: "Fanatic Guard", hp: 16, attack: 5, speed: 6, range: 1, ai: "defender", weight: 2 },
    ],
    traps: ["blood rune", "collapsing idol", "curse bell"],
    hazards: ["profane brazier", "whispering altar"],
  },
  "abandoned mine": {
    flavor: ["timber-braced shaft", "ore cart stop", "flooded pocket", "forgotten tool room"],
    monsters: [
      { name: "Kobold Miner", hp: 7, attack: 4, speed: 6, range: 1, ai: "brute", weight: 4 },
      { name: "Kobold Hurler", hp: 6, attack: 3, speed: 6, range: 4, ai: "archer", weight: 3 },
      { name: "Cave Stirge", hp: 5, attack: 4, speed: 7, range: 1, ai: "predator", weight: 2 },
    ],
    traps: ["falling beam", "minecart runaway", "thin tunnel floor"],
    hazards: ["loose rails", "bad air"],
  },
};

const tileGlyphs = {
  void: "",
  wall: "",
  floor: "",
  door: "+",
  "open door": "-",
  "locked door": "L",
  "secret door": "?",
  "trap tile": "!",
  "reward tile": "$",
  "special feature tile": "*",
  "entrance tile": "E",
  "exit tile": "X",
};

const walkableTiles = new Set([
  "floor",
  "open door",
  "trap tile",
  "reward tile",
  "special feature tile",
  "entrance tile",
  "exit tile",
]);

const playerTokenImages = [
  "Races/Tokens/aasimar-token.png",
  "Races/Tokens/dragonborn-token.png",
  "Races/Tokens/dwarf-token.png",
];
const raceTokenImages = {
  Aasimar: "Races/Tokens/aasimar-token.png",
  Dragonborn: "Races/Tokens/dragonborn-token.png",
  Dwarf: "Races/Tokens/dwarf-token.png",
  Elf: "Races/Tokens/elf-token.png",
  Gnome: "Races/Tokens/gnome-token.png",
  Goliath: "Races/Tokens/goliath-token.png",
  Halfling: "Races/Tokens/halfling-token.png",
  Human: "Races/Tokens/human-token.png",
  Orc: "Races/Tokens/orc-token.png",
  Tiefling: "Races/Tokens/tiefling-token.png",
};
const monsterTokenImage = "Monsters/tokens/Golbin.png";
const playerVttStateKey = "avtizm4.vtt.player";
let activePlayerTokenId = "player-1";
const vttMode = document.body.dataset.vttView === "player" ? "player" : "dm";
const legacyDungeonStorageKey = "avtizm4.dungeon";
const dungeonStorageKey = `avtizm4.dungeon.${vttMode}`;
const doorIcons = {
  door: "Icons/door.png",
  "locked door": "Icons/door.png",
  "secret door": "Icons/door.png",
  "open door": "Icons/door-open.png",
};
const doorTileTypes = new Set(["door", "open door", "locked door", "secret door"]);

let dungeon = null;
let selectedTokenId = null;
let selectedTile = null;
let tileSize = 26;
let panState = null;
let tokenDragState = null;
let movementPreview = null;
let invalidMoveTarget = null;
let playerSightTiles = new Set();
let tokenMovementAnimating = false;
let tileElements = new Map();
let renderedPathKeys = new Set();
let renderedPathEndKey = null;
let renderedInvalidTargetKey = null;
let renderedSelectedTileKey = null;
let queuedDragPoint = null;
let lastDragPreviewKey = null;
let dragPreviewFrame = null;
let neighborCache = new Map();
let queuedZoom = null;
let zoomFrame = null;
let panFrame = null;
let queuedPanEvent = null;
let hexEdgeFrame = null;
let multiplayerSyncTimer = null;
let multiplayerSyncInFlight = false;
let multiplayerSyncQueued = false;
let applyingMultiplayerState = false;

const stageSelect = document.querySelector("#dungeon-stage");
const viewModeSelect = document.querySelector("#view-mode");
const gridElement = document.querySelector("#dungeon-grid");
const pathDistanceElement = document.querySelector("#path-distance");
const inspectorElement = document.querySelector("#inspector");
const sidebarElement = document.querySelector("#dungeon-sidebar");

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function saveDungeonState() {
  if (!dungeon) return;
  localStorage.setItem(dungeonStorageKey, JSON.stringify(dungeon));
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (
    vttMode === "dm"
    && multiplayerState?.connected
    && !applyingMultiplayerState
  ) {
    scheduleMultiplayerDungeonSync();
  }
}

function normalizeActivePlayerToken() {
  if (!dungeon) return;
  const activeToken = dungeon.tokens.find((token) => token.id === activePlayerTokenId);
  if (!activeToken) return;
  if (vttMode === "player") {
    activeToken.image = playerRaceTokenImage(savedPlayerCharacter()) || activeToken.image || playerTokenImages[0];
  }
  activeToken.type = "player";
  if (vttMode === "player") selectedTokenId = activePlayerTokenId;
}

function loadDungeonState() {
  try {
    const storedDungeon = localStorage.getItem(dungeonStorageKey)
      || (vttMode === "dm" ? localStorage.getItem(legacyDungeonStorageKey) : null);
    const saved = JSON.parse(storedDungeon);
    if (!saved?.grid || !saved?.tokens) return false;
    dungeon = saved;
    if (!localStorage.getItem(dungeonStorageKey)) {
      localStorage.setItem(dungeonStorageKey, JSON.stringify(saved));
    }
    normalizeActivePlayerToken();
    selectedTokenId = vttMode === "player"
      ? activePlayerTokenId
      : dungeon.tokens.find((token) => token.type === "player")?.id || null;
    selectedTile = null;
    render();
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

function syncViewModeControl() {
  if (!viewModeSelect) return;
  viewModeSelect.value = vttMode;
  viewModeSelect.disabled = true;
}

function applyPageMode() {
  document.body.classList.toggle("is-player-vtt", vttMode === "player");
  document.body.classList.toggle("is-dm-vtt", vttMode === "dm");
  syncViewModeControl();
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function weightedChoice(items) {
  const total = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight || 1;
    if (roll <= 0) return item;
  }
  return items[0];
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function rectsOverlap(a, b, padding = 1) {
  return !(
    a.x + a.w + padding < b.x ||
    b.x + b.w + padding < a.x ||
    a.y + a.h + padding < b.y ||
    b.y + b.h + padding < a.y
  );
}

function roomCenter(room) {
  return {
    x: Math.floor(room.x + room.w / 2),
    y: Math.floor(room.y + room.h / 2),
  };
}

function distance(a, b) {
  const ac = offsetToCube(a);
  const bc = offsetToCube(b);
  return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
}

function offsetToCube(point) {
  const x = point.x;
  const z = point.y - (point.x - (point.x & 1)) / 2;
  const y = -x - z;
  return { x, y, z };
}

function cubeToOffset(cube) {
  const x = cube.x;
  const y = cube.z + (cube.x - (cube.x & 1)) / 2;
  return { x, y };
}

function cubeLerp(a, b, amount) {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
    z: a.z + (b.z - a.z) * amount,
  };
}

function cubeRound(cube) {
  let x = Math.round(cube.x);
  let y = Math.round(cube.y);
  let z = Math.round(cube.z);
  const xDiff = Math.abs(x - cube.x);
  const yDiff = Math.abs(y - cube.y);
  const zDiff = Math.abs(z - cube.z);

  if (xDiff > yDiff && xDiff > zDiff) x = -y - z;
  else if (yDiff > zDiff) y = -x - z;
  else z = -x - y;

  return { x, y, z };
}

function createGrid(width, height) {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      type: "void",
      roomId: null,
      corridorId: null,
      visibility: "hidden",
      trapId: null,
      rewardId: null,
      feature: null,
    })),
  );
}

function addWallsAroundRoomsAndCorridors(grid, rooms, corridors) {
  const wallPoints = [];
  for (const room of rooms) {
    for (let y = room.y - 1; y <= room.y + room.h; y += 1) {
      for (let x = room.x - 1; x <= room.x + room.w; x += 1) {
        const isRoomInterior = x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h;
        if (!isRoomInterior) {
          const tile = grid[y]?.[x];
          if (tile?.type === "void") wallPoints.push(tile);
        }
      }
    }
  }
  for (const corridor of corridors) {
    for (const point of corridor.tiles) {
      for (const neighbor of neighbors(point)) {
        const tile = grid[neighbor.y]?.[neighbor.x];
        if (tile?.type === "void") wallPoints.push(tile);
      }
    }
  }

  wallPoints.forEach((tile) => {
    tile.type = "wall";
  });
}

function carveRoom(grid, room) {
  for (let y = room.y; y < room.y + room.h; y += 1) {
    for (let x = room.x; x < room.x + room.w; x += 1) {
      grid[y][x].type = "floor";
      grid[y][x].roomId = room.id;
    }
  }
}

function carveCorridor(grid, from, to, corridor) {
  const points = corridorPathAvoidingRooms(grid, from, to, corridor);

  for (const point of points) {
    const tile = grid[point.y]?.[point.x];
    if (!tile) continue;
    if (tile.type === "void" || tile.type === "wall") {
      tile.type = "floor";
      tile.corridorId = corridor.id;
      corridor.tiles.push({ x: point.x, y: point.y });
    }
  }
}

function corridorPathAvoidingRooms(grid, from, to, corridor) {
  const key = (point) => `${point.x},${point.y}`;
  const queue = [from];
  const cameFrom = new Map([[key(from), null]]);

  while (queue.length) {
    const current = queue.shift();
    if (current.x === to.x && current.y === to.y) break;

    for (const next of shuffledNeighbors(current)) {
      const nextKey = key(next);
      const tile = grid[next.y]?.[next.x];
      if (!tile || cameFrom.has(nextKey)) continue;
      if (tile.roomId && tile.roomId !== corridor.from && tile.roomId !== corridor.to) continue;
      cameFrom.set(nextKey, current);
      queue.push(next);
    }
  }

  if (!cameFrom.has(key(to))) return fallbackCorridorPath(from, to);

  const path = [];
  let current = to;
  while (current) {
    path.push(current);
    current = cameFrom.get(key(current));
  }
  return path.reverse().slice(1);
}

function shuffledNeighbors(point) {
  return neighbors(point).slice().sort(() => Math.random() - 0.5);
}

function fallbackCorridorPath(from, to) {
  const points = [];
  let current = from;
  const seen = new Set([pointKey(from)]);
  while (current.x !== to.x || current.y !== to.y) {
    const next = shuffledNeighbors(current)
      .filter((point) => !seen.has(pointKey(point)))
      .sort((a, b) => distance(a, to) - distance(b, to))[0];
    if (!next) break;
    points.push(next);
    seen.add(pointKey(next));
    current = next;
  }
  return points;
}

function placeDoorTiles(grid, tiles, doors, roomIds) {
  tiles.forEach((tile) => {
    if (!tile || doors.some((door) => door.x === tile.x && door.y === tile.y)) return;
    tile.type = "door";
    doors.push({
      id: makeId("door"),
      x: tile.x,
      y: tile.y,
      type: tile.type,
      open: false,
      rooms: roomIds,
    });
  });
}

function isClosedDoorType(type) {
  return ["door", "locked door", "secret door"].includes(type);
}

function cleanupDoorClusters(grid, doors) {
  const doorMap = new Map(doors.map((door) => [`${door.x},${door.y}`, door]));
  const visited = new Set();
  const cleanedDoors = [];

  for (const door of doors) {
    const startKey = `${door.x},${door.y}`;
    if (visited.has(startKey)) continue;

    const cluster = [];
    const queue = [door];
    visited.add(startKey);

    while (queue.length) {
      const current = queue.shift();
      cluster.push(current);
      for (const neighbor of neighbors(current)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const neighborDoor = doorMap.get(neighborKey);
        if (neighborDoor && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push(neighborDoor);
        }
      }
    }

    const keeper = bestDoorInCluster(grid, cluster);
    for (const clusteredDoor of cluster) {
      const tile = grid[clusteredDoor.y]?.[clusteredDoor.x];
      if (clusteredDoor === keeper) {
        cleanedDoors.push(clusteredDoor);
      } else if (tile && isClosedDoorType(tile.type)) {
        tile.type = "floor";
      }
    }
  }

  doors.splice(0, doors.length, ...cleanedDoors);
  cleanupCloseHallwayDoors(grid, doors);
}

function cleanupCloseHallwayDoors(grid, doors) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let firstIndex = 0; firstIndex < doors.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < doors.length; secondIndex += 1) {
        const first = doors[firstIndex];
        const second = doors[secondIndex];
        if (!sameStraightHallway(grid, first, second)) continue;

        const keeper = doorChokeScore(grid, first) >= doorChokeScore(grid, second) ? first : second;
        const removed = keeper === first ? second : first;
        const removedTile = grid[removed.y]?.[removed.x];
        if (removedTile && isClosedDoorType(removedTile.type)) removedTile.type = "floor";
        doors.splice(doors.indexOf(removed), 1);
        changed = true;
        break;
      }
      if (changed) break;
    }
  }
}

function sameStraightHallway(grid, first, second) {
  const sameColumn = first.x === second.x;
  const sameRow = first.y === second.y;
  if (!sameColumn && !sameRow) return false;
  const distanceBetweenDoors = distance(first, second);
  if (distanceBetweenDoors <= 1 || distanceBetweenDoors > 5) return false;

  const stepX = Math.sign(second.x - first.x);
  const stepY = Math.sign(second.y - first.y);
  for (let index = 1; index < distanceBetweenDoors; index += 1) {
    const x = first.x + stepX * index;
    const y = first.y + stepY * index;
    const tile = grid[y]?.[x];
    if (!tile || tile.type !== "floor") return false;

    const sideA = sameColumn ? grid[y]?.[x - 1]?.type : grid[y - 1]?.[x]?.type;
    const sideB = sameColumn ? grid[y]?.[x + 1]?.type : grid[y + 1]?.[x]?.type;
    if (!["wall", "void"].includes(sideA) && !["wall", "void"].includes(sideB)) return false;
  }

  return true;
}

function cleanupInvalidDoorWallCounts(grid, doors) {
  for (let index = doors.length - 1; index >= 0; index -= 1) {
    const door = doors[index];
    const tile = grid[door.y]?.[door.x];
    if (!tile || !isClosedDoorType(tile.type)) continue;
    if (cardinalWallCount(grid, tile) === 2) continue;
    tile.type = "floor";
    doors.splice(index, 1);
  }
}

function bestDoorInCluster(grid, cluster) {
  return cluster
    .slice()
    .sort((a, b) => doorChokeScore(grid, b) - doorChokeScore(grid, a))[0];
}

function doorChokeScore(grid, door) {
  const x = door.x;
  const y = door.y;
  const left = grid[y]?.[x - 1]?.type;
  const right = grid[y]?.[x + 1]?.type;
  const up = grid[y - 1]?.[x]?.type;
  const down = grid[y + 1]?.[x]?.type;
  const wallLike = new Set(["wall", "void"]);
  const floorLike = new Set(["floor", "trap tile", "reward tile", "special feature tile", "entrance tile", "exit tile"]);
  const horizontalChoke = floorLike.has(left) && floorLike.has(right) && wallLike.has(up) && wallLike.has(down);
  const verticalChoke = floorLike.has(up) && floorLike.has(down) && wallLike.has(left) && wallLike.has(right);
  const wallCount = [left, right, up, down].filter((type) => wallLike.has(type)).length;
  const floorCount = [left, right, up, down].filter((type) => floorLike.has(type)).length;
  return (horizontalChoke || verticalChoke ? 100 : 0) + wallCount * 10 + floorCount;
}

function doorwayTilesForRoom(grid, room, corridor, side) {
  const candidates = [];
  corridor.tiles.forEach((point, index) => {
    const tile = grid[point.y]?.[point.x];
    if (!tile || tile.corridorId !== corridor.id) return;
    const touchesRoom = neighbors(point).some((neighbor) => grid[neighbor.y]?.[neighbor.x]?.roomId === room.id);
    if (touchesRoom) {
      candidates.push({ tile, index });
    }
  });
  if (!candidates.length) return [];

  const targetIndex =
    side === "start"
      ? Math.min(...candidates.map((candidate) => candidate.index))
      : Math.max(...candidates.map((candidate) => candidate.index));

  return candidates
    .filter((candidate) => candidate.index === targetIndex)
    .map((candidate) => candidate.tile);
}

function placeCorridorDoors(grid, corridor, fromRoom, toRoom, doors) {
  const fromDoorTiles = doorwayTilesForRoom(grid, fromRoom, corridor, "start");
  const toDoorTiles = doorwayTilesForRoom(grid, toRoom, corridor, "end");
  const roomIds = [fromRoom.id, toRoom.id];
  if (isWideDoorway(fromDoorTiles) || isWideDoorway(toDoorTiles) || isWideCorridor(grid, corridor)) return;

  const doorTile = cleanDoorTile(grid, fromDoorTiles[0]) || cleanDoorTile(grid, toDoorTiles[0]);
  if (!doorTile || nearbyDoorExists(doors, doorTile, 4)) return;
  placeDoorTiles(grid, [doorTile], doors, roomIds);
}

function isWideDoorway(tiles) {
  return tiles.length > 1;
}

function isWideCorridor(grid, corridor) {
  const points = new Set(corridor.tiles.map((point) => `${point.x},${point.y}`));
  for (let index = 1; index < corridor.tiles.length - 1; index += 1) {
    const previous = corridor.tiles[index - 1];
    const current = corridor.tiles[index];
    const next = corridor.tiles[index + 1];
    const horizontalTravel = previous.y === current.y && next.y === current.y;
    const verticalTravel = previous.x === current.x && next.x === current.x;
    if (horizontalTravel && (points.has(`${current.x},${current.y - 1}`) || points.has(`${current.x},${current.y + 1}`))) return true;
    if (verticalTravel && (points.has(`${current.x - 1},${current.y}`) || points.has(`${current.x + 1},${current.y}`))) return true;
  }
  return false;
}

function cleanDoorTile(grid, tile) {
  if (!tile || tile.type !== "floor") return null;
  return cardinalWallCount(grid, tile) === 2 && doorChokeScore(grid, tile) >= 100 ? tile : null;
}

function cardinalWallCount(grid, tile) {
  return [
    grid[tile.y - 1]?.[tile.x]?.type,
    grid[tile.y]?.[tile.x + 1]?.type,
    grid[tile.y + 1]?.[tile.x]?.type,
    grid[tile.y]?.[tile.x - 1]?.type,
  ].filter((type) => ["wall", "void"].includes(type)).length;
}

function nearbyDoorExists(doors, tile, maxDistance) {
  return doors.some((door) => distance(door, tile) <= maxDistance);
}

function generateRooms(plan) {
  const target = randInt(plan.rooms[0], plan.rooms[1]);
  const rooms = [createSpawnRoom(plan)];
  let attempts = 0;
  while (rooms.length < target && attempts < 450) {
    attempts += 1;
    const w = randInt(plan.boss && rooms.length === target - 1 ? 9 : 5, plan.boss ? 11 : 10);
    const h = randInt(plan.boss && rooms.length === target - 1 ? 8 : 4, plan.boss ? 10 : 8);
    const room = {
      id: `room-${rooms.length + 1}`,
      name: `Room ${rooms.length + 1}`,
      x: randInt(2, plan.width - w - 3),
      y: randInt(2, plan.height - h - 3),
      w,
      h,
      type: "empty",
      description: "",
      distanceFromEntrance: 0,
      encounterDifficulty: "none",
      revealed: false,
      rewardIds: [],
      trapIds: [],
      monsterIds: [],
      feature: null,
    };

    if (!rooms.some((existing) => rectsOverlap(room, existing, 1))) {
      rooms.push(room);
    }
  }
  return rooms;
}

function createSpawnRoom(plan) {
  const w = plan.boss ? 8 : 7;
  const h = plan.boss ? 7 : 6;
  return {
    id: "room-1",
    name: "Room 1",
    x: Math.floor(plan.width / 2 - w / 2),
    y: Math.floor(plan.height / 2 - h / 2),
    w,
    h,
    type: "empty",
    description: "",
    distanceFromEntrance: 0,
    encounterDifficulty: "none",
    revealed: false,
    rewardIds: [],
    trapIds: [],
    monsterIds: [],
    feature: null,
  };
}

function connectRooms(grid, rooms) {
  const corridors = [];
  const doors = [];
  const sorted = [...rooms].sort((a, b) => roomCenter(a).x - roomCenter(b).x);
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    const corridor = {
      id: `corridor-${index}`,
      from: previous.id,
      to: current.id,
      tiles: [],
      visibility: "hidden",
    };
    carveCorridor(grid, roomCenter(previous), roomCenter(current), corridor);
    corridors.push(corridor);
    placeCorridorDoors(grid, corridor, previous, current, doors);
  }
  cleanupDoorClusters(grid, doors);
  return { corridors, doors };
}

function chooseEntranceAndExit(rooms, plan) {
  const entrance = rooms[0];
  const entranceCenter = roomCenter(entrance);
  rooms.forEach((room) => {
    room.distanceFromEntrance = distance(entranceCenter, roomCenter(room));
  });
  const byDistance = [...rooms]
    .filter((room) => room.id !== entrance.id)
    .sort((a, b) => exitScore(b, plan) - exitScore(a, plan));
  const exit = byDistance[0] || rooms[rooms.length - 1];
  entrance.type = "entrance";
  entrance.name = plan.boss ? "Staging Room" : "Entrance Room";
  exit.type = plan.boss ? "boss" : "exit";
  exit.name = plan.boss ? "Final Boss Room" : "Exit Room";
  entrance.revealed = true;
  return { entrance, exit };
}

function exitScore(room, plan) {
  const center = roomCenter(room);
  const edgeDistance = Math.min(center.x, center.y, plan.width - center.x, plan.height - center.y);
  return room.distanceFromEntrance * 1.4 - edgeDistance * 1.8;
}

function assignRoomTypes(rooms, entranceId, exitId, isBossArea) {
  const remaining = rooms.filter((room) => room.id !== entranceId && room.id !== exitId);
  if (isBossArea) {
    remaining.forEach((room, index) => {
      room.type = index === 0 ? "combat" : choice(["flavor", "trap", "special"]);
    });
    return;
  }

  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  const combatCount = Math.max(1, Math.floor(rooms.length * 0.3));
  const rewardCount = Math.max(1, Math.round(rooms.length * 0.18));
  const trapCount = Math.max(1, Math.round(rooms.length * 0.15));
  const quietRoomCount = Math.min(2, Math.max(1, remaining.length - combatCount - rewardCount - trapCount));
  shuffled.forEach((room, index) => {
    if (index < quietRoomCount) room.type = choice(["empty", "flavor"]);
    else if (index < quietRoomCount + combatCount) room.type = "combat";
    else if (index < quietRoomCount + combatCount + rewardCount) room.type = "reward";
    else if (index < quietRoomCount + combatCount + rewardCount + trapCount) room.type = choice(["trap", "hazard"]);
    else room.type = choice(["empty", "flavor", "special"]);
  });
}

function assignLockedSecretTreasureRooms(grid, rooms, corridors, doors, entranceId, exitId, isBossArea) {
  if (isBossArea) return;
  const degreeByRoom = roomConnectionDegrees(corridors);
  const candidates = rooms.filter(
    (room) =>
      room.id !== entranceId &&
      room.id !== exitId &&
      degreeByRoom.get(room.id) === 1,
  );

  candidates.forEach((room, index) => {
    const corridor = corridors.find((item) => item.from === room.id || item.to === room.id);
    const door = doors.find((item) => item.rooms.includes(room.id));
    if (!corridor || !door) return;
    if (!roomHasOnlyThisEntrance(grid, room, door)) return;
    const type = index % 2 === 0 ? "locked door" : "secret door";
    const tile = grid[door.y]?.[door.x];
    if (!tile || tile.type !== "door") return;
    tile.type = type;
    door.type = type;
    door.open = false;
    room.type = "reward";
    room.treasureLocked = true;
  });
}

function roomHasOnlyThisEntrance(grid, room, door) {
  const entrances = roomBoundaryEntrances(grid, room);
  return entrances.length === 1 && entrances[0].x === door.x && entrances[0].y === door.y;
}

function roomBoundaryEntrances(grid, room) {
  const entrances = [];
  const seen = new Set();
  for (let y = room.y; y < room.y + room.h; y += 1) {
    for (let x = room.x; x < room.x + room.w; x += 1) {
      for (const neighbor of neighbors({ x, y })) {
        const outsideRoom = neighbor.x < room.x || neighbor.x >= room.x + room.w || neighbor.y < room.y || neighbor.y >= room.y + room.h;
        if (!outsideRoom) continue;
        const tile = grid[neighbor.y]?.[neighbor.x];
        if (!tile || !isEntranceTile(tile)) continue;
        const key = `${tile.x},${tile.y}`;
        if (!seen.has(key)) {
          entrances.push(tile);
          seen.add(key);
        }
      }
    }
  }
  return entrances;
}

function isEntranceTile(tile) {
  return walkableTiles.has(tile.type) || isClosedDoorType(tile.type);
}

function roomConnectionDegrees(corridors) {
  const degrees = new Map();
  corridors.forEach((corridor) => {
    degrees.set(corridor.from, (degrees.get(corridor.from) || 0) + 1);
    degrees.set(corridor.to, (degrees.get(corridor.to) || 0) + 1);
  });
  return degrees;
}

function randomTileInRoom(room) {
  return {
    x: randInt(room.x + 1, room.x + room.w - 2),
    y: randInt(room.y + 1, room.y + room.h - 2),
  };
}

function scaleMonster(base, level, hard = false) {
  const bonus = Math.max(0, level - 1);
  return {
    ...base,
    hp: base.hp + bonus * 4 + (hard ? level * 2 : 0),
    attack: base.attack + Math.floor(level / 2) + (hard ? 1 : 0),
  };
}

function encounterSize(room, level, hard = false) {
  const area = room.w * room.h;
  const roomCap = area < 32 ? 2 : area < 55 ? 3 : 4;
  const levelBase = level === 1 ? 1 : Math.min(3, Math.ceil(level / 2));
  return Math.min(roomCap, levelBase + (hard ? 1 : 0));
}

function populateDungeon(nextDungeon, entrance, exit) {
  const theme = themeData[nextDungeon.theme];
  const traps = [];
  const rewards = [];
  const monsters = [];
  const tokens = [];

  const start = roomCenter(entrance);
  const character = loadJson(savedCharacterKey, null);
  const savedPlayerState = loadJson(playerVttStateKey, {});
  const playerMaxHp = Math.max(1, Number(character?.hp?.max) || 10);
  const playerCurrentHp = Math.max(
    0,
    Math.min(playerMaxHp, Number(savedPlayerState.currentHp ?? playerMaxHp) || 0),
  );
  tokens.push({
    id: activePlayerTokenId,
    name: partyNamesFromStorage()[0] || "Aasimar",
    type: "player",
    x: start.x,
    y: start.y,
    currentHp: playerCurrentHp,
    tempHp: Math.max(0, Number(savedPlayerState.tempHp) || 0),
    maxHp: playerMaxHp,
    visibleToPlayers: true,
    roomId: entrance.id,
    movement: 6,
    attackRange: 1,
    aiType: null,
    image: playerTokenImages[0],
  });

  for (const room of nextDungeon.rooms) {
    room.description = roomDescription(room, theme);
    if (room.type === "trap" || room.type === "hazard") {
      addTrap(nextDungeon, room, traps, choice(theme.traps.concat(theme.hazards)));
    }
    if (room.type === "reward" || (room.type === "special" && Math.random() < 0.45)) {
      addReward(nextDungeon, room, rewards, rewardCategoryFor(room, nextDungeon.level));
    }
    if (room.type === "combat") {
      addMonsters(nextDungeon, room, monsters, tokens, encounterSize(room, nextDungeon.level), false);
    }
  }

  if (nextDungeon.boss) {
    addMonsters(nextDungeon, exit, monsters, tokens, Math.max(3, encounterSize(exit, nextDungeon.level, true)), true);
    addReward(nextDungeon, exit, rewards, "feat");
    exit.encounterDifficulty = "boss";
  } else {
    addMonsters(nextDungeon, exit, monsters, tokens, encounterSize(exit, nextDungeon.level, true), true);
    if (Math.random() < 0.45) addReward(nextDungeon, exit, rewards, rewardCategoryFor(exit, nextDungeon.level));
    exit.encounterDifficulty = nextDungeon.plan.exitFeel;
  }

  const entranceTile = nextDungeon.grid[start.y][start.x];
  entranceTile.type = "entrance tile";
  entranceTile.visibility = "revealed";
  const exitCenter = roomCenter(exit);
  nextDungeon.grid[exitCenter.y][exitCenter.x].type = "exit tile";
  nextDungeon.traps = traps;
  nextDungeon.rewardPlacements = rewards;
  nextDungeon.monsters = monsters;
  nextDungeon.tokens = tokens;
}

function roomDescription(room, theme) {
  if (room.type === "entrance") return `A safer ${choice(theme.flavor)} where the party can gather before pressing on.`;
  if (room.type === "exit") return `A guarded threshold out of the dungeon. The way forward is blocked by enemies.`;
  if (room.type === "boss") return "The final chamber has space for a true boss fight, supporting mobs, and terrain pressure.";
  if (room.type === "combat") return `Hostile movement stirs in this ${choice(theme.flavor)}.`;
  if (room.type === "reward") return `Something useful has been hidden in this ${choice(theme.flavor)}.`;
  if (room.type === "trap" || room.type === "hazard") return `This ${choice(theme.flavor)} has a dangerous tell for careful players.`;
  if (room.type === "special") return `A strange feature changes how this ${choice(theme.flavor)} feels.`;
  return `A quiet ${choice(theme.flavor)} that gives the crawl a little breathing room.`;
}

function rewardCategoryFor(room, level) {
  if (room.type === "exit" && level >= 3 && Math.random() < 0.18) return choice(["asi", "feat"]);
  if (room.type === "special" && Math.random() < 0.2) return "asi";
  return Math.random() < 0.82 ? "common" : choice(["asi", "feat"]);
}

function addTrap(nextDungeon, room, traps, name) {
  const pos = randomTileInRoom(room);
  const trap = {
    id: makeId("trap"),
    name,
    roomId: room.id,
    x: pos.x,
    y: pos.y,
    difficulty: nextDungeon.level <= 2 ? "simple" : "dangerous",
    visibleToPlayers: false,
  };
  traps.push(trap);
  room.trapIds.push(trap.id);
  nextDungeon.grid[pos.y][pos.x].type = "trap tile";
  nextDungeon.grid[pos.y][pos.x].trapId = trap.id;
}

function addReward(nextDungeon, room, rewards, category) {
  const pos = randomTileInRoom(room);
  const reward = {
    id: makeId("reward"),
    category,
    roomId: room.id,
    x: pos.x,
    y: pos.y,
    guarded: ["combat", "exit", "boss"].includes(room.type),
    hidden: category !== "common" && room.type !== "boss",
    claimed: false,
  };
  rewards.push(reward);
  room.rewardIds.push(reward.id);
  nextDungeon.grid[pos.y][pos.x].type = "reward tile";
  nextDungeon.grid[pos.y][pos.x].rewardId = reward.id;
}

function addMonsters(nextDungeon, room, monsters, tokens, count, hard) {
  const theme = themeData[nextDungeon.theme];
  for (let index = 0; index < count; index += 1) {
    const base = scaleMonster(weightedChoice(theme.monsters), nextDungeon.level, hard);
    const pos = unoccupiedTileInRoom(nextDungeon, room, tokens);
    const monster = {
      id: makeId("monster"),
      name: hard && index === 0 && nextDungeon.boss ? `Boss ${base.name}` : base.name,
      roomId: room.id,
      difficulty: hard ? "hard" : nextDungeon.level === 1 ? "easy/medium" : "medium",
      aiType: nextDungeon.boss && index === 0 ? "boss" : base.ai,
    };
    const token = {
      id: monster.id,
      name: monster.name,
      type: "monster",
      x: pos.x,
      y: pos.y,
      currentHp: nextDungeon.boss && index === 0 ? base.hp + 22 : base.hp,
      maxHp: nextDungeon.boss && index === 0 ? base.hp + 22 : base.hp,
      visibleToPlayers: false,
      roomId: room.id,
      movement: base.speed,
      attackRange: base.range,
      attackBonus: base.attack,
      aiType: monster.aiType,
      image: monsterTokenImage,
    };
    monsters.push(monster);
    tokens.push(token);
    room.monsterIds.push(monster.id);
    room.encounterDifficulty = hard ? "hard" : "standard";
  }
}

function unoccupiedTileInRoom(nextDungeon, room, tokens) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const pos = randomTileInRoom(room);
    if (!tokens.some((token) => token.x === pos.x && token.y === pos.y)) return pos;
  }
  return roomCenter(room);
}

function partyNamesFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(savedCharacterKey));
    if (saved?.race?.name && saved?.class?.name) {
      return [`${saved.race.name} ${saved.class.name}`, "Ally 2", "Ally 3"];
    }
  } catch (error) {
    console.warn(error);
  }
  return ["Player 1", "Player 2", "Player 3"];
}

function multiplayerPlayerMembers() {
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (!multiplayerState?.connected) return [];
  return (multiplayerState.members || []).filter(
    (member) => member.role === "player" && member.token_id,
  );
}

function dungeonEntrancePoint() {
  const entranceRoom = dungeon?.rooms?.find((room) => room.id === dungeon.entranceRoomId);
  if (entranceRoom) return roomCenter(entranceRoom);
  for (let y = 0; y < (dungeon?.height || 0); y += 1) {
    for (let x = 0; x < (dungeon?.width || 0); x += 1) {
      if (dungeon.grid[y]?.[x]?.type === "entrance tile") return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

function openSpawnPoint(preferredPoint, occupied) {
  const queue = [preferredPoint];
  const visited = new Set([pointKey(preferredPoint)]);
  while (queue.length > 0) {
    const point = queue.shift();
    const tile = dungeon?.grid?.[point.y]?.[point.x];
    if (tile && walkableTiles.has(tile.type) && !occupied.has(pointKey(point))) {
      return point;
    }
    for (const neighbor of neighbors(point)) {
      const key = pointKey(neighbor);
      if (
        visited.has(key)
        || neighbor.x < 0
        || neighbor.y < 0
        || neighbor.x >= dungeon.width
        || neighbor.y >= dungeon.height
      ) continue;
      visited.add(key);
      queue.push(neighbor);
    }
  }
  return preferredPoint;
}

function syncPartyTokensFromMembers() {
  if (!dungeon || vttMode !== "dm") return false;
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (!multiplayerState?.connected) return false;

  const members = multiplayerPlayerMembers();
  const memberTokenIds = new Set(members.map((member) => member.token_id));
  const previousTokenCount = dungeon.tokens.length;
  dungeon.tokens = dungeon.tokens.filter(
    (token) => token.type !== "player" || memberTokenIds.has(token.id),
  );

  const entrance = dungeonEntrancePoint();
  const occupied = new Set(dungeon.tokens.map(pointKey));
  let changed = dungeon.tokens.length !== previousTokenCount;

  members.forEach((member) => {
    const character = member.character || {};
    const playerState = member.player_state || {};
    const maxHp = Math.max(1, Number(character?.hp?.max) || 10);
    let token = dungeon.tokens.find((item) => item.id === member.token_id);
    if (!token) {
      const spawn = openSpawnPoint(entrance, occupied);
      token = {
        id: member.token_id,
        name: member.display_name || choiceName(character.race) || "Player",
        type: "player",
        x: spawn.x,
        y: spawn.y,
        currentHp: Math.max(0, Math.min(maxHp, Number(playerState.currentHp ?? maxHp) || 0)),
        tempHp: Math.max(0, Number(playerState.tempHp) || 0),
        maxHp,
        visibleToPlayers: true,
        roomId: dungeon.entranceRoomId,
        movement: Math.max(1, Math.floor((Number.parseFloat(characterSpeed(character)) || 30) / 5)),
        attackRange: 1,
        aiType: null,
        image: playerRaceTokenImage(character) || playerTokenImages[dungeon.tokens.length % playerTokenImages.length],
        ownerUserId: member.user_id,
      };
      dungeon.tokens.push(token);
      occupied.add(pointKey(token));
      changed = true;
      return;
    }

    const nextValues = {
      name: member.display_name || token.name,
      maxHp,
      image: playerRaceTokenImage(character) || token.image || playerTokenImages[0],
      ownerUserId: member.user_id,
      movement: Math.max(1, Math.floor((Number.parseFloat(characterSpeed(character)) || 30) / 5)),
    };
    if (playerState.currentHp != null) {
      nextValues.currentHp = Math.max(0, Math.min(maxHp, Number(playerState.currentHp) || 0));
    }
    if (playerState.tempHp != null) {
      nextValues.tempHp = Math.max(0, Number(playerState.tempHp) || 0);
    }
    Object.entries(nextValues).forEach(([key, value]) => {
      if (token[key] !== value) {
        token[key] = value;
        changed = true;
      }
    });
  });

  if (changed) {
    selectedTokenId = dungeon.tokens.find((token) => token.type === "player")?.id
      || dungeon.tokens[0]?.id
      || null;
  }
  return changed;
}

function generateDungeon() {
  if (vttMode !== "dm") return;
  const plan = dungeonPlans[stageSelect.value];
  const themeKeys = Object.keys(themeData);
  const theme = choice(themeKeys);
  const grid = createGrid(plan.width, plan.height);
  const rooms = generateRooms(plan);
  rooms.forEach((room) => carveRoom(grid, room));
  const { corridors, doors } = connectRooms(grid, rooms);
  addWallsAroundRoomsAndCorridors(grid, rooms, corridors);
  cleanupInvalidDoorWallCounts(grid, doors);
  const { entrance, exit } = chooseEntranceAndExit(rooms, plan);
  assignRoomTypes(rooms, entrance.id, exit.id, plan.boss);
  assignLockedSecretTreasureRooms(grid, rooms, corridors, doors, entrance.id, exit.id, plan.boss);

  dungeon = {
    id: makeId("dungeon"),
    name: plan.boss ? "Final Boss Area" : `${plan.name}: ${titleCase(theme)}`,
    level: plan.level,
    width: plan.width,
    height: plan.height,
    grid,
    rooms,
    corridors,
    doors,
    entranceRoomId: entrance.id,
    exitRoomId: exit.id,
    tokens: [],
    monsters: [],
    traps: [],
    rewardPlacements: [],
    visibility: {
      mode: "room",
      states: ["hidden", "revealed"],
    },
    theme,
    boss: plan.boss,
    plan,
    createdAt: new Date().toISOString(),
  };
  populateDungeon(dungeon, entrance, exit);
  if (!syncPartyTokensFromMembers()) normalizeActivePlayerToken();
  selectedTokenId = dungeon.tokens.find((token) => token.type === "player")?.id || null;
  selectedTile = null;
  saveDungeonState();
  render();
}

function titleCase(text) {
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function revealRoom(nextDungeon, roomId) {
  const room = nextDungeon.rooms.find((item) => item.id === roomId);
  if (!room) return;
  room.revealed = true;
  for (let y = room.y; y < room.y + room.h; y += 1) {
    for (let x = room.x; x < room.x + room.w; x += 1) {
      nextDungeon.grid[y][x].visibility = "revealed";
    }
  }
  for (let y = room.y - 1; y <= room.y + room.h; y += 1) {
    for (let x = room.x - 1; x <= room.x + room.w; x += 1) {
      const tile = nextDungeon.grid[y]?.[x];
      if (tile?.type === "wall" || ["door", "open door", "locked door", "secret door"].includes(tile?.type)) {
        tile.visibility = "revealed";
      }
    }
  }
  nextDungeon.tokens.forEach((token) => {
    if (token.roomId === roomId) token.visibleToPlayers = true;
  });
}

function revealCorridor(nextDungeon, corridor) {
  corridor.visibility = "revealed";
  corridor.tiles.forEach((point) => {
    const tile = nextDungeon.grid[point.y]?.[point.x];
    if (tile) tile.visibility = "revealed";
    for (const neighbor of neighbors(point)) {
      const neighborTile = nextDungeon.grid[neighbor.y]?.[neighbor.x];
      if (neighborTile?.type === "wall" || ["door", "open door", "locked door", "secret door"].includes(neighborTile?.type)) {
        neighborTile.visibility = "revealed";
      }
    }
  });
}

function roomAt(x, y) {
  const tile = dungeon?.grid[y]?.[x];
  if (!tile?.roomId) return null;
  return dungeon.rooms.find((room) => room.id === tile.roomId) || null;
}

function render() {
  if (!dungeon) {
    if (vttMode === "player") {
      renderPlayerSidebarSafely();
    } else {
      inspectorElement.textContent = "Generate or load a dungeon to begin.";
    }
    return;
  }
  synchronizePlayerHp();
  playerSightTiles = computePlayerSightTiles();
  rememberSeenTiles();
  renderGrid();
  if (vttMode === "player") {
    renderPlayerSidebarSafely();
  } else {
    renderInspector();
  }
}

function renderGrid() {
  const metrics = hexMetrics();
  applyHexSizing(metrics);
  gridElement.innerHTML = "";
  tileElements = new Map();
  renderedPathKeys = new Set();
  renderedPathEndKey = null;
  renderedInvalidTargetKey = null;
  renderedSelectedTileKey = null;
  const fragment = document.createDocumentFragment();
  const spacer = document.createElement("span");
  spacer.className = "hex-grid-spacer";
  spacer.style.width = `${hexGridWidth()}px`;
  spacer.style.height = `${hexGridHeight()}px`;
  fragment.append(spacer);
  fragment.append(createHexEdgeLayer());
  for (let y = 0; y < dungeon.height; y += 1) {
    for (let x = 0; x < dungeon.width; x += 1) {
      const tile = dungeon.grid[y][x];
      const visible = tileVisibleToPlayers(tile);
      const isVoid = tile.type === "void";
      const tileElement = document.createElement(isVoid ? "span" : "button");
      if (!isVoid) tileElement.type = "button";
      tileElement.className = tileClassName(tile);
      if (selectedTile?.x === x && selectedTile?.y === y) tileElement.classList.add("is-selected");
      if (movementPreview?.path?.some((point) => point.x === x && point.y === y)) {
        tileElement.classList.add("is-path");
      }
      const pathEnd = movementPreview?.path?.[movementPreview.path.length - 1];
      if (pathEnd?.x === x && pathEnd?.y === y) tileElement.classList.add("is-path-end");
      if (invalidMoveTarget?.x === x && invalidMoveTarget?.y === y) tileElement.classList.add("is-invalid-target");
      tileElement.dataset.x = x;
      tileElement.dataset.y = y;
      const position = hexPosition(x, y);
      tileElement.style.left = `${position.left}px`;
      tileElement.style.top = `${position.top}px`;
      if (!isVoid) tileElement.title = visible ? `${tile.type} (${x}, ${y})` : "hidden";
      resetTileVisual(tileElement);
      if (visible) {
        renderTileGlyph(tileElement, tile.type);
      }
      const token = dungeon.tokens.find((item) => !item.isMoving && item.x === x && item.y === y && item.currentHp > 0 && tokenVisible(item));
      if (token) renderTokenInTile(tileElement, token);
      if (!isVoid) {
        tileElement.addEventListener("click", () => handleTileClick(x, y));
        tileElement.addEventListener("mouseenter", () => updateTokenDragPreview(x, y));
      }
      tileElements.set(pointKey({ x, y }), tileElement);
      fragment.append(tileElement);
    }
  }
  gridElement.append(fragment);
  applyDynamicTileClasses();
}

function applyHexSizing(metrics = hexMetrics()) {
  gridElement.style.setProperty("--tile-size", `${tileSize}px`);
  gridElement.style.setProperty("--hex-height", `${metrics.height}px`);
}

function updateHexLayout() {
  if (!dungeon || !tileElements.size) return;
  applyHexSizing();
  const spacer = gridElement.querySelector(".hex-grid-spacer");
  if (spacer) {
    spacer.style.width = `${hexGridWidth()}px`;
    spacer.style.height = `${hexGridHeight()}px`;
  }
  updateHexEdgeLayer();
  tileElements.forEach((tileElement) => {
    const x = Number(tileElement.dataset.x);
    const y = Number(tileElement.dataset.y);
    const position = hexPosition(x, y);
    tileElement.style.left = `${position.left}px`;
    tileElement.style.top = `${position.top}px`;
  });
}

function createHexEdgeLayer() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("hex-edge-layer");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  updateHexEdgeLayer(svg);
  return svg;
}

function updateHexEdgeLayer(svg = gridElement.querySelector(".hex-edge-layer")) {
  if (!svg || !dungeon) return;
  const width = hexGridWidth();
  const height = hexGridHeight();
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;
  svg.textContent = "";

  const edges = new Map();
  for (let y = 0; y < dungeon.height; y += 1) {
    for (let x = 0; x < dungeon.width; x += 1) {
      const tile = dungeon.grid[y][x];
      if (!tile || tile.type === "void") continue;
      if (!tileVisibleToPlayers(tile)) continue;
      const corners = hexCorners(x, y);
      for (let index = 0; index < corners.length; index += 1) {
        const start = corners[index];
        const end = corners[(index + 1) % corners.length];
        const key = edgeKey(start, end);
        const edge = edges.get(key) || { start, end, tileTypes: [] };
        edge.tileTypes.push(tile.type);
        edges.set(key, edge);
      }
    }
  }

  const fragment = document.createDocumentFragment();
  edges.forEach(({ start, end, tileTypes }) => {
    if (tileTypes.length > 1 && tileTypes.every((type) => type === "wall")) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", start.x.toFixed(3));
    line.setAttribute("y1", start.y.toFixed(3));
    line.setAttribute("x2", end.x.toFixed(3));
    line.setAttribute("y2", end.y.toFixed(3));
    fragment.append(line);
  });
  svg.append(fragment);
}

function scheduleHexEdgeLayerUpdate() {
  if (hexEdgeFrame !== null) return;
  hexEdgeFrame = window.requestAnimationFrame(() => {
    hexEdgeFrame = null;
    updateHexEdgeLayer();
  });
}

function hexCorners(x, y) {
  const position = hexPosition(x, y);
  const metrics = hexMetrics();
  const width = metrics.width;
  const height = metrics.height;
  return [
    { x: position.left + width * 0.25, y: position.top },
    { x: position.left + width * 0.75, y: position.top },
    { x: position.left + width, y: position.top + height / 2 },
    { x: position.left + width * 0.75, y: position.top + height },
    { x: position.left + width * 0.25, y: position.top + height },
    { x: position.left, y: position.top + height / 2 },
  ];
}

function edgeKey(start, end) {
  const a = `${start.x.toFixed(3)},${start.y.toFixed(3)}`;
  const b = `${end.x.toFixed(3)},${end.y.toFixed(3)}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function refreshTileElement(x, y) {
  const tile = dungeon?.grid[y]?.[x];
  const tileElement = tileElements.get(`${x},${y}`);
  if (!tile || !tileElement) return;
  const visible = tileVisibleToPlayers(tile);
  const isVoid = tile.type === "void";
  tileElement.className = tileClassName(tile);
  tileElement.title = !isVoid ? (visible ? `${tile.type} (${x}, ${y})` : "hidden") : "";
  resetTileVisual(tileElement);
  if (visible) {
    renderTileGlyph(tileElement, tile.type);
  }
  const token = dungeon.tokens.find((item) => !item.isMoving && item.x === x && item.y === y && item.currentHp > 0 && tokenVisible(item));
  if (token) renderTokenInTile(tileElement, token);
  applyClassesForTile(tileElement, x, y);
}

function tileClassName(tile) {
  const visible = tileVisibleToPlayers(tile);
  const classes = ["tile", cssTileType(tile.type), visible ? "is-revealed" : "is-hidden"];
  if (tileSeenButNotVisible(tile)) classes.push("is-out-of-sight");
  return classes.join(" ");
}

function renderTokenInTile(tileElement, token) {
  resetTileVisual(tileElement);
  tileElement.classList.add("has-token");
  const dot = document.createElement("span");
  dot.className = `token-dot ${token.type} ${selectedTokenId === token.id ? "is-active" : ""} ${tokenDragState?.tokenId === token.id ? "is-dragging" : ""}`;
  const maxHp = Math.max(1, Number(token.maxHp) || 1);
  const currentHp = Math.max(0, Math.min(maxHp, Number(token.currentHp) || 0));
  const tempHp = Math.max(0, Number(token.tempHp) || 0);
  const displayedCapacity = maxHp + tempHp;
  const hpPercent = (currentHp / displayedCapacity) * 100;
  const tempHpPercent = (tempHp / displayedCapacity) * 100;
  const hpBar = document.createElement("span");
  hpBar.className = "token-hp-bar";
  hpBar.style.setProperty("--hp-percent", `${hpPercent}%`);
  hpBar.style.setProperty("--temp-hp-percent", `${tempHpPercent}%`);
  const hpFill = document.createElement("span");
  hpFill.className = "token-hp-fill";
  const tempHpFill = document.createElement("span");
  tempHpFill.className = "token-temp-hp-fill";
  const hpText = document.createElement("span");
  hpText.className = "token-hp-text";
  hpText.textContent = `${currentHp}/${maxHp}`;
  if (tempHp > 0) {
    const tempHpText = document.createElement("small");
    tempHpText.className = "token-temp-hp-text";
    tempHpText.textContent = `+${tempHp}`;
    hpText.append(" ", tempHpText);
  }
  hpBar.append(hpFill, tempHpFill, hpText);
  dot.append(hpBar);
  if (token.image) {
    const image = document.createElement("img");
    image.src = token.image;
    image.alt = token.name;
    image.draggable = false;
    dot.append(image);
  } else {
    dot.textContent = token.type === "player" ? "P" : "M";
  }
  dot.addEventListener("mousedown", (event) => startTokenDrag(event, token));
  tileElement.append(dot);
}

function resetTileVisual(tileElement) {
  tileElement.classList.remove("has-token");
  const existingShape = tileElement.firstElementChild;
  if (existingShape?.classList.contains("hex-shape")) {
    while (existingShape.nextSibling) existingShape.nextSibling.remove();
    return;
  }
  tileElement.replaceChildren();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("hex-shape");
  svg.setAttribute("viewBox", "0 0 100 86.60254");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", "25 0 75 0 100 43.30127 75 86.60254 25 86.60254 0 43.30127");
  svg.append(polygon);
  tileElement.append(svg);
}

function renderTileGlyph(tileElement, tileType) {
  if (doorIcons[tileType]) {
    renderDoorIcon(tileElement, tileType);
    return;
  }
  const glyph = tileGlyphs[tileType] || "";
  if (!glyph) return;
  const label = document.createElement("span");
  label.className = "tile-glyph";
  label.textContent = glyph;
  tileElement.append(label);
}

function applyDynamicTileClasses() {
  const nextPathKeys = new Set((movementPreview?.path || []).map(pointKey));
  const nextPathEndKey = movementPreview?.path?.length ? pointKey(movementPreview.path[movementPreview.path.length - 1]) : null;
  const nextInvalidTargetKey = invalidMoveTarget ? pointKey(invalidMoveTarget) : null;
  const nextSelectedTileKey = selectedTile ? pointKey(selectedTile) : null;
  const pathUnchanged = renderedPathKeys.size === nextPathKeys.size &&
    [...renderedPathKeys].every((key) => nextPathKeys.has(key));
  if (
    pathUnchanged &&
    renderedPathEndKey === nextPathEndKey &&
    renderedInvalidTargetKey === nextInvalidTargetKey &&
    renderedSelectedTileKey === nextSelectedTileKey
  ) {
    return;
  }

  renderedPathKeys.forEach((key) => {
    tileElements.get(key)?.classList.remove("is-path");
  });
  if (renderedPathEndKey) tileElements.get(renderedPathEndKey)?.classList.remove("is-path-end");
  if (renderedInvalidTargetKey) tileElements.get(renderedInvalidTargetKey)?.classList.remove("is-invalid-target");
  if (renderedSelectedTileKey) tileElements.get(renderedSelectedTileKey)?.classList.remove("is-selected");

  renderedPathKeys = nextPathKeys;
  renderedPathEndKey = nextPathEndKey;
  renderedInvalidTargetKey = nextInvalidTargetKey;
  renderedSelectedTileKey = nextSelectedTileKey;

  renderedPathKeys.forEach((key) => {
    tileElements.get(key)?.classList.add("is-path");
  });
  if (renderedPathEndKey) tileElements.get(renderedPathEndKey)?.classList.add("is-path-end");
  if (renderedInvalidTargetKey) tileElements.get(renderedInvalidTargetKey)?.classList.add("is-invalid-target");
  if (renderedSelectedTileKey) tileElements.get(renderedSelectedTileKey)?.classList.add("is-selected");
}

function applyClassesForTile(tileElement, x, y) {
  const key = `${x},${y}`;
  tileElement.classList.toggle("is-selected", renderedSelectedTileKey === key);
  tileElement.classList.toggle("is-path", renderedPathKeys.has(key));
  tileElement.classList.toggle("is-path-end", renderedPathEndKey === key);
  tileElement.classList.toggle("is-invalid-target", renderedInvalidTargetKey === key);
}

function refreshTokenTiles(...points) {
  const keys = new Set(points.filter(Boolean).map(pointKey));
  keys.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    refreshTileElement(x, y);
  });
}

function hexMetrics() {
  const height = tileSize * 0.8660254;
  return {
    width: tileSize,
    height,
    stepX: tileSize * 0.75,
    stepY: height,
  };
}

function hexPosition(x, y) {
  const metrics = hexMetrics();
  return {
    left: x * metrics.stepX,
    top: y * metrics.stepY + (x & 1 ? metrics.stepY / 2 : 0),
  };
}

function hexCenter(x, y) {
  const position = hexPosition(x, y);
  const metrics = hexMetrics();
  return {
    x: position.left + metrics.width / 2,
    y: position.top + metrics.height / 2,
  };
}

function hexGridWidth() {
  const metrics = hexMetrics();
  return (dungeon.width - 1) * metrics.stepX + metrics.width;
}

function hexGridHeight() {
  const metrics = hexMetrics();
  return dungeon.height * metrics.stepY + metrics.stepY / 2;
}

function renderDoorIcon(tileElement, tileType) {
  const iconSrc = doorIcons[tileType];
  if (!iconSrc) return;
  const marker = tileGlyphs[tileType] || "";
  const image = document.createElement("img");
  image.className = "door-icon";
  image.src = iconSrc;
  image.alt = tileType;
  image.draggable = false;
  tileElement.append(image);
  if (tileType === "locked door" || tileType === "secret door") {
    const label = document.createElement("span");
    label.className = "door-marker";
    label.textContent = marker;
    tileElement.append(label);
  }
}

function setZoom(nextTileSize, anchorEvent = null) {
  const oldTileSize = tileSize;
  const clampedTileSize = Math.max(18, Math.min(128, nextTileSize));
  if (clampedTileSize === oldTileSize) return;

  let anchor = null;
  if (anchorEvent?.__anchor) {
    anchor = anchorEvent.__anchor;
  } else if (anchorEvent) {
    const rect = gridElement.getBoundingClientRect();
    anchor = {
      x: anchorEvent.clientX - rect.left + gridElement.scrollLeft,
      y: anchorEvent.clientY - rect.top + gridElement.scrollTop,
      screenX: anchorEvent.clientX - rect.left,
      screenY: anchorEvent.clientY - rect.top,
    };
  }

  tileSize = clampedTileSize;
  updateHexLayout();

  if (anchor) {
    const scale = tileSize / oldTileSize;
    gridElement.scrollLeft = anchor.x * scale - anchor.screenX;
    gridElement.scrollTop = anchor.y * scale - anchor.screenY;
  }
}

function handleMapWheel(event) {
  event.preventDefault();
  const direction = event.deltaY > 0 ? -1 : 1;
  const rect = gridElement.getBoundingClientRect();
  queuedZoom = {
    tileSize: Math.max(18, Math.min(128, (queuedZoom?.tileSize ?? tileSize) + direction * 4)),
    anchor: {
      x: event.clientX - rect.left + gridElement.scrollLeft,
      y: event.clientY - rect.top + gridElement.scrollTop,
      screenX: event.clientX - rect.left,
      screenY: event.clientY - rect.top,
    },
  };
  if (zoomFrame) return;
  zoomFrame = window.requestAnimationFrame(() => {
    zoomFrame = null;
    const nextZoom = queuedZoom;
    queuedZoom = null;
    if (!nextZoom) return;
    setZoom(nextZoom.tileSize, {
      clientX: nextZoom.anchor.screenX + gridElement.getBoundingClientRect().left,
      clientY: nextZoom.anchor.screenY + gridElement.getBoundingClientRect().top,
      __anchor: nextZoom.anchor,
    });
  });
}

function cssTileType(type) {
  return type.replace(/\s+/g, "-");
}

function tokenVisible(token) {
  if (viewModeSelect.value === "dm" || token.type === "player") return true;
  return playerSightTiles.has(pointKey(token));
}

function tileVisibleToPlayers(tile) {
  if (viewModeSelect.value === "dm") return true;
  return tile.visibility === "revealed" || playerSightTiles.has(pointKey(tile));
}

function tileSeenButNotVisible(tile) {
  if (viewModeSelect.value === "dm") return false;
  return tile.visibility === "revealed" && !playerSightTiles.has(pointKey(tile));
}

function pointKey(point) {
  return `${point.x},${point.y}`;
}

function characterDarkvisionFeet(character) {
  const darkvisionFeatures = [
    ...featureList(character?.race?.features),
    ...featureList(character?.subrace?.features),
  ].filter((feature) => /darkvision/i.test(feature));
  const ranges = darkvisionFeatures.flatMap((feature) =>
    [...feature.matchAll(/darkvision\D*?(\d+)\s*(?:ft\.?|feet)/gi)]
      .map((match) => Number(match[1]))
      .filter((range) => Number.isFinite(range) && range > 0),
  );
  return ranges.length ? Math.max(...ranges) : 0;
}

function activeVisionEffect(playerState = null) {
  const effect = playerState === null
    ? loadJson(playerVttStateKey, {}).activeVisionEffect
    : playerState?.activeVisionEffect;
  const feet = Number(effect?.feet);
  if (!effect?.source || !Number.isFinite(feet) || feet <= 0) return null;
  return { source: String(effect.source), feet };
}

function effectivePlayerVisionFeet(
  character = savedPlayerCharacter(),
  playerState = null,
) {
  return Math.max(
    characterDarkvisionFeet(character),
    activeVisionEffect(playerState)?.feet || 0,
  );
}

function playerSightRangeHexes(character = savedPlayerCharacter(), playerState = null) {
  const visionFeet = effectivePlayerVisionFeet(character, playerState);
  return visionFeet > 0 ? Math.max(1, Math.floor(visionFeet / 5)) : 1;
}

function computePlayerSightTiles({
  tokenIds = null,
  character = savedPlayerCharacter(),
  playerState = null,
} = {}) {
  const visible = new Set();
  if (!dungeon) return visible;
  const sightRange = playerSightRangeHexes(character, playerState);
  const requestedTokenIds = tokenIds
    ? new Set(tokenIds)
    : vttMode === "player" && activePlayerTokenId
      ? new Set([activePlayerTokenId])
      : null;
  const players = dungeon.tokens.filter((token) =>
    token.type === "player"
    && token.currentHp > 0
    && (!requestedTokenIds || requestedTokenIds.has(token.id)),
  );
  for (const player of players) {
    const startTile = dungeon.grid[player.y]?.[player.x];
    if (!startTile || !isSightTraversableTile(startTile)) continue;
    const queue = [{ x: player.x, y: player.y }];
    const visited = new Set([pointKey(player)]);
    visible.add(pointKey(player));

    while (queue.length) {
      const current = queue.shift();
      for (const neighbor of neighbors(current)) {
        const key = pointKey(neighbor);
        if (visited.has(key)) continue;
        visited.add(key);
        if (distance(player, neighbor) > sightRange) continue;
        const tile = dungeon.grid[neighbor.y]?.[neighbor.x];
        if (!tile || tile.type === "void") continue;
        if (!hasLineOfSight(player, neighbor)) continue;
        visible.add(key);
        if (isSightTraversableTile(tile)) queue.push(neighbor);
      }
    }
  }
  return visible;
}

function hasLineOfSight(from, to) {
  const line = gridLine(from, to);
  for (let index = 1; index < line.length; index += 1) {
    const point = line[index];
    const tile = dungeon.grid[point.y]?.[point.x];
    if (!tile) return false;
    if (isSightBlockingTile(tile)) return point.x === to.x && point.y === to.y;
  }
  return true;
}

function rememberSeenTiles() {
  if (!dungeon) return false;
  let revealedNewTile = false;
  playerSightTiles.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    const tile = dungeon.grid[y]?.[x];
    if (tile && tile.visibility !== "revealed") {
      tile.visibility = "revealed";
      revealedNewTile = true;
    }
  });
  return revealedNewTile;
}

function refreshVisionAfterMovement() {
  if (!dungeon) return;
  if (viewModeSelect.value === "dm") return;
  const previousSightTiles = new Set(playerSightTiles);
  playerSightTiles = computePlayerSightTiles();
  const revealedNewTile = rememberSeenTiles();
  if (revealedNewTile) scheduleHexEdgeLayerUpdate();
  refreshSightChangedTiles(previousSightTiles, playerSightTiles);
}

function gridLine(from, to) {
  const points = [];
  const fromCube = offsetToCube(from);
  const toCube = offsetToCube(to);
  const steps = distance(from, to) || 1;
  const seen = new Set();
  for (let index = 0; index <= steps; index += 1) {
    const cube = cubeRound(cubeLerp(fromCube, toCube, index / steps));
    const point = cubeToOffset(cube);
    const key = pointKey(point);
    if (!seen.has(key)) {
      points.push(point);
      seen.add(key);
    }
  }
  return points;
}

function isSightBlockingTile(tile) {
  return ["wall", "secret door"].includes(tile.type);
}

function isSightTraversableTile(tile) {
  return tile.type !== "void" && !isSightBlockingTile(tile);
}

function handleTileClick(x, y) {
  if (panState?.moved) return;
  if (tokenDragState?.moved) return;
  if (toggleDoorIfAllowed(x, y)) return;
  setSelectedTile({ x, y });
  const clickedToken = dungeon.tokens.find((token) => token.x === x && token.y === y && tokenVisible(token) && token.currentHp > 0);
  if (clickedToken) {
    selectedTokenId = clickedToken.id;
    refreshTokenTiles({ x: clickedToken.x, y: clickedToken.y });
    renderInspector();
    return;
  }

  renderInspector();
}

function toggleDoorIfAllowed(x, y) {
  const tile = dungeon.grid[y]?.[x];
  if (!tile || !doorTileTypes.has(tile.type)) return false;
  if (vttMode === "player" && !activePlayerAdjacentTo({ x, y })) return false;
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (vttMode === "player" && multiplayerState?.connected) {
    window.avtizmMultiplayer.submitAction("toggle-door", {
      x,
      y,
      shouldOpen: tile.type !== "open door",
    });
    setSelectedTile({ x, y });
    renderInspector();
    return true;
  }
  return setDoorOpenState(x, y, tile.type !== "open door");
}

function setDoorOpenState(x, y, shouldOpen) {
  const tile = dungeon.grid[y]?.[x];
  if (!tile || !doorTileTypes.has(tile.type)) return false;
  const door = dungeon.doors.find((item) => item.x === x && item.y === y);
  const nextType = shouldOpen ? "open door" : (door?.closedType || "door");
  if (tile.type === nextType) {
    setSelectedTile({ x, y });
    renderInspector();
    return true;
  }

  if (door) {
    if (shouldOpen && tile.type !== "open door") door.closedType = tile.type;
    door.open = nextType === "open door";
    door.type = nextType;
  }
  tile.type = nextType;
  setSelectedTile({ x, y });
  saveDungeonState();
  refreshAfterDoorChange(x, y);
  return true;
}

function activePlayerAdjacentTo(point) {
  const token = dungeon.tokens.find((item) => item.id === activePlayerTokenId && item.currentHp > 0);
  return Boolean(token && distance(token, point) === 1);
}

function setSelectedTile(point) {
  selectedTile = point;
  applyDynamicTileClasses();
}

function refreshAfterDoorChange(x, y) {
  const pointsToRefresh = new Set([`${x},${y}`]);
  for (const neighbor of neighbors({ x, y })) pointsToRefresh.add(pointKey(neighbor));
  if (viewModeSelect.value !== "dm") {
    const previousSightTiles = new Set(playerSightTiles);
    playerSightTiles = computePlayerSightTiles();
    rememberSeenTiles();
    scheduleHexEdgeLayerUpdate();
    refreshSightChangedTiles(previousSightTiles, playerSightTiles, pointsToRefresh);
    renderInspector();
    return;
  }
  pointsToRefresh.forEach((key) => {
    const [tileX, tileY] = key.split(",").map(Number);
    refreshTileElement(tileX, tileY);
  });
  renderInspector();
}

function refreshSightChangedTiles(previousSightTiles, nextSightTiles, extraKeys = new Set()) {
  const pointsToRefresh = new Set(extraKeys);
  previousSightTiles.forEach((key) => {
    if (!nextSightTiles.has(key)) pointsToRefresh.add(key);
  });
  nextSightTiles.forEach((key) => {
    if (!previousSightTiles.has(key)) pointsToRefresh.add(key);
  });
  pointsToRefresh.forEach((key) => {
    const [tileX, tileY] = key.split(",").map(Number);
    refreshTileElement(tileX, tileY);
  });
}

function startTokenDrag(event, token) {
  if (event.button !== 0) return;
  if (vttMode === "player" && token.id !== activePlayerTokenId) return;
  if (tokenMovementAnimating) return;
  event.preventDefault();
  event.stopPropagation();
  selectedTokenId = token.id;
  selectedTile = { x: token.x, y: token.y };
  tokenDragState = {
    tokenId: token.id,
    startX: token.x,
    startY: token.y,
    moved: false,
  };
  lastDragPreviewKey = pointKey({ x: token.x, y: token.y });
  movementPreview = {
    tokenId: token.id,
    path: [{ x: token.x, y: token.y }],
    valid: true,
    feet: 0,
  };
  updatePathDistance("0 ft", false);
  refreshTokenTiles({ x: token.x, y: token.y });
  applyDynamicTileClasses();
}

function updateTokenDragPreview(x, y) {
  if (!tokenDragState || !dungeon) return;
  const nextKey = `${x},${y}`;
  if (lastDragPreviewKey === nextKey) return;
  lastDragPreviewKey = nextKey;
  const token = dungeon.tokens.find((item) => item.id === tokenDragState.tokenId);
  if (!token) return;
  const path = findMovementPath(token, x, y);
  tokenDragState.moved = tokenDragState.moved || x !== tokenDragState.startX || y !== tokenDragState.startY;
  if (!path.length) {
    const unrestrictedPath = findPath(
      { x: token.x, y: token.y },
      { x, y },
      token.id,
    );
    const allowance = playerMovementAllowance(token);
    if (
      vttMode === "player"
      && unrestrictedPath.length > allowance + 1
    ) {
      movementPreview = {
        tokenId: token.id,
        path: unrestrictedPath.slice(0, allowance + 1),
        valid: false,
        feet: allowance * 5,
      };
      invalidMoveTarget = { x, y };
      updatePathDistance(
        `Too far — maximum ${allowance * 5} ft (${allowance} hexes)`,
        true,
      );
      applyDynamicTileClasses();
      return;
    }
    const preview = findPathTowardClosedDoor(token, x, y);
    movementPreview = {
      tokenId: token.id,
      path: preview.path,
      valid: false,
      feet: Math.max(0, preview.path.length - 1) * 5,
    };
    invalidMoveTarget = preview.blockedAt || null;
    const hexes = Math.max(0, preview.path.length - 1);
    updatePathDistance(
      preview.blockedAt && hexes ? `Blocked by door after ${hexes * 5} ft (${hexes} hexes)` : "No path",
      Boolean(preview.blockedAt),
    );
    applyDynamicTileClasses();
    return;
  }

  const hexes = Math.max(0, path.length - 1);
  movementPreview = {
    tokenId: token.id,
    path,
    valid: true,
    feet: hexes * 5,
  };
  invalidMoveTarget = null;
  updatePathDistance(`${hexes * 5} ft (${hexes} hexes)`, false);
  applyDynamicTileClasses();
}

function updateTokenDragPreviewFromEvent(event) {
  if (!tokenDragState) return;
  const point = gridPointFromEvent(event);
  if (!point) return;
  queuedDragPoint = point;
  if (dragPreviewFrame) return;
  dragPreviewFrame = window.requestAnimationFrame(() => {
    dragPreviewFrame = null;
    const nextPoint = queuedDragPoint;
    queuedDragPoint = null;
    if (nextPoint) updateTokenDragPreview(nextPoint.x, nextPoint.y);
  });
}

function gridPointFromEvent(event) {
  const rect = gridElement.getBoundingClientRect();
  const metrics = hexMetrics();
  const contentX = event.clientX - rect.left + gridElement.scrollLeft;
  const contentY = event.clientY - rect.top + gridElement.scrollTop;
  const guessX = Math.round((contentX - metrics.width / 2) / metrics.stepX);
  let best = null;

  for (let x = guessX - 2; x <= guessX + 2; x += 1) {
    if (x < 0 || x >= dungeon.width) continue;
    const offsetY = x & 1 ? metrics.stepY / 2 : 0;
    const guessY = Math.round((contentY - offsetY - metrics.height / 2) / metrics.stepY);
    for (let y = guessY - 2; y <= guessY + 2; y += 1) {
      if (y < 0 || y >= dungeon.height) continue;
      const center = hexCenter(x, y);
      const dx = center.x - contentX;
      const dy = center.y - contentY;
      const score = dx * dx + dy * dy;
      if (!best || score < best.score) best = { x, y, score };
    }
  }

  if (!best) return null;
  const maxDistance = Math.max(metrics.width, metrics.height) * 0.62;
  return best.score <= maxDistance * maxDistance ? { x: best.x, y: best.y } : null;
}

async function finishTokenDrag(event) {
  if (!tokenDragState) return;
  const releasePoint = gridPointFromEvent(event);
  if (releasePoint) updateTokenDragPreview(releasePoint.x, releasePoint.y);
  const token = dungeon.tokens.find((item) => item.id === tokenDragState.tokenId);
  const path = movementPreview?.valid ? movementPreview.path : [];
  const start = token ? { x: token.x, y: token.y } : null;
  tokenDragState = null;
  movementPreview = null;
  invalidMoveTarget = null;
  queuedDragPoint = null;
  lastDragPreviewKey = null;
  if (dragPreviewFrame) {
    window.cancelAnimationFrame(dragPreviewFrame);
    dragPreviewFrame = null;
  }
  updatePathDistance("", false);
  applyDynamicTileClasses();
  if (start) refreshTokenTiles(start);

  if (token && path.length > 1) {
    await submitOrAnimateMovement(token, path);
  }
  renderInspector();
}

async function submitOrAnimateMovement(token, path) {
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (vttMode === "player" && multiplayerState?.connected) {
    const actionId = await window.avtizmMultiplayer.submitAction("move-token", {
      tokenId: token.id,
      path: path.map((point) => ({ x: point.x, y: point.y })),
    });
    if (!actionId) return false;
    await animateTokenAlongPath(token, path, 45);
    return true;
  }
  await animateTokenAlongPath(token, path);
  saveDungeonState();
  return true;
}

async function animateTokenAlongPath(token, path, stepDuration = 95) {
  tokenMovementAnimating = true;
  token.isMoving = true;
  refreshTokenTiles({ x: token.x, y: token.y });
  const movingToken = createMovingToken(token, path[0]);
  try {
    for (let index = 1; index < path.length; index += 1) {
      const step = path[index];
      const previous = { x: token.x, y: token.y };
      await glideMovingToken(movingToken, previous, step, stepDuration);
      token.x = step.x;
      token.y = step.y;
      const room = roomAt(step.x, step.y);
      if (room) {
        token.roomId = room.id;
        if (token.type === "player") revealRoom(dungeon, room.id);
      }
      selectedTile = { x: step.x, y: step.y };
      refreshVisionAfterMovement();
      applyDynamicTileClasses();
      refreshTokenTiles(previous);
      renderInspector();
    }
  } finally {
    movingToken?.remove();
    token.isMoving = false;
    const finalStep = path[path.length - 1];
    if (finalStep) refreshTokenTiles(finalStep);
    tokenMovementAnimating = false;
  }
}

function createMovingToken(token, start) {
  const dot = document.createElement("span");
  dot.className = `token-dot moving-token ${token.type}`;
  if (token.image) {
    const image = document.createElement("img");
    image.src = token.image;
    image.alt = token.name;
    image.draggable = false;
    dot.append(image);
  } else {
    dot.textContent = token.type === "player" ? "P" : "M";
  }
  positionMovingToken(dot, start);
  gridElement.append(dot);
  return dot;
}

function positionMovingToken(element, point) {
  const center = hexCenter(point.x, point.y);
  element.style.transform = `translate(${center.x}px, ${center.y}px) translate(-50%, -50%)`;
}

function glideMovingToken(element, from, to, duration) {
  if (!element) return wait(duration);
  const fromCenter = hexCenter(from.x, from.y);
  const toCenter = hexCenter(to.x, to.y);
  const start = performance.now();
  return new Promise((resolve) => {
    const stepFrame = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = elapsed < 0.5 ? 2 * elapsed * elapsed : 1 - ((-2 * elapsed + 2) ** 2) / 2;
      const x = fromCenter.x + (toCenter.x - fromCenter.x) * eased;
      const y = fromCenter.y + (toCenter.y - fromCenter.y) * eased;
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (elapsed < 1) {
        window.requestAnimationFrame(stepFrame);
      } else {
        resolve();
      }
    };
    window.requestAnimationFrame(stepFrame);
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cancelTokenDrag() {
  if (!tokenDragState) return;
  const token = dungeon.tokens.find((item) => item.id === tokenDragState.tokenId);
  tokenDragState = null;
  movementPreview = null;
  invalidMoveTarget = null;
  queuedDragPoint = null;
  lastDragPreviewKey = null;
  if (dragPreviewFrame) {
    window.cancelAnimationFrame(dragPreviewFrame);
    dragPreviewFrame = null;
  }
  updatePathDistance("", false);
  applyDynamicTileClasses();
  if (token) refreshTokenTiles({ x: token.x, y: token.y });
}

function updatePathDistance(text, blocked) {
  pathDistanceElement.textContent = text;
  pathDistanceElement.classList.toggle("is-hidden", !text);
  pathDistanceElement.classList.toggle("is-blocked", blocked);
}

function startRightClickPan(event) {
  if (event.button !== 2) return;
  event.preventDefault();
  panState = {
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: gridElement.scrollLeft,
    scrollTop: gridElement.scrollTop,
    moved: false,
  };
  gridElement.classList.add("is-panning");
}

function moveRightClickPan(event) {
  if (!panState) return;
  event.preventDefault();
  queuedPanEvent = { x: event.clientX, y: event.clientY };
  if (panFrame) return;
  panFrame = window.requestAnimationFrame(() => {
    panFrame = null;
    applyQueuedPan();
  });
}

function applyQueuedPan() {
  if (!panState || !queuedPanEvent) return;
  const dx = queuedPanEvent.x - panState.startX;
  const dy = queuedPanEvent.y - panState.startY;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) panState.moved = true;
  gridElement.scrollLeft = panState.scrollLeft - dx;
  gridElement.scrollTop = panState.scrollTop - dy;
  queuedPanEvent = null;
}

function endRightClickPan() {
  if (!panState) return;
  if (panFrame) {
    window.cancelAnimationFrame(panFrame);
    panFrame = null;
  }
  applyQueuedPan();
  window.setTimeout(() => {
    panState = null;
  }, 0);
  gridElement.classList.remove("is-panning");
}

function canMoveTo(x, y, token) {
  const tile = dungeon.grid[y]?.[x];
  if (!tile || !walkableTiles.has(tile.type)) return false;
  if (tokenAtOccupiesDestination(x, y, token)) return false;
  return true;
}

function findMovementPath(token, x, y) {
  const tile = dungeon.grid[y]?.[x];
  if (!tile || !walkableTiles.has(tile.type)) return [];
  if (tokenAtOccupiesDestination(x, y, token)) return [];
  const maxSteps = vttMode === "player"
    ? playerMovementAllowance(token)
    : Infinity;
  return findPath({ x: token.x, y: token.y }, { x, y }, token.id, maxSteps);
}

function playerMovementAllowance(token) {
  return Math.max(1, Number(token?.movement) || 6);
}

function findPathTowardClosedDoor(token, x, y) {
  const line = gridLine({ x: token.x, y: token.y }, { x, y });
  const path = [{ x: token.x, y: token.y }];
  for (let index = 1; index < line.length; index += 1) {
    const point = line[index];
    const tile = dungeon.grid[point.y]?.[point.x];
    if (tile && isClosedDoorType(tile.type)) {
      return { path, valid: false, blockedAt: point };
    }
    if (!tile || !walkableTiles.has(tile.type)) return { path: [{ x: token.x, y: token.y }], valid: false, blockedAt: null };
    path.push(point);
  }
  return { path, valid: true, blockedAt: null };
}

function tokenBlocksMovementAt(x, y, movingToken, isDestination) {
  return dungeon.tokens.some((other) => {
    if (other.id === movingToken.id || other.currentHp <= 0 || other.x !== x || other.y !== y) return false;
    return isDestination || other.type !== movingToken.type;
  });
}

function tokenAtOccupiesDestination(x, y, movingToken) {
  return dungeon.tokens.some(
    (other) =>
      other.id !== movingToken.id &&
      other.x === x &&
      other.y === y &&
      other.currentHp > 0,
  );
}

function renderInspector() {
  const tile = selectedTile ? dungeon.grid[selectedTile.y]?.[selectedTile.x] : null;
  const room = tile?.roomId ? dungeon.rooms.find((item) => item.id === tile.roomId) : null;
  const reward = tile?.rewardId ? dungeon.rewardPlacements.find((item) => item.id === tile.rewardId) : null;
  const trap = tile?.trapId ? dungeon.traps.find((item) => item.id === tile.trapId) : null;
  const token = selectedTokenId ? dungeon.tokens.find((item) => item.id === selectedTokenId) : null;
  const canControlDoor = vttMode === "dm" && selectedTile && tile && doorTileTypes.has(tile.type);
  const isExitReward = vttMode === "dm" && tile?.type === "exit tile";
  const canGiveReward = vttMode === "dm" && (
    (reward && !reward.availableToPlayers && !reward.claimed) ||
    (isExitReward && !dungeon.exitRewardAvailable && !dungeon.exitRewardClaimed)
  );
  const rewardStatus = reward
    ? reward.claimed
      ? "claimed"
      : reward.availableToPlayers
        ? "ready for players"
        : "not given"
    : "";
  const exitRewardStatus = isExitReward
    ? dungeon.exitRewardClaimed
      ? "claimed"
      : dungeon.exitRewardAvailable
        ? "ready for players"
        : "not given"
    : "";
  inspectorElement.innerHTML = `
    ${tile ? `<p class="detail-row"><strong>Tile:</strong> ${tile.type} at ${tile.x}, ${tile.y}</p>` : ""}
    ${room ? `<p class="detail-row"><strong>Room:</strong> ${room.name} (${room.type})</p><p class="detail-row">${room.description}</p>` : ""}
    ${reward ? `<p class="detail-row"><strong>Money reward:</strong> ASI (${rewardStatus})</p>` : ""}
    ${isExitReward ? `<p class="detail-row"><strong>X reward:</strong> Level Up (${exitRewardStatus})</p>` : ""}
    ${trap ? `<p class="detail-row"><strong>Trap:</strong> ${trap.name} (${trap.difficulty})</p>` : ""}
    ${token ? `<p class="detail-row"><strong>Token:</strong> ${token.name}</p>` : ""}
    ${canControlDoor ? `<div class="door-actions"><button type="button" data-door-action="open">Open</button><button type="button" data-door-action="close">Close</button></div>` : ""}
    ${canGiveReward ? `<div class="door-actions"><button type="button" data-give-reward="${isExitReward ? "exit-reward" : reward.id}">Give ${isExitReward ? "Level Up" : "ASI"} Reward</button></div>` : ""}
  `;
  if (canControlDoor) {
    inspectorElement.querySelectorAll("[data-door-action]").forEach((button) => {
      button.addEventListener("click", () => {
        setDoorOpenState(selectedTile.x, selectedTile.y, button.dataset.doorAction === "open");
      });
    });
  }
  inspectorElement.querySelectorAll("[data-give-reward]").forEach((button) => {
    button.addEventListener("click", () => giveDungeonReward(button.dataset.giveReward));
  });
}

function abilityModifier(score) {
  return Math.floor((Number(score || 10) - 10) / 2);
}

function modifierText(score) {
  const modifier = abilityModifier(score);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function savedPlayerCharacter() {
  const character = loadJson(savedCharacterKey, null);
  if (character && !Array.isArray(character.inventory)) {
    character.inventory = startingInventory.map((item) => ({ ...item }));
    localStorage.setItem(savedCharacterKey, JSON.stringify(character));
  }
  return character;
}

function activePlayerToken() {
  return dungeon?.tokens.find((token) => token.id === activePlayerTokenId) || null;
}

function playerSheetDefaults(character) {
  const token = activePlayerToken();
  return {
    currentHp: character?.currentHp ?? character?.hp?.max ?? token?.currentHp ?? token?.maxHp ?? 10,
    tempHp: character?.tempHp ?? token?.tempHp ?? 0,
    currentMana: character?.currentMana ?? character?.mana?.current ?? character?.mana?.max ?? 0,
  };
}

function loadPlayerVttState(character) {
  const saved = loadJson(playerVttStateKey, {});
  const defaults = playerSheetDefaults(character);
  const maxHp = Math.max(1, Number(character?.hp?.max ?? activePlayerToken()?.maxHp) || 10);
  const previousMaxHp = Math.max(
    1,
    Number(saved.maxHp ?? activePlayerToken()?.maxHp ?? maxHp) || maxHp,
  );
  const savedCurrentHp = Number(saved.currentHp ?? defaults.currentHp);
  const gainedMaxHp = Math.max(0, maxHp - previousMaxHp);
  const currentHp = Math.max(0, Math.min(maxHp, (Number.isFinite(savedCurrentHp) ? savedCurrentHp : maxHp) + gainedMaxHp));

  return {
    ...defaults,
    ...saved,
    currentHp,
    tempHp: Math.max(0, Number(saved.tempHp ?? defaults.tempHp) || 0),
    currentMana: Math.max(0, Number(saved.currentMana ?? defaults.currentMana) || 0),
    maxHp,
  };
}

function savePlayerVttState(state) {
  localStorage.setItem(playerVttStateKey, JSON.stringify(state));
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (vttMode === "player" && multiplayerState?.connected) {
    window.avtizmMultiplayer.syncCharacter(savedPlayerCharacter(), state);
  }
}

function synchronizePlayerHp() {
  const character = savedPlayerCharacter();
  const token = activePlayerToken();
  if (!character || !token) return;

  const state = loadPlayerVttState(character);
  const maxHp = Math.max(1, Number(character.hp?.max) || 10);
  const changed =
    token.currentHp !== state.currentHp ||
    token.tempHp !== state.tempHp ||
    token.maxHp !== maxHp;

  token.currentHp = state.currentHp;
  token.tempHp = state.tempHp;
  token.maxHp = maxHp;
  if (changed) {
    savePlayerVttState(state);
    saveDungeonState();
  }
}

function choiceName(choice) {
  return choice?.name || "";
}

function textValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.name && value.text) return `${value.name}: ${value.text}`;
    if (value.name && value.description) return `${value.name}: ${value.description}`;
    if (value.label && value.detail) return `${value.label}: ${value.detail}`;
    return value.text || value.description || value.detail || value.name || value.displayName || "";
  }
  return String(value);
}

function featureLabel(feature) {
  const text = textValue(feature);
  return text.includes(":") ? text.split(":")[0] : "";
}

function featureDetail(feature) {
  const text = textValue(feature);
  return text.includes(":") ? text.slice(text.indexOf(":") + 1).trim() : text;
}

function featureList(features) {
  return (Array.isArray(features) ? features : [features])
    .map(textValue)
    .filter(Boolean);
}

function labeledFeatureValue(features, label) {
  const feature = featureList(features).find((item) =>
    item.startsWith(`${label}:`),
  );
  return feature ? featureDetail(feature) : "";
}

function rewardHistory() {
  const rewards = loadJson(rewardHistoryKey, []);
  return Array.isArray(rewards) ? rewards : [];
}

function giveDungeonReward(rewardId) {
  if (!dungeon || vttMode !== "dm") return;
  const awardedAt = new Date().toISOString();
  if (rewardId === "exit-reward") {
    if (dungeon.exitRewardClaimed) return;
    dungeon.exitRewardAvailable = true;
    dungeon.exitRewardAwardedAt = awardedAt;
  } else {
    const reward = dungeon.rewardPlacements?.find((item) => item.id === rewardId);
    if (!reward || reward.claimed) return;
    reward.availableToPlayers = true;
    reward.awardedAt = awardedAt;
    reward.awardedAs = "asi";
  }
  saveDungeonState();
  renderInspector();
}

function unclaimedDungeonRewards() {
  if (!dungeon) return [];
  const placements = Array.isArray(dungeon.rewardPlacements) ? dungeon.rewardPlacements : [];
  const moneyRewards = placements
    .filter((reward) => reward.availableToPlayers && !reward.claimed)
    .map((reward) => {
      const tile = dungeon.grid[reward.y]?.[reward.x];
      if (!tile || tile.type !== "reward tile") return null;
      return {
        ...reward,
        action: "asi",
        label: "Money",
        rewardName: "ASI",
        canClaim: true,
        sortTime: reward.awardedAt || "",
      };
    })
    .filter(Boolean);

  const exitReward = !dungeon.exitRewardAvailable || dungeon.exitRewardClaimed
    ? null
    : dungeon.grid
        .flat()
        .find((tile) => tile?.type === "exit tile") || {};
  const exitRewards = exitReward
    ? [{
        id: "exit-reward",
        x: exitReward.x,
        y: exitReward.y,
        action: "level-up",
        label: "X",
        rewardName: "Level Up",
        canClaim: true,
        sortTime: dungeon.exitRewardAwardedAt || "",
      }]
    : [];

  return [...exitRewards, ...moneyRewards]
    .sort((a, b) => a.sortTime.localeCompare(b.sortTime) || a.label.localeCompare(b.label));
}

function claimDungeonReward(rewardId) {
  const claimableReward = unclaimedDungeonRewards().find((item) => item.id === rewardId);
  if (!claimableReward?.canClaim) return;
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (vttMode === "player" && multiplayerState?.connected) {
    window.avtizmMultiplayer.submitAction("claim-reward", { rewardId });
  }
  const claimedAt = new Date().toISOString();
  if (rewardId === "exit-reward") {
    dungeon.exitRewardClaimed = true;
    dungeon.exitRewardClaimedAt = claimedAt;
  } else {
    const reward = dungeon?.rewardPlacements?.find((item) => item.id === rewardId);
    if (!reward) return;
    reward.claimed = true;
    reward.claimedAt = claimedAt;
    reward.claimedAs = claimableReward.action;
  }
  saveDungeonState();
  const returnUrl = `${window.location.pathname.split("/").pop() || "dungeon-player.html"}${window.location.search || ""}`;
  localStorage.setItem(
    pendingDungeonRewardKey,
    JSON.stringify({
      action: claimableReward.action,
      rewardId,
      source: claimableReward.label,
      returnUrl,
      claimedAt,
    }),
  );
  window.location.href = `future.html?reward=${encodeURIComponent(claimableReward.action)}&return=${encodeURIComponent(returnUrl)}`;
}

function objectList(items) {
  if (Array.isArray(items)) return items;
  return items ? [items] : [];
}

function spellKindLabel(kind) {
  if (!kind) return "Spell";
  if (kind === "cantrips") return "Cantrip";
  const text = textValue(kind);
  if (/^level\d+$/i.test(text)) return `Level ${text.replace(/\D/g, "")}`;
  return text;
}

function spellKindRank(kind) {
  if (/cantrip/i.test(kind || "")) return 0;
  const levelMatch = /level\s*(\d+)/i.exec(kind || "");
  return levelMatch ? Number(levelMatch[1]) : 99;
}

function proficiencyBonus(level) {
  return 2 + Math.floor(((Number(level) || 1) - 1) / 4);
}

function spellcastingAbility(character) {
  const spellcastingFeature = featureList(character?.class?.features).find((feature) =>
    feature.startsWith("Spellcasting:"),
  );
  const match = /spellcasting ability is\s+(\w+)/i.exec(spellcastingFeature || "");
  if (match) {
    return {
      Strength: "str",
      Dexterity: "dex",
      Constitution: "con",
      Intelligence: "int",
      Wisdom: "wis",
      Charisma: "cha",
    }[match[1]] || "";
  }
  return "";
}

function spellSaveDc(character) {
  const ability = spellcastingAbility(character);
  if (!ability) return null;
  return 8 + proficiencyBonus(character?.hp?.level || 1) + abilityModifier(character?.stats?.[ability]);
}

function characterSavingThrows(character) {
  const saves = labeledFeatureValue(character?.class?.features, "Saves");
  const saveMap = {
    STR: "str",
    DEX: "dex",
    CON: "con",
    INT: "int",
    WIS: "wis",
    CHA: "cha",
    Strength: "str",
    Dexterity: "dex",
    Constitution: "con",
    Intelligence: "int",
    Wisdom: "wis",
    Charisma: "cha",
  };
  return new Set(
    (saves.match(/STR|DEX|CON|INT|WIS|CHA|Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma/g) || [])
      .map((save) => saveMap[save])
      .filter(Boolean),
  );
}

function characterSpeed(character) {
  const featureText = [
    labeledFeatureValue(character?.race?.features, "Speed"),
    ...featureList(character?.subrace?.features),
    ...featureList(character?.originFeat?.features),
    ...featureList(character?.humanFeat?.features),
  ].join(" ");
  const speeds = [...featureText.matchAll(/(?:Speed (?:increases to|is)|speed increases (?:by \d+ feet to|to)|speed of)\s*(\d+)\s*ft/gi)]
    .map((match) => Number(match[1]));
  if (speeds.length > 0) return `${Math.max(...speeds)} ft.`;
  return labeledFeatureValue(character?.race?.features, "Speed") || "30 ft.";
}

function characterDarkvision(character) {
  const darkvisionFeet = characterDarkvisionFeet(character);
  return darkvisionFeet > 0 ? `${darkvisionFeet} ft.` : "None";
}

function characterVision(character) {
  const naturalVisionFeet = characterDarkvisionFeet(character);
  const effect = activeVisionEffect();
  if (!effect) return characterDarkvision(character);
  const effectiveVisionFeet = Math.max(naturalVisionFeet, effect.feet);
  let source = effect.source;
  if (source === "torch") source = naturalVisionFeet >= effect.feet ? "Torch lit" : "Torch";
  return `${effectiveVisionFeet} ft. (${source})`;
}

function characterHitDie(character) {
  const hp = Number(labeledFeatureValue(character?.class?.features, "HP"));
  return Number.isFinite(hp) && hp > 0 ? `d${hp}` : "d8";
}

function playerRaceTokenImage(character) {
  const raceName = choiceName(character?.race);
  if (raceTokenImages[raceName]) return raceTokenImages[raceName];
  const normalizedRaceName = raceName.toLowerCase();
  const matchedRace = Object.keys(raceTokenImages).find((name) =>
    normalizedRaceName.includes(name.toLowerCase()),
  );
  return matchedRace ? raceTokenImages[matchedRace] : "";
}

function addPlayerSpell(spells, spell, source, fallbackKind = "") {
  const name = typeof spell === "string" ? spell : spell?.name;
  if (!name) return;
  const kind = spellKindLabel(spell.level || spell.kind || fallbackKind);
  const key = `${String(name).toLowerCase()}::${kind.toLowerCase()}`;
  if (spells.some((entry) => entry.key === key)) return;
  spells.push({
    key,
    name: String(name),
    kind,
    school: spell.school || "",
    source,
  });
}

function playerSpellGroups(character) {
  const spells = [];
  const startingSpells =
    Array.isArray(character?.startingSpells) && character.startingSpells.length > 0
      ? character.startingSpells
      : [character?.startingSpell].filter(Boolean);

  startingSpells.forEach((spell) => addPlayerSpell(spells, spell, "Starting Class"));

  [character?.originFeat, character?.humanFeat].forEach((feat) => {
    const magicInitiate = feat?.magicInitiate;
    if (!magicInitiate) return;
    objectList(magicInitiate.cantrips).forEach((spell) =>
      addPlayerSpell(spells, spell, `Magic Initiate (${magicInitiate.sourceClass})`, "Cantrip"),
    );
    addPlayerSpell(spells, magicInitiate.spell, `Magic Initiate (${magicInitiate.sourceClass})`, "Level 1");
  });

  rewardHistory().forEach((reward) => {
    addPlayerSpell(spells, reward.spellChoice, reward.name || "Reward", reward.spellChoice?.kind || "");
    addPlayerSpell(
      spells,
      reward.magicItemChoice?.spellScrollSpell,
      rewardDisplayName(reward),
      `level${reward.magicItemChoice?.spellScrollLevel || 1}`,
    );
    const magicInitiate = reward.featChoice?.magicInitiate;
    if (!magicInitiate) return;
    objectList(magicInitiate.cantrips).forEach((spell) =>
      addPlayerSpell(spells, spell, `Magic Initiate (${magicInitiate.sourceClass})`, "Cantrip"),
    );
    addPlayerSpell(spells, magicInitiate.spell, `Magic Initiate (${magicInitiate.sourceClass})`, "Level 1");
  });

  const sortedSpells = spells.sort(
    (a, b) =>
      spellKindRank(a.kind) - spellKindRank(b.kind) ||
      a.name.localeCompare(b.name),
  );
  return sortedSpells.reduce((groups, spell) => {
    if (!groups.has(spell.kind)) groups.set(spell.kind, []);
    groups.get(spell.kind).push(spell);
    return groups;
  }, new Map());
}

function rewardDisplayName(reward) {
  return textValue(reward?.displayName || reward?.name || reward?.category) || "Item";
}

function isInventoryReward(reward) {
  const text = `${textValue(reward?.name)} ${textValue(reward?.displayName)} ${textValue(reward?.category)} ${textValue(reward?.text)}`;
  return /relic|treasure|magic item|potion|gold|coin|trade goods?|inventory|item/i.test(text);
}

function rewardQuantity(reward) {
  if (Number.isFinite(Number(reward?.quantity))) return Math.max(1, Number(reward.quantity));
  const text = `${textValue(reward?.displayName || reward?.name)} ${textValue(reward?.text)}`;
  const match = /\b(?:x|qty\.?|quantity)?\s*(\d+)\b/i.exec(text);
  if (match && /potion|gold|coin|arrow|bolt|ration|inventory/i.test(text)) return Number(match[1]);
  return 1;
}

function playerInventoryEntries() {
  const groups = new Map();
  const character = savedPlayerCharacter();

  (Array.isArray(character?.inventory) ? character.inventory : []).forEach((item, index) => {
    const name = textValue(item.name) || "Item";
    const itemText = textValue(item.text) || "Inventory item.";
    const meta = textValue(item.source) || "Inventory";
    const key = `character::${name}::${meta}::${itemText}`;
    groups.set(key, {
      key,
      name,
      meta,
      text: itemText,
      quantity: Math.max(1, Number(item.quantity) || 1),
      characterIndexes: [index],
      indexes: [],
    });
  });

  rewardHistory().forEach((reward, index) => {
    if (!isInventoryReward(reward)) return;
    const name = rewardDisplayName(reward);
    const meta = [textValue(reward.rarity), textValue(reward.category)].filter(Boolean).join(" - ");
    const itemText = textValue(reward.text) || "Inventory item.";
    const key = `${name}::${meta}::${itemText}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name,
        meta: "Item",
        text: itemText,
        quantity: 0,
        characterIndexes: [],
        indexes: [],
      });
    }
    const entry = groups.get(key);
    entry.quantity += rewardQuantity(reward);
    entry.indexes.push(index);
  });
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function removeOneInventoryItem(entryKey) {
  const entries = playerInventoryEntries();
  const entry = entries.find((item) => item.key === entryKey);
  if (!entry) return false;
  if (entry.characterIndexes?.length) {
    const character = savedPlayerCharacter();
    const index = entry.characterIndexes[0];
    const item = character?.inventory?.[index];
    if (!item) return false;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (quantity > 1) {
      character.inventory[index] = { ...item, quantity: quantity - 1 };
    } else {
      character.inventory.splice(index, 1);
    }
    localStorage.setItem(savedCharacterKey, JSON.stringify(character));
    return true;
  }

  const rewards = rewardHistory();
  const index = entry.indexes[0];
  const reward = rewards[index];
  if (!reward) return false;

  const quantity = rewardQuantity(reward);
  if (quantity > 1) {
    rewards[index] = { ...reward, quantity: quantity - 1 };
  } else {
    rewards.splice(index, 1);
  }
  localStorage.setItem(rewardHistoryKey, JSON.stringify(rewards));
  return true;
}

function isTorchInventoryEntry(entry) {
  return /^torch(?:es)?$/i.test(textValue(entry?.name).trim());
}

function lightTorch(entryKey) {
  if (activeVisionEffect()?.source === "torch") return;
  const entry = playerInventoryEntries().find((item) => item.key === entryKey);
  if (!isTorchInventoryEntry(entry) || !removeOneInventoryItem(entryKey)) return;
  const state = loadPlayerVttState(savedPlayerCharacter());
  savePlayerVttState({
    ...state,
    activeVisionEffect: { source: "torch", feet: 40 },
  });
  refreshVisionAfterMovement();
  renderPlayerSidebar();
}

function extinguishTorch() {
  const state = loadPlayerVttState(savedPlayerCharacter());
  if (state.activeVisionEffect?.source !== "torch") return;
  const nextState = { ...state };
  delete nextState.activeVisionEffect;
  savePlayerVttState(nextState);
  refreshVisionAfterMovement();
  renderPlayerSidebar();
}

function characterFeatureGroups(character) {
  if (!character) return [];
  return [
    [choiceName(character.race), featureList(character.race?.features)],
    [choiceName(character.subrace), featureList(character.subrace?.features)],
    [choiceName(character.class), featureList(character.class?.features)],
    [choiceName(character.classOption), featureList(character.classOption?.features)],
    [choiceName(character.originFeat), featureList(character.originFeat?.features)],
    [choiceName(character.humanFeat), featureList(character.humanFeat?.features)],
  ]
    .filter(([source, features]) => source && features.length > 0)
    .map(([source, features]) => ({
      source,
      features: features
        .map((feature) => ({
          name: featureLabel(feature) || source,
          text: featureDetail(feature),
        }))
        .filter((feature) => feature.text && !/^(Creature Type|Size|Speed|Stats|Saves|HP|Armor|Weapons)$/i.test(feature.name)),
    }))
    .filter((group) => group.features.length > 0);
}

function renderPlayerSidebarSafely() {
  if (!sidebarElement) return;
  try {
    renderPlayerSidebar();
  } catch (error) {
    console.error(error);
    sidebarElement.innerHTML = `
      <section class="player-sheet-panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">Player</p>
            <h2>Stats</h2>
          </div>
        </div>
        <p class="detail-row">Player data could not be displayed. Open Character Builder and save the character again.</p>
      </section>
    `;
  }
}

function renderPlayerSidebar() {
  if (!sidebarElement) return;
  const character = savedPlayerCharacter();
  const token = activePlayerToken();
  const state = loadPlayerVttState(character);
  const maxHp = character?.hp?.max ?? token?.maxHp ?? 10;
  const maxMana = character?.mana?.max ?? 0;
  const stats = character?.stats || {};
  const spellGroups = playerSpellGroups(character);
  const saveDc = spellSaveDc(character);
  const inventoryEntries = playerInventoryEntries();
  const dungeonRewards = unclaimedDungeonRewards();
  const saveProficiencies = characterSavingThrows(character);
  const visionEffect = activeVisionEffect();
  const torchLit = visionEffect?.source === "torch";
  const collapsedPanels = new Set(
    Array.isArray(state.collapsedPanels) ? state.collapsedPanels : [],
  );
  const panelToggle = () => `
    <span class="player-panel-toggle" aria-hidden="true"><span></span></span>
  `;
  const panelHeaderAttributes = (panelId, label) => `
    data-player-panel-toggle="${panelId}"
    role="button"
    tabindex="0"
    aria-expanded="${!collapsedPanels.has(panelId)}"
    aria-label="${collapsedPanels.has(panelId) ? "Expand" : "Collapse"} ${label}"
    title="${collapsedPanels.has(panelId) ? "Expand" : "Collapse"} ${label}"
  `;

  if (token) {
    token.currentHp = Number(state.currentHp);
    token.tempHp = Number(state.tempHp) || 0;
    token.maxHp = maxHp;
    const raceTokenImage = playerRaceTokenImage(character);
    if (raceTokenImage && token.image !== raceTokenImage) {
      token.image = raceTokenImage;
      saveDungeonState();
      refreshTileElement(token.x, token.y);
    }
  }
  sidebarElement.innerHTML = `
    ${dungeonRewards.length === 0 ? "" : `<section class="player-sheet-panel player-rewards-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">Dungeon</p>
          <h2>Rewards</h2>
        </div>
      </div>
      <div class="player-reward-list">
        ${dungeonRewards.map((reward) => `
          <article class="player-reward-item ${reward.canClaim ? "is-claimable" : ""}">
            <div>
              <h3>${reward.label}</h3>
              <p>${reward.rewardName} Reward - Ready to claim</p>
            </div>
            <button type="button" data-dungeon-reward="${reward.id}">Claim</button>
          </article>
        `).join("")}
      </div>
    </section>`}
    <section class="player-sheet-panel collapsible-player-panel ${collapsedPanels.has("stats") ? "is-collapsed" : ""}" data-player-panel="stats">
      <div class="panel-heading compact" ${panelHeaderAttributes("stats", "Stats")}>
        <div>
          <h2>Stats</h2>
        </div>
        <div class="player-panel-heading-actions">
          <span class="status-pill">${character ? choiceName(character.race) || token?.name || "Aasimar" : token?.name || "Aasimar"}</span>
          ${panelToggle()}
        </div>
      </div>
      <div class="player-resource-grid">
        <label>
          HP
          <span><input id="player-current-hp" type="number" min="0" max="${maxHp}" value="${state.currentHp}" /> / ${maxHp}</span>
        </label>
        <label>
          Temp HP
          <span><input id="player-temp-hp" type="number" min="0" value="${state.tempHp ?? 0}" /></span>
        </label>
        <label>
          Mana
          <span><input id="player-current-mana" type="number" min="0" max="${maxMana}" value="${state.currentMana}" /> / ${maxMana}</span>
        </label>
      </div>
      <div class="player-stat-grid">
        ${Object.entries({
          str: "STR",
          dex: "DEX",
          con: "CON",
          int: "INT",
          wis: "WIS",
          cha: "CHA",
        }).map(([key, label]) => `
          <div class="player-stat ${saveProficiencies.has(key) ? "is-save-proficient" : ""}">
            <strong>${label}</strong>
            <span>${stats[key] ?? 10}</span>
            <small>${modifierText(stats[key] ?? 10)}</small>
          </div>
        `).join("")}
      </div>
      <div class="player-trait-grid">
        <div class="player-trait">
          <span class="trait-icon" style="--icon-url: url('Icons/running.png')" aria-hidden="true"></span>
          <strong>Speed</strong>
          <p>${characterSpeed(character)}</p>
        </div>
        <div class="player-trait">
          <span class="trait-icon" style="--icon-url: url('Icons/eye.png')" aria-hidden="true"></span>
          <strong>Darkvision</strong>
          <p>${characterVision(character)}</p>
        </div>
        <div class="player-trait">
          <span class="trait-icon" style="--icon-url: url('Icons/security.png')" aria-hidden="true"></span>
          <strong>Prof. Bonus</strong>
          <p>+${proficiencyBonus(character?.hp?.level || 1)}</p>
        </div>
        <div class="player-trait">
          <span class="trait-icon" style="--icon-url: url('Icons/heart.png')" aria-hidden="true"></span>
          <strong>Hit Die</strong>
          <p>${characterHitDie(character)}</p>
        </div>
      </div>
    </section>
    <div class="player-middle-grid inventory-only">
      <section class="player-sheet-panel collapsible-player-panel ${collapsedPanels.has("inventory") ? "is-collapsed" : ""}" data-player-panel="inventory">
        <div class="panel-heading compact" ${panelHeaderAttributes("inventory", "Inventory")}>
          <div>
            <h2>Inventory</h2>
          </div>
          ${panelToggle()}
        </div>
        ${torchLit ? `
          <div class="active-vision-effect">
            <span><strong>Torch lit</strong> &middot; 40 ft. vision</span>
            <button type="button" data-torch-extinguish>Extinguish</button>
          </div>
        ` : ""}
        <div class="player-inventory-list">
          ${inventoryEntries.length === 0 ? `<p class="detail-row">No inventory items yet.</p>` : inventoryEntries.map((item, index) => `
            <article class="player-inventory-item">
              <div>
                <h3>${item.name}</h3>
                <p>${item.meta || "Item"}</p>
              </div>
              <div class="inventory-actions ${isTorchInventoryEntry(item) ? "has-use" : ""}">
                <strong>x${item.quantity}</strong>
                ${isTorchInventoryEntry(item) ? `
                  <button type="button" data-inventory-use="${index}" ${torchLit ? "disabled" : ""}>${torchLit ? "Lit" : "Use"}</button>
                ` : ""}
                <button type="button" data-inventory-remove="${index}" aria-label="Remove one item">${item.quantity > 1 ? "-1" : "Remove"}</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
    <section class="player-sheet-panel collapsible-player-panel ${collapsedPanels.has("features") ? "is-collapsed" : ""}" data-player-panel="features">
      <div class="panel-heading compact" ${panelHeaderAttributes("features", "Features")}>
        <div>
          <h2>Features</h2>
        </div>
        ${panelToggle()}
      </div>
      <div class="player-feature-list">
        ${characterFeatureGroups(character).map((group) => `
          <article class="player-feature-group">
            <h3>${group.source}</h3>
            ${group.features.map((feature) => `
              <section>
                <strong>${feature.name}</strong>
                <p>${feature.text}</p>
              </section>
            `).join("")}
          </article>
        `).join("") || `<p class="detail-row">No saved character features yet.</p>`}
      </div>
    </section>
    ${spellGroups.size === 0 ? "" : `<section class="player-sheet-panel collapsible-player-panel ${collapsedPanels.has("spells") ? "is-collapsed" : ""}" data-player-panel="spells">
      <div class="panel-heading compact" ${panelHeaderAttributes("spells", "Spells")}>
        <div>
          <h2>Spells</h2>
        </div>
        ${panelToggle()}
      </div>
      <p class="detail-row"><strong>Spell Save DC:</strong> ${saveDc ?? "-"}</p>
      <div class="player-spell-list">
        ${[...spellGroups.entries()].map(([kind, spells]) => `
          <article class="player-spell-group">
            <h3>${kind}</h3>
            ${spells.map((spell) => `
              <section>
                <strong>${spell.name}</strong>
                <p>${[spell.school, spell.source].filter(Boolean).join(" - ")}</p>
              </section>
            `).join("")}
          </article>
        `).join("")}
      </div>
    </section>`}
  `;

  const saveResource = () => {
    const currentHp = Math.max(
      0,
      Math.min(maxHp, Number(document.querySelector("#player-current-hp")?.value ?? state.currentHp) || 0),
    );
    const tempHp = Math.max(0, Number(document.querySelector("#player-temp-hp")?.value ?? state.tempHp) || 0);
    const currentMana = Math.max(
      0,
      Math.min(maxMana, Number(document.querySelector("#player-current-mana")?.value ?? state.currentMana) || 0),
    );
    savePlayerVttState({ ...state, currentHp, tempHp, currentMana, maxHp });
    if (token) {
      token.currentHp = currentHp;
      token.tempHp = tempHp;
      saveDungeonState();
      refreshTileElement(token.x, token.y);
    }
  };

  ["#player-current-hp", "#player-temp-hp", "#player-current-mana"].forEach((selector) => {
    const input = document.querySelector(selector);
    input?.addEventListener("input", saveResource);
  });
  document.querySelectorAll("[data-player-panel-toggle]").forEach((heading) => {
    const togglePanel = () => {
      const panelId = heading.dataset.playerPanelToggle;
      const nextState = loadPlayerVttState(character);
      const nextCollapsedPanels = new Set(
        Array.isArray(nextState.collapsedPanels) ? nextState.collapsedPanels : [],
      );
      if (nextCollapsedPanels.has(panelId)) {
        nextCollapsedPanels.delete(panelId);
      } else {
        nextCollapsedPanels.add(panelId);
      }
      localStorage.setItem(playerVttStateKey, JSON.stringify({
        ...nextState,
        collapsedPanels: [...nextCollapsedPanels],
      }));
      renderPlayerSidebar();
    };
    heading.addEventListener("click", togglePanel);
    heading.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      togglePanel();
    });
  });
  document.querySelectorAll("[data-inventory-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = playerInventoryEntries()[Number(button.dataset.inventoryRemove)];
      if (entry && removeOneInventoryItem(entry.key)) {
        const multiplayerState = window.avtizmMultiplayer?.getState();
        if (vttMode === "player" && multiplayerState?.connected) {
          window.avtizmMultiplayer.syncCharacter(
            savedPlayerCharacter(),
            loadPlayerVttState(savedPlayerCharacter()),
          );
        }
      }
      renderPlayerSidebar();
    });
  });
  document.querySelectorAll("[data-inventory-use]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = playerInventoryEntries()[Number(button.dataset.inventoryUse)];
      if (entry) lightTorch(entry.key);
    });
  });
  document.querySelector("[data-torch-extinguish]")?.addEventListener("click", extinguishTorch);
  document.querySelectorAll("[data-dungeon-reward]").forEach((button) => {
    button.addEventListener("click", () => claimDungeonReward(button.dataset.dungeonReward));
  });
}

function findPath(start, goal, movingTokenId, maxSteps = Infinity) {
  const key = (point) => `${point.x},${point.y}`;
  const queue = [start];
  const cameFrom = new Map([[key(start), null]]);
  const stepsFromStart = new Map([[key(start), 0]]);
  const movingToken = dungeon.tokens.find((token) => token.id === movingTokenId);
  const occupied = new Set(
    dungeon.tokens
      .filter((token) => token.id !== movingTokenId && token.currentHp > 0 && token.type !== movingToken?.type)
      .map((token) => `${token.x},${token.y}`),
  );

  while (queue.length) {
    const current = queue.shift();
    const currentSteps = stepsFromStart.get(key(current)) || 0;
    if (current.x === goal.x && current.y === goal.y) break;
    if (currentSteps >= maxSteps) continue;
    for (const next of neighbors(current)) {
      const nextKey = key(next);
      const tile = dungeon.grid[next.y]?.[next.x];
      if (!tile || cameFrom.has(nextKey)) continue;
      if (!walkableTiles.has(tile.type)) continue;
      if (occupied.has(nextKey) && !(next.x === goal.x && next.y === goal.y)) continue;
      cameFrom.set(nextKey, current);
      stepsFromStart.set(nextKey, currentSteps + 1);
      queue.push(next);
    }
  }

  if (!cameFrom.has(key(goal))) return [];
  const path = [];
  let current = goal;
  while (current) {
    path.push(current);
    current = cameFrom.get(key(current));
  }
  return path.reverse();
}

function neighbors(point) {
  const key = pointKey(point);
  const cached = neighborCache.get(key);
  if (cached) return cached;
  const evenColumn = (point.x & 1) === 0;
  const directions = evenColumn
    ? [
        { x: 1, y: 0 },
        { x: 1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
      ]
    : [
        { x: 1, y: 1 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: 1 },
      ];
  const result = directions.map((direction) => ({
    x: point.x + direction.x,
    y: point.y + direction.y,
  }));
  neighborCache.set(key, result);
  return result;
}

function scheduleMultiplayerDungeonSync() {
  if (multiplayerSyncTimer) window.clearTimeout(multiplayerSyncTimer);
  multiplayerSyncTimer = window.setTimeout(() => {
    multiplayerSyncTimer = null;
    syncMultiplayerDungeon();
  }, 120);
}

function exploredTilesForMember(member, currentSightKeys) {
  dungeon.playerExploredTiles ||= {};
  const explored = new Set(
    Array.isArray(dungeon.playerExploredTiles[member.user_id])
      ? dungeon.playerExploredTiles[member.user_id]
      : [],
  );
  currentSightKeys.forEach((key) => explored.add(key));
  dungeon.playerExploredTiles[member.user_id] = [...explored];
  return explored;
}

function roomIntersectsVisibleTiles(room, visibleKeys) {
  for (let y = room.y; y < room.y + room.h; y += 1) {
    for (let x = room.x; x < room.x + room.w; x += 1) {
      if (visibleKeys.has(`${x},${y}`)) return true;
    }
  }
  return false;
}

function publicDungeonState(member) {
  if (!dungeon) return null;
  const sanitized = JSON.parse(JSON.stringify(dungeon));
  const currentSightKeys = computePlayerSightTiles({
    tokenIds: [member.token_id],
    character: member.character || {},
    playerState: member.player_state || {},
  });
  const visibleKeys = exploredTilesForMember(member, currentSightKeys);

  const publicRewardIds = new Set(
    (dungeon.rewardPlacements || [])
      .filter((reward) => reward.availableToPlayers || reward.claimed)
      .map((reward) => reward.id),
  );
  const publicTrapIds = new Set(
    (dungeon.traps || [])
      .filter((trap) => trap.visibleToPlayers || trap.triggered)
      .map((trap) => trap.id),
  );

  sanitized.grid = sanitized.grid.map((row) => row.map((tile) => {
    const key = pointKey(tile);
    if (!visibleKeys.has(key)) {
      return {
        x: tile.x,
        y: tile.y,
        type: "void",
        visibility: "hidden",
      };
    }

    const nextTile = { ...tile };
    if (nextTile.type === "secret door") {
      nextTile.type = "wall";
      delete nextTile.doorId;
    }
    if (nextTile.type === "trap tile" && !publicTrapIds.has(nextTile.trapId)) {
      nextTile.type = "floor";
      delete nextTile.trapId;
    }
    if (nextTile.type === "reward tile" && !publicRewardIds.has(nextTile.rewardId)) {
      nextTile.type = "floor";
      delete nextTile.rewardId;
    }
    return nextTile;
  }));

  sanitized.rooms = (sanitized.rooms || []).filter((room) =>
    roomIntersectsVisibleTiles(room, visibleKeys),
  );
  sanitized.corridors = (sanitized.corridors || []).filter((corridor) =>
    corridor.tiles?.some((tile) => visibleKeys.has(pointKey(tile))),
  );
  sanitized.doors = (sanitized.doors || []).filter((door) => {
    const tile = sanitized.grid[door.y]?.[door.x];
    return tile && tile.type !== "void" && door.type !== "secret door";
  });
  sanitized.traps = (sanitized.traps || []).filter((trap) =>
    publicTrapIds.has(trap.id) && visibleKeys.has(pointKey(trap)),
  );
  sanitized.rewardPlacements = (sanitized.rewardPlacements || []).filter(
    (reward) => publicRewardIds.has(reward.id) && visibleKeys.has(pointKey(reward)),
  );

  sanitized.tokens = (sanitized.tokens || []).filter((token) =>
    token.id === member.token_id
    || (
      currentSightKeys.has(pointKey(token))
      && token.currentHp > 0
      && (token.type === "player" || token.visibleToPlayers)
    ),
  );
  const publicMonsterIds = new Set(
    sanitized.tokens.filter((token) => token.type !== "player").map((token) => token.id),
  );
  sanitized.monsters = (sanitized.monsters || []).filter(
    (monster) => publicMonsterIds.has(monster.id),
  );
  delete sanitized.playerExploredTiles;
  sanitized.isPlayerView = true;
  return sanitized;
}

async function syncMultiplayerDungeon() {
  const multiplayer = window.avtizmMultiplayer;
  const multiplayerState = multiplayer?.getState();
  if (!dungeon || vttMode !== "dm" || !multiplayerState?.connected) return;
  if (multiplayerSyncInFlight) {
    multiplayerSyncQueued = true;
    return;
  }

  multiplayerSyncInFlight = true;
  try {
    const views = multiplayerPlayerMembers().map((member) => ({
      userId: member.user_id,
      dungeonState: publicDungeonState(member),
    }));
    await multiplayer.saveDmState(dungeon);
    await multiplayer.savePlayerViews(views);
  } finally {
    multiplayerSyncInFlight = false;
    if (multiplayerSyncQueued) {
      multiplayerSyncQueued = false;
      scheduleMultiplayerDungeonSync();
    }
  }
}

function applyMultiplayerDungeonState(nextState) {
  if (!nextState?.grid || !Array.isArray(nextState.tokens)) return;
  applyingMultiplayerState = true;
  try {
    dungeon = nextState;
    normalizeActivePlayerToken();
    selectedTokenId = vttMode === "player"
      ? activePlayerTokenId
      : dungeon.tokens.find((token) => token.type === "player")?.id
        || dungeon.tokens[0]?.id
        || null;
    selectedTile = null;
    localStorage.setItem(dungeonStorageKey, JSON.stringify(dungeon));
    render();
  } finally {
    applyingMultiplayerState = false;
  }
}

function actionMember(action) {
  return multiplayerPlayerMembers().find((member) => member.user_id === action.user_id) || null;
}

function validPlayerPath(token, path) {
  if (!token || !Array.isArray(path) || path.length < 2) return false;
  if (path.length - 1 > Math.max(1, Number(token.movement) || 6)) return false;
  if (path[0]?.x !== token.x || path[0]?.y !== token.y) return false;

  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const step = path[index];
    if (!Number.isInteger(step?.x) || !Number.isInteger(step?.y)) return false;
    if (distance(previous, step) !== 1) return false;
    const tile = dungeon.grid[step.y]?.[step.x];
    if (!tile || !walkableTiles.has(tile.type)) return false;
    const isDestination = index === path.length - 1;
    const occupied = dungeon.tokens.some(
      (other) =>
        other.id !== token.id
        && other.currentHp > 0
        && other.x === step.x
        && other.y === step.y
        && (isDestination || other.type !== token.type),
    );
    if (occupied) return false;
  }
  return true;
}

const processedMultiplayerActionIds = new Set();

async function handleMultiplayerGameAction(action) {
  const multiplayer = window.avtizmMultiplayer;
  if (
    vttMode !== "dm"
    || !dungeon
    || !action?.id
    || action.status !== "pending"
    || processedMultiplayerActionIds.has(action.id)
  ) return;
  processedMultiplayerActionIds.add(action.id);

  const member = actionMember(action);
  if (!member) {
    await multiplayer.completeAction(action.id, false, { reason: "Player is not in this campaign." });
    return;
  }
  const token = dungeon.tokens.find((item) => item.id === member.token_id);
  if (!token) {
    await multiplayer.completeAction(action.id, false, { reason: "Player token is unavailable." });
    return;
  }

  try {
    if (action.action_type === "move-token") {
      const path = action.payload?.path;
      if (action.payload?.tokenId !== member.token_id || !validPlayerPath(token, path)) {
        await multiplayer.completeAction(action.id, false, { reason: "Invalid movement path." });
        return;
      }
      for (let index = 1; index < path.length; index += 1) {
        const step = path[index];
        token.x = step.x;
        token.y = step.y;
        const room = roomAt(step.x, step.y);
        if (room) {
          token.roomId = room.id;
          revealRoom(dungeon, room.id);
        }
      }
      selectedTokenId = token.id;
      selectedTile = { x: token.x, y: token.y };
      saveDungeonState();
      render();
      await multiplayer.completeAction(action.id, true, { x: token.x, y: token.y });
      return;
    }

    if (action.action_type === "toggle-door") {
      const x = Number(action.payload?.x);
      const y = Number(action.payload?.y);
      const tile = dungeon.grid[y]?.[x];
      if (
        !Number.isInteger(x)
        || !Number.isInteger(y)
        || !tile
        || !doorTileTypes.has(tile.type)
        || distance(token, { x, y }) !== 1
      ) {
        await multiplayer.completeAction(action.id, false, { reason: "Door is out of reach." });
        return;
      }
      setDoorOpenState(x, y, Boolean(action.payload?.shouldOpen));
      await multiplayer.completeAction(action.id, true, { x, y, type: dungeon.grid[y][x].type });
      return;
    }

    if (action.action_type === "update-resources") {
      const maxHp = Math.max(1, Number(action.payload?.maxHp ?? token.maxHp) || token.maxHp || 10);
      token.maxHp = maxHp;
      token.currentHp = Math.max(0, Math.min(maxHp, Number(action.payload?.currentHp) || 0));
      token.tempHp = Math.max(0, Number(action.payload?.tempHp) || 0);
      saveDungeonState();
      refreshTileElement(token.x, token.y);
      renderInspector();
      await multiplayer.completeAction(action.id, true, {
        currentHp: token.currentHp,
        tempHp: token.tempHp,
        maxHp: token.maxHp,
      });
      return;
    }

    if (action.action_type === "claim-reward") {
      const rewardId = String(action.payload?.rewardId || "");
      if (rewardId === "exit-reward") {
        if (!dungeon.exitRewardAvailable || dungeon.exitRewardClaimed) {
          await multiplayer.completeAction(action.id, false, { reason: "Reward is unavailable." });
          return;
        }
        dungeon.exitRewardClaimed = true;
        dungeon.exitRewardClaimedAt = new Date().toISOString();
      } else {
        const reward = dungeon.rewardPlacements?.find((item) => item.id === rewardId);
        if (!reward?.availableToPlayers || reward.claimed) {
          await multiplayer.completeAction(action.id, false, { reason: "Reward is unavailable." });
          return;
        }
        reward.claimed = true;
        reward.claimedAt = new Date().toISOString();
      }
      saveDungeonState();
      renderInspector();
      await multiplayer.completeAction(action.id, true, { rewardId });
      return;
    }

    await multiplayer.completeAction(action.id, false, { reason: "Unsupported action." });
  } catch (error) {
    console.warn(error);
    await multiplayer.completeAction(action.id, false, { reason: error.message || "Action failed." });
  }
}

function handleMultiplayerConnected(multiplayerState) {
  if (!multiplayerState?.connected) return;
  if (vttMode === "player" && multiplayerState.tokenId) {
    activePlayerTokenId = multiplayerState.tokenId;
    window.avtizmMultiplayer.syncCharacter(
      savedPlayerCharacter(),
      loadPlayerVttState(savedPlayerCharacter()),
    );
    normalizeActivePlayerToken();
    render();
    return;
  }
  if (vttMode === "dm" && syncPartyTokensFromMembers()) {
    saveDungeonState();
    render();
  } else if (vttMode === "dm") {
    scheduleMultiplayerDungeonSync();
  }
}

window.addEventListener("avtizm-multiplayer:connected", (event) => {
  handleMultiplayerConnected(event.detail);
});
window.addEventListener("avtizm-multiplayer:dungeon-state", (event) => {
  applyMultiplayerDungeonState(event.detail.state);
  if (vttMode === "dm" && syncPartyTokensFromMembers()) {
    saveDungeonState();
    render();
  }
});
window.addEventListener("avtizm-multiplayer:members-changed", () => {
  const multiplayerState = window.avtizmMultiplayer?.getState();
  if (vttMode === "player" && multiplayerState?.tokenId) {
    activePlayerTokenId = multiplayerState.tokenId;
    normalizeActivePlayerToken();
    render();
    return;
  }
  if (vttMode === "dm") {
    if (syncPartyTokensFromMembers()) {
      saveDungeonState();
      render();
    } else {
      scheduleMultiplayerDungeonSync();
    }
  }
});
window.addEventListener("avtizm-multiplayer:game-action", (event) => {
  handleMultiplayerGameAction(event.detail.action);
});
applyPageMode();
if (vttMode === "player") {
  renderPlayerSidebarSafely();
  window.addEventListener("DOMContentLoaded", () => {
    renderPlayerSidebarSafely();
  });
}
document.querySelector("#generate-dungeon")?.addEventListener("click", generateDungeon);
viewModeSelect?.addEventListener("change", render);
gridElement.addEventListener("contextmenu", (event) => event.preventDefault());
gridElement.addEventListener("mousedown", startRightClickPan);
window.addEventListener("mousemove", moveRightClickPan);
window.addEventListener("mousemove", updateTokenDragPreviewFromEvent);
window.addEventListener("mouseup", endRightClickPan);
window.addEventListener("mouseup", finishTokenDrag);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") cancelTokenDrag();
});
gridElement.addEventListener("wheel", handleMapWheel, { passive: false });
window.addEventListener("storage", (event) => {
  if (event.key === dungeonStorageKey) {
    const multiplayerState = window.avtizmMultiplayer?.getState();
    if (vttMode !== "player" || !multiplayerState?.connected) {
      loadDungeonState();
    }
    return;
  }
  if ([savedCharacterKey, rewardHistoryKey, playerVttStateKey].includes(event.key)) {
    if (vttMode === "player") renderPlayerSidebarSafely();
    render();
  }
});

const shouldLoadLocalDungeon = vttMode === "dm" || !window.avtizmMultiplayer;
if (!shouldLoadLocalDungeon || !loadDungeonState()) {
  if (vttMode === "dm") {
    generateDungeon();
  } else {
    render();
  }
}

window.avtizmMultiplayer?.ready.then(() => {
  handleMultiplayerConnected(window.avtizmMultiplayer.getState());
});
