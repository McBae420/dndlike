const races = [
  {
    name: "Aasimar",
    image: "Races/Aasimar.png",
    cardImage: "Races/Croped/Aasimar.png",
    features: "Celestial spark, healing light, radiant damage bursts.",
  },
  {
    name: "Dragonborn",
    image: "Races/Dragonborn.png",
    cardImage: "Races/Croped/Dragonborn.png",
    features: "Draconic ancestry, breath weapon, elemental resistance.",
  },
  {
    name: "Dwarf",
    image: "Races/Dwarf.png",
    cardImage: "Races/Croped/Dwarf.png",
    features: "Hardy body, poison resistance, sturdy dungeon instincts.",
  },
  {
    name: "Elf",
    image: "Races/Elf.png",
    cardImage: "Races/Croped/Elf.png",
    features: "Keen senses, trance, graceful movement through danger.",
  },
  {
    name: "Gnome",
    image: "Races/Gnome.png",
    cardImage: "Races/Croped/Gnome.png",
    features: "Clever mind, magic resistance, small target advantage.",
  },
  {
    name: "Goliath",
    image: "Races/Goliath.png",
    cardImage: "Races/Croped/Goliath.png",
    features: "Powerful build, stone endurance, mountain-born toughness.",
  },
  {
    name: "Halfling",
    image: "Races/Croped/Halfling.png",
    cardImage: "Races/Croped/Halfling.png",
    features: "Brave heart, lucky rerolls, nimble movement, natural stealth.",
  },
  {
    name: "Human",
    image: "Races/Human.png",
    cardImage: "Races/Croped/Human.png",
    features: "Flexible talents, fast learning, reliable stat spread.",
  },
  {
    name: "Orc",
    image: "Races/Orc.png",
    cardImage: "Races/Croped/Orc.png",
    features: "Relentless endurance, brutal strikes, aggressive momentum.",
  },
  {
    name: "Tiefling",
    image: "Races/Tiefling.png",
    cardImage: "Races/Croped/Tiefling.png",
    features: "Infernal legacy, fire resistance, sinister spell tricks.",
  },
];

const classes = [
  {
    name: "Barbarian",
    image: "Classes/Class Icon - Barbarian.svg",
  },
  {
    name: "Bard",
    image: "Classes/Class Icon - Bard.svg",
  },
  {
    name: "Cleric",
    image: "Classes/Class Icon - Cleric.svg",
  },
  {
    name: "Druid",
    image: "Classes/Class Icon - Druid.svg",
  },
  {
    name: "Fighter",
    image: "Classes/Class Icon - Fighter.svg",
  },
  {
    name: "Monk",
    image: "Classes/Class Icon - Monk.svg",
  },
  {
    name: "Paladin",
    image: "Classes/Class Icon - Paladin.svg",
  },
  {
    name: "Ranger",
    image: "Classes/Class Icon - Ranger.svg",
  },
  {
    name: "Rogue",
    image: "Classes/Class Icon - Rogue.svg",
  },
  {
    name: "Sorcerer",
    image: "Classes/Class Icon - Sorcerer.svg",
  },
  {
    name: "Warlock",
    image: "Classes/Class Icon - Warlock.svg",
  },
  {
    name: "Wizard",
    image: "Classes/Class Icon - Wizard.svg",
  },
];

const classSavingThrowProficiencies = {
  Barbarian: ["Strength", "Constitution"],
  Bard: ["Dexterity", "Charisma"],
  Cleric: ["Wisdom", "Charisma"],
  Druid: ["Intelligence", "Wisdom"],
  Fighter: ["Strength", "Constitution"],
  Monk: ["Strength", "Dexterity"],
  Paladin: ["Wisdom", "Charisma"],
  Ranger: ["Strength", "Dexterity"],
  Rogue: ["Dexterity", "Intelligence"],
  Sorcerer: ["Constitution", "Charisma"],
  Warlock: ["Wisdom", "Charisma"],
  Wizard: ["Intelligence", "Wisdom"],
};

const state = {
  race: null,
  subrace: null,
  class: null,
  classOption: null,
  startingSpell: null,
  startingSpells: [],
  pendingStartingSpell: null,
  originFeat: null,
  humanFeat: null,
  pendingMagicInitiateFeat: null,
};

const raceStage = document.querySelector("#race-stage");
const subraceStage = document.querySelector("#subrace-stage");
const classStage = document.querySelector("#class-stage");
const classOptionStage = document.querySelector("#class-option-stage");
const spellStage = document.querySelector("#spell-stage");
const originFeatStage = document.querySelector("#origin-feat-stage");
const humanFeatStage = document.querySelector("#human-feat-stage");
const summaryStage = document.querySelector("#summary-stage");
const raceOptions = document.querySelector("#race-options");
const subraceOptions = document.querySelector("#subrace-options");
const classOptions = document.querySelector("#class-options");
const classOptionOptions = document.querySelector("#class-option-options");
const spellOptions = document.querySelector("#spell-options");
const originFeatOptions = document.querySelector("#origin-feat-options");
const humanFeatOptions = document.querySelector("#human-feat-options");
const confirmRaceButton = document.querySelector("#confirm-race");
const confirmSubraceButton = document.querySelector("#confirm-subrace");
const confirmClassButton = document.querySelector("#confirm-class");
const confirmClassOptionButton = document.querySelector("#confirm-class-option");
const confirmSpellButton = document.querySelector("#confirm-spell");
const confirmOriginFeatButton = document.querySelector("#confirm-origin-feat");
const confirmHumanFeatButton = document.querySelector("#confirm-human-feat");
const rerollButton = document.querySelector("#reroll-button");
const continueButton = document.querySelector("#continue-button");
const savedCharacterKey = "avtizm4.character";
const rewardHistoryKey = "avtizm4.rewards";
const playerVttStateKey = "avtizm4.vtt.player";
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
const startingStats = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};
const statKeyMap = {
  STR: "str",
  DEX: "dex",
  CON: "con",
  INT: "int",
  WIS: "wis",
  CHA: "cha",
};

let subraceMap = {};
let classOptionMap = {};
let spellMap = {
  cantrips: [],
  level1: [],
};
let originFeats = [];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function randomOptions(items, count) {
  return shuffle(items).slice(0, count);
}

function showStage(stageName) {
  raceStage.classList.toggle("is-hidden", stageName !== "race");
  subraceStage.classList.toggle("is-hidden", stageName !== "subrace");
  classStage.classList.toggle("is-hidden", stageName !== "class");
  classOptionStage.classList.toggle("is-hidden", stageName !== "class-option");
  spellStage.classList.toggle("is-hidden", stageName !== "spell");
  originFeatStage.classList.toggle("is-hidden", stageName !== "origin-feat");
  humanFeatStage.classList.toggle("is-hidden", stageName !== "human-feat");
  summaryStage.classList.toggle("is-hidden", stageName !== "summary");
  window.scrollTo(0, 0);
}

function featureText(features) {
  if (Array.isArray(features)) {
    return features.join(", ");
  }

  return features || "Write this class's features in Classes/features.json.";
}

function parseClassFeatures(features) {
  const parsed = {
    stats: "",
    saves: "",
    hp: "",
    armor: "",
    weapons: "",
    abilities: [],
  };

  if (!Array.isArray(features)) {
    parsed.abilities = [featureText(features)];
    return parsed;
  }

  features.forEach((feature) => {
    const separatorIndex = feature.indexOf(":");
    const label = separatorIndex > -1 ? feature.slice(0, separatorIndex) : "";
    const detail = separatorIndex > -1 ? feature.slice(separatorIndex + 1).trim() : feature;

    if (label === "Stats") parsed.stats = detail;
    else if (label === "Saves") parsed.saves = detail;
    else if (label === "HP") parsed.hp = detail;
    else if (label === "Armor") parsed.armor = detail;
    else if (label === "Weapons") parsed.weapons = detail;
    else parsed.abilities.push(feature);
  });

  return parsed;
}

function parseRaceFeatures(features) {
  const parsed = {
    creatureType: "",
    size: "",
    speed: "",
    darkvision: "None",
    abilities: [],
  };

  if (!Array.isArray(features)) {
    parsed.abilities = [featureText(features)];
    return parsed;
  }

  features.forEach((feature) => {
    const separatorIndex = feature.indexOf(":");
    const label = separatorIndex > -1 ? feature.slice(0, separatorIndex) : "";
    const detail =
      separatorIndex > -1 ? feature.slice(separatorIndex + 1).trim() : feature;

    if (label === "Creature Type") parsed.creatureType = detail;
    else if (label === "Size") parsed.size = detail;
    else if (label === "Speed") parsed.speed = detail;
    else if (label === "Darkvision") parsed.darkvision = detail.replace("You have ", "");
    else parsed.abilities.push(feature);
  });

  return parsed;
}

function createMetaRow(items, className) {
  const meta = document.createElement("div");
  meta.className = className;

  items.forEach((item) => {
    const stat = document.createElement("div");
    stat.className = "class-meta";

    const icon = document.createElement("span");
    icon.className = "meta-icon";
    icon.style.setProperty("--icon-url", `url("${item.icon}")`);
    icon.setAttribute("aria-hidden", "true");

    const value = document.createElement("strong");
    value.textContent = item.value || "-";

    stat.append(icon, value);
    meta.append(stat);
  });

  return meta;
}

function createClassFeatureBlock(features) {
  const parsed = parseClassFeatures(features);
  const sheet = document.createElement("div");
  sheet.className = "choice-description class-sheet";

  const meta = createMetaRow(
    [
      { value: parsed.hp, icon: "Icons/heart.png" },
      { value: parsed.weapons, icon: "Icons/sword.png" },
      { value: parsed.armor, icon: "Icons/security.png" },
    ],
    "class-meta-row",
  );

  const stats = document.createElement("p");
  stats.className = "class-stats";
  stats.textContent = parsed.stats ? `Stats: ${parsed.stats}` : "Stats: -";

  const saves = document.createElement("p");
  saves.className = "class-stats";
  saves.textContent = parsed.saves ? `Saves: ${parsed.saves}` : "Saves: -";

  const list = document.createElement("ul");
  list.className = "class-feature-list";

  parsed.abilities.forEach((feature) => {
    const item = document.createElement("li");
    const separatorIndex = feature.indexOf(":");

    if (separatorIndex > -1) {
      const label = feature.slice(0, separatorIndex + 1);
      const detail = feature.slice(separatorIndex + 1).trim();
      const labelElement = document.createElement("strong");
      labelElement.className = "feature-label";
      labelElement.textContent = label;
      item.append(labelElement, " ", detail);
    } else {
      item.textContent = feature;
    }

    list.append(item);
  });

  sheet.append(meta, stats, saves, list);
  return sheet;
}

function createRaceFeatureBlock(features) {
  const parsed = parseRaceFeatures(features);
  const sheet = document.createElement("div");
  sheet.className = "choice-description race-sheet";

  const meta = createMetaRow(
    [
      { value: parsed.size, icon: "Icons/user.png" },
      { value: parsed.speed, icon: "Icons/running.png" },
      { value: parsed.darkvision, icon: "Icons/eye.png" },
    ],
    "class-meta-row race-meta-row",
  );

  const list = document.createElement("ul");
  list.className = "feature-list race-feature-list";

  parsed.abilities.forEach((feature) => {
    const item = document.createElement("li");
    const separatorIndex = feature.indexOf(":");

    if (separatorIndex > -1) {
      const label = feature.slice(0, separatorIndex + 1);
      const detail = feature.slice(separatorIndex + 1).trim();
      const labelElement = document.createElement("strong");
      labelElement.className = "feature-label";
      labelElement.textContent = label;
      item.append(labelElement, " ", detail);
    } else {
      item.textContent = feature;
    }

    list.append(item);
  });

  sheet.append(meta, list);
  return sheet;
}

function createFeatureBlock(features, type) {
  if (type === "class") {
    return createClassFeatureBlock(features);
  }

  if (type === "subrace") {
    return createSimpleFeatureList(features, "choice-description subrace-feature-list");
  }

  if (type === "spell") {
    return createSimpleFeatureList(features, "choice-description spell-feature-list");
  }

  if (Array.isArray(features)) {
    return createRaceFeatureBlock(features);
  }

  const description = document.createElement("p");
  description.className = "choice-description";
  description.textContent = featureText(features);
  return description;
}

function createSimpleFeatureList(features, className) {
  const list = document.createElement("ul");
  list.className = className;

  const featureList = Array.isArray(features) ? features : [featureText(features)];
  featureList.forEach((feature) => {
    const item = document.createElement("li");
    const separatorIndex = feature.indexOf(":");

    if (separatorIndex > -1) {
      const label = feature.slice(0, separatorIndex + 1);
      const detail = feature.slice(separatorIndex + 1).trim();
      const labelElement = document.createElement("strong");
      labelElement.className = "feature-label";
      labelElement.textContent = label;
      item.append(labelElement, " ", detail);
    } else {
      item.textContent = feature;
    }

    list.append(item);
  });

  return list;
}

function createChoiceCard(option, type, onPick) {
  const card = document.createElement("button");
  card.className = `choice-card ${type}-card`;
  card.type = "button";
  card.dataset.name = option.name.toLowerCase();
  card.setAttribute("aria-label", `Choose ${option.name}`);

  const name = document.createElement("strong");
  name.className = "choice-name";

  if (type === "class") {
    const image = document.createElement("img");
    image.src = option.image;
    image.alt = option.name;

    const nameText = document.createElement("span");
    nameText.textContent = option.name;
    name.append(nameText);

    const classIcon = document.createElement("span");
    classIcon.className = "class-icon";
    classIcon.style.setProperty("--class-icon-url", `url("${option.image}")`);
    classIcon.setAttribute("aria-hidden", "true");

    const medallion = document.createElement("div");
    medallion.className = "class-icon-medallion";
    medallion.append(classIcon);
    card.append(medallion);
  } else {
    name.textContent = option.name;
  }

  const description = createFeatureBlock(option.features, type);

  if (type === "class") {
    card.append(name, description);
  } else if (type === "subrace") {
    card.append(name, description);
  } else if (type === "spell") {
    const image = document.createElement("img");
    image.src = option.cardImage || "reward-img/SPELL.png";
    image.alt = option.name;

    const imageWrap = document.createElement("div");
    imageWrap.className = "choice-image";
    imageWrap.append(image);
    card.append(name, imageWrap, description);
  } else {
    const image = document.createElement("img");
    image.src = option.cardImage || option.image;
    image.alt = option.name;

    const imageWrap = document.createElement("div");
    imageWrap.className = "choice-image";
    imageWrap.append(image);
    card.append(name, imageWrap, description);
  }

  card.addEventListener("click", () => {
    onPick(option);
    [...card.parentElement.children].forEach((item) =>
      item.classList.toggle("is-selected", item === card),
    );
  });

  return card;
}

function simpleChoice(choice) {
  if (!choice) return null;

  return {
    name: choice.name,
    image: choice.image || "",
    cardImage: choice.cardImage || "",
    features: choice.features || "",
    level: choice.level || "",
    school: choice.school || "",
    magicInitiate: choice.magicInitiate || null,
  };
}

function characterFingerprint(character) {
  return [
    character.race?.name,
    character.subrace?.name,
    character.class?.name,
    character.classOption?.name,
    character.startingSpell?.name,
    ...(character.startingSpells || []).map((spell) => spell.name),
    character.originFeat?.name,
    character.humanFeat?.name,
  ]
    .filter(Boolean)
    .join("|");
}

function loadRewardHistory() {
  try {
    return JSON.parse(localStorage.getItem(rewardHistoryKey)) || [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function applyStatChanges(stats, changes) {
  (changes || []).forEach((change) => {
    if (stats[change.stat] !== undefined) {
      stats[change.stat] += change.amount;
    }
  });
}

function classStatChanges(features) {
  const parsed = parseClassFeatures(features);
  const changes = [];
  const statPattern = /([+-]\d+)\s+(STR|DEX|CON|INT|WIS|CHA)(?:\s+or\s+(STR|DEX|CON|INT|WIS|CHA))?/g;
  let match = statPattern.exec(parsed.stats);

  while (match) {
    changes.push({
      stat: statKeyMap[match[2]],
      amount: Number(match[1]),
    });
    match = statPattern.exec(parsed.stats);
  }

  return changes;
}

function classHitDie(features) {
  const hp = Number(parseClassFeatures(features).hp);
  return Number.isFinite(hp) && hp > 0 ? hp : 8;
}

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function hasToughFeat(character) {
  return [character.originFeat?.name, character.humanFeat?.name].some((name) =>
    /tough|tought/i.test(name || ""),
  );
}

function hasDwarvenToughness(character) {
  const raceFeatures = Array.isArray(character?.race?.features)
    ? character.race.features.join(" ")
    : character?.race?.features || "";
  return character?.race?.name === "Dwarf" || /Dwarven Toughness/i.test(raceFeatures);
}

function rewardHpChange(reward) {
  const match = /increase your maximum HP by (\d+)/i.exec(reward?.text || "");
  return match ? Number(match[1]) : 0;
}

function calculateStats(character) {
  const stats = { ...startingStats };
  applyStatChanges(stats, classStatChanges(character.class?.features));
  loadRewardHistory().forEach((reward) => applyStatChanges(stats, reward.statChanges));
  return stats;
}

function calculateHp(character, stats) {
  const rewards = loadRewardHistory();
  const levelUpRewards = rewards.filter((reward) => reward.grantsLevel === true);
  const hitDie = classHitDie(character.class?.features);
  const level = 1 + levelUpRewards.length;
  const levelOneHp = hitDie;
  const levelUpHp = Math.floor(hitDie / 2) + 1;
  const toughHp = hasToughFeat(character) ? level * 2 : 0;
  const dwarfHp = hasDwarvenToughness(character) ? level : 0;
  const rewardHp = rewards.reduce(
    (total, reward) => total + (reward.hpChange ?? rewardHpChange(reward)),
    0,
  );

  return {
    level,
    max: levelOneHp + levelUpRewards.length * levelUpHp + toughHp + dwarfHp + rewardHp,
    perLevel: levelUpHp,
  };
}

function buildSavedCharacter() {
  let existingCharacter = null;

  try {
    existingCharacter = JSON.parse(localStorage.getItem(savedCharacterKey));
  } catch (error) {
    console.warn(error);
  }

  const character = {
    savedAt: new Date().toISOString(),
    race: simpleChoice(state.race),
    subrace: simpleChoice(state.subrace),
    class: simpleChoice(state.class),
    classOption: simpleChoice(state.classOption),
    startingSpell: state.startingSpells[0]
      ? simpleChoice(state.startingSpells[0])
      : simpleChoice(state.startingSpell),
    startingSpells: state.startingSpells.map(simpleChoice),
    originFeat: simpleChoice(state.originFeat),
    humanFeat: simpleChoice(state.humanFeat),
  };
  const fingerprint = characterFingerprint(character);
  const existingFingerprint =
    existingCharacter?.fingerprint || characterFingerprint(existingCharacter || {});

  if (!existingFingerprint || existingFingerprint !== fingerprint) {
    localStorage.removeItem(rewardHistoryKey);
    localStorage.removeItem(playerVttStateKey);
  }

  const stats = calculateStats(character);
  const inventory = existingFingerprint === fingerprint && Array.isArray(existingCharacter?.inventory)
    ? existingCharacter.inventory
    : startingInventory.map((item) => ({ ...item }));

  return {
    ...character,
    fingerprint,
    stats,
    hp: calculateHp(character, stats),
    inventory,
  };
}

function saveCharacter() {
  if (!state.race || !state.class || !state.originFeat) return;
  localStorage.setItem(savedCharacterKey, JSON.stringify(buildSavedCharacter()));
}

function renderRaceOptions() {
  state.race = null;
  state.subrace = null;
  confirmRaceButton.disabled = true;
  raceOptions.replaceChildren(
    ...randomOptions(races, 3).map((race) =>
      createChoiceCard(race, "race", (pickedRace) => {
        state.race = pickedRace;
        confirmRaceButton.disabled = false;
      }),
    ),
  );
}

function getSubraceOptions(raceName) {
  return subraceMap[raceName] || [];
}

function getClassOptions(className) {
  return classOptionMap[className] || [];
}

function spellSchoolArtPath(school) {
  const schoolImages = {
    Abjuration: "reward-img/abjuration.png",
    Conjuration: "reward-img/Conjuration.png",
    Divination: "reward-img/Divination.png",
    Enchantment: "reward-img/Enchantment.png",
    Evocation: "reward-img/Evocation.png",
    Illusion: "reward-img/Illusion.png",
    Necromancy: "reward-img/Necromancy.png",
    Transmutation: "reward-img/Transmutation.png",
  };

  return schoolImages[school] || "reward-img/SPELL.png";
}

function createSpellChoice(spell, levelLabel) {
  const effectText =
    spell.description || spell.effect || spell.text || spell.details || "Missing in Spells/spells.json";

  return {
    ...spell,
    level: levelLabel,
    cardImage: spellSchoolArtPath(spell.school),
    features: [
      `School: ${spell.school}`,
      `Casting Time: ${spell.castingTime || "Unknown"}`,
      `Range: ${spell.range || "Unknown"}`,
      `Components: ${spell.components || "Unknown"}`,
      `Duration: ${spell.duration || "Unknown"}`,
      `Effect: ${effectText}`,
    ],
  };
}

function spellKey(spell, fallbackLevel = "") {
  return `${String(spell?.name || "").toLowerCase()}::${String(spell?.level || fallbackLevel).toLowerCase()}`;
}

function createMagicInitiateSourceChoice(className) {
  return {
    name: className,
    features: [
      `Spell List: ${className}`,
      "Cantrips: Choose two cantrips from this list.",
      "Level 1 Spell: Choose one level 1 spell from this list.",
    ],
  };
}

function magicInitiateSelectionFor(featKey) {
  const feat = state[featKey];
  if (!feat.magicInitiate) {
    feat.magicInitiate = {
      sourceClass: "",
      cantrips: [],
      spell: null,
    };
  }

  return feat.magicInitiate;
}

function magicInitiateSpellOptions(sourceClass, spellKind) {
  const pool = spellKind === "cantrips" ? spellMap.cantrips : spellMap.level1;
  const levelLabel = spellKind === "cantrips" ? "Cantrip" : "Level 1";

  return (pool || [])
    .filter((spell) => spell.lists.includes(sourceClass))
    .map((spell) => createSpellChoice(spell, levelLabel));
}

function isMagicInitiate(feat) {
  return feat?.name === "Magic Initiate";
}

function spellcastingFeature(characterClass) {
  return (Array.isArray(characterClass?.features) ? characterClass.features : []).find(
    (feature) => feature.startsWith("Spellcasting:"),
  );
}

function startingSpellPlan(characterClass) {
  const spellcasting = spellcastingFeature(characterClass) || "";
  const cantripMatch = /know\s+(\d+)\s+cantrips?/i.exec(spellcasting);
  const spellMatch =
    /(?:and\s+|know\s+)(\d+)\s+(?:random\s+)?[A-Z][a-z]+\s+spells?/i.exec(
      spellcasting,
    );
  const optionFeatures = Array.isArray(state.classOption?.features)
    ? state.classOption.features.join(" ")
    : "";
  const extraCantripMatch = /know\s+(\d+)\s+extra\s+[A-Z][a-z]+\s+cantrips?/i.exec(
    optionFeatures,
  );

  return {
    cantrips:
      (cantripMatch ? Number(cantripMatch[1]) : 0) +
      (extraCantripMatch ? Number(extraCantripMatch[1]) : 0),
    spells: spellMatch ? Number(spellMatch[1]) : 0,
  };
}

function startingSpellPickKind() {
  const plan = startingSpellPlan(state.class);
  const pickedCantrips = state.startingSpells.filter(
    (spell) => spell.level === "Cantrip",
  ).length;

  if (pickedCantrips < plan.cantrips) {
    return {
      kind: "cantrips",
      level: "Cantrip",
      current: pickedCantrips + 1,
      total: plan.cantrips,
    };
  }

  const pickedSpells = state.startingSpells.filter(
    (spell) => spell.level === "Level 1",
  ).length;

  if (pickedSpells < plan.spells) {
    return {
      kind: "level1",
      level: "Level 1",
      current: pickedSpells + 1,
      total: plan.spells,
    };
  }

  return null;
}

function getStartingSpellOptions(className, spellKind) {
  const levelLabel = spellKind === "cantrips" ? "Cantrip" : "Level 1";
  const pickedSpellKeys = new Set(
    state.startingSpells
      .filter((spell) => spell.level === levelLabel)
      .map((spell) => spellKey(spell, levelLabel)),
  );
  const pool = spellKind === "cantrips" ? spellMap.cantrips : spellMap.level1;

  return (pool || [])
    .filter((spell) => spell.lists.includes(className))
    .filter((spell) => !pickedSpellKeys.has(spellKey(spell, levelLabel)))
    .map((spell) => createSpellChoice(spell, levelLabel));
}

function hasStartingSpellChoices(characterClass) {
  const plan = startingSpellPlan(characterClass);
  return plan.cantrips + plan.spells > 0;
}

function setOptionGridCount(container, count) {
  container.classList.toggle("has-two-cards", count === 2);
  container.classList.toggle("has-one-card", count === 1);
}

function renderSubraceOptions() {
  state.subrace = null;
  confirmSubraceButton.disabled = true;
  document.querySelector("#subrace-title").textContent =
    `Choose your ${state.race.name} Lineage`;

  const options = getSubraceOptions(state.race.name);
  const visibleOptions = randomOptions(options, Math.min(3, options.length));
  setOptionGridCount(subraceOptions, visibleOptions.length);
  subraceOptions.replaceChildren(
    ...visibleOptions.map((subrace) =>
      createChoiceCard(subrace, "subrace", (pickedSubrace) => {
        state.subrace = pickedSubrace;
        confirmSubraceButton.disabled = false;
      }),
    ),
  );
}

function renderClassOptions() {
  state.class = null;
  state.classOption = null;
  state.startingSpell = null;
  state.startingSpells = [];
  state.pendingStartingSpell = null;
  confirmClassButton.disabled = true;
  setOptionGridCount(classOptions, 3);
  classOptions.replaceChildren(
    ...randomOptions(classes, 3).map((characterClass) =>
      createChoiceCard(characterClass, "class", (pickedClass) => {
        state.class = pickedClass;
        confirmClassButton.disabled = false;
      }),
    ),
  );
}

function renderClassOptionOptions() {
  state.classOption = null;
  state.startingSpell = null;
  state.startingSpells = [];
  state.pendingStartingSpell = null;
  confirmClassOptionButton.disabled = true;
  const optionLabel =
    state.class.name === "Fighter"
      ? "Fighting Style"
      : state.class.name === "Cleric"
        ? "Divine Order"
        : state.class.name === "Druid"
          ? "Primal Order"
          : "Path";
  document.querySelector("#class-option-title").textContent =
    `Choose your ${state.class.name} ${optionLabel}`;

  const options = getClassOptions(state.class.name);
  const visibleOptions = randomOptions(options, Math.min(3, options.length));
  setOptionGridCount(classOptionOptions, visibleOptions.length);
  classOptionOptions.replaceChildren(
    ...visibleOptions.map((classOption) =>
      createChoiceCard(classOption, "subrace", (pickedClassOption) => {
        state.classOption = pickedClassOption;
        confirmClassOptionButton.disabled = false;
      }),
    ),
  );
}

function renderSpellOptions() {
  state.pendingStartingSpell = null;
  confirmSpellButton.disabled = true;
  const pick = startingSpellPickKind();
  if (!pick) {
    continueAfterSpellChoice();
    return;
  }

  const label = pick.level === "Cantrip" ? "Cantrip" : "Spell";
  document.querySelector("#spell-title").textContent =
    `Choose ${state.class.name} ${label} ${pick.current} of ${pick.total}`;

  const options = getStartingSpellOptions(state.class.name, pick.kind);
  const visibleOptions = randomOptions(options, Math.min(3, options.length));
  setOptionGridCount(spellOptions, visibleOptions.length);
  spellOptions.replaceChildren(
    ...visibleOptions.map((spell) =>
      createChoiceCard(spell, "spell", (pickedSpell) => {
        state.pendingStartingSpell = pickedSpell;
        confirmSpellButton.disabled = false;
      }),
    ),
  );
}

function renderMagicInitiateSourceOptions(featKey) {
  state.pendingMagicInitiateFeat = featKey;
  const selection = magicInitiateSelectionFor(featKey);
  selection.sourceClass = "";
  selection.cantrips = [];
  selection.spell = null;
  selection.step = "source";
  confirmSpellButton.disabled = true;
  document.querySelector("#spell-title").textContent =
    "Choose your Magic Initiate Spell List";

  const options = ["Cleric", "Druid", "Wizard"].map(createMagicInitiateSourceChoice);
  setOptionGridCount(spellOptions, options.length);
  spellOptions.replaceChildren(
    ...options.map((source) =>
      createChoiceCard(source, "spell", (pickedSource) => {
        selection.sourceClass = pickedSource.name;
        selection.step = "cantrips";
        confirmSpellButton.disabled = false;
      }),
    ),
  );
}

function renderMagicInitiateSpellOptions() {
  const featKey = state.pendingMagicInitiateFeat;
  const selection = magicInitiateSelectionFor(featKey);
  const choosingCantrip = selection.cantrips.length < 2;
  const spellKind = choosingCantrip ? "cantrips" : "level1";
  const cantripNumber = selection.cantrips.length + 1;
  selection.step = choosingCantrip ? "cantrips" : "spell";

  confirmSpellButton.disabled = true;
  document.querySelector("#spell-title").textContent = choosingCantrip
    ? `Choose Magic Initiate Cantrip ${cantripNumber}`
    : "Choose your Magic Initiate Spell";

  const chosenCantripKeys = new Set(
    selection.cantrips.map((spell) => spellKey(spell, "Cantrip")),
  );
  const options = magicInitiateSpellOptions(selection.sourceClass, spellKind).filter(
    (spell) => !chosenCantripKeys.has(spellKey(spell, choosingCantrip ? "Cantrip" : "Level 1")),
  );
  const visibleOptions = randomOptions(options, Math.min(3, options.length));
  setOptionGridCount(spellOptions, visibleOptions.length);
  spellOptions.replaceChildren(
    ...visibleOptions.map((spell) =>
      createChoiceCard(spell, "spell", (pickedSpell) => {
        if (choosingCantrip) {
          selection.pendingSpell = pickedSpell;
        } else {
          selection.pendingSpell = pickedSpell;
        }
        confirmSpellButton.disabled = false;
      }),
    ),
  );
}

function renderOriginFeatOptions() {
  state.originFeat = null;
  confirmOriginFeatButton.disabled = true;

  setOptionGridCount(originFeatOptions, 3);
  originFeatOptions.replaceChildren(
    ...randomOptions(originFeats, Math.min(3, originFeats.length)).map((feat) =>
      createChoiceCard(feat, "subrace", (pickedFeat) => {
        state.originFeat = pickedFeat;
        confirmOriginFeatButton.disabled = false;
      }),
    ),
  );
}

function renderHumanFeatOptions() {
  state.humanFeat = null;
  confirmHumanFeatButton.disabled = true;

  const availableFeats = originFeats.filter(
    (feat) => feat.name !== state.originFeat?.name,
  );
  const visibleOptions = randomOptions(
    availableFeats,
    Math.min(3, availableFeats.length),
  );
  setOptionGridCount(humanFeatOptions, visibleOptions.length);

  humanFeatOptions.replaceChildren(
    ...visibleOptions.map((feat) =>
      createChoiceCard(feat, "subrace", (pickedFeat) => {
        state.humanFeat = pickedFeat;
        confirmHumanFeatButton.disabled = false;
      }),
    ),
  );
}

function continueAfterClassChoices() {
  if (hasStartingSpellChoices(state.class)) {
    state.startingSpells = [];
    state.pendingStartingSpell = null;
    renderSpellOptions();
    showStage("spell");
    return;
  }

  continueAfterSpellChoice();
}

function continueAfterSpellChoice() {
  renderOriginFeatOptions();
  showStage("origin-feat");
}

function continueAfterOriginFeat() {
  if (state.race?.name === "Human") {
    renderHumanFeatOptions();
    showStage("human-feat");
  } else {
    renderSummary();
    showStage("summary");
  }
}

function continueAfterFeatChoice(featKey) {
  if (isMagicInitiate(state[featKey])) {
    renderMagicInitiateSourceOptions(featKey);
    showStage("spell");
    return;
  }

  if (featKey === "originFeat") {
    continueAfterOriginFeat();
  } else {
    renderSummary();
    showStage("summary");
  }
}

function renderSummary() {
  const raceName = state.subrace
    ? `${state.race.name} (${state.subrace.name})`
    : state.race.name;
  const className = state.classOption
    ? `${state.class.name} (${state.classOption.name})`
    : state.class.name;
  const featNames = [state.originFeat?.name, state.humanFeat?.name].filter(Boolean);
  const featText = featNames.length > 0 ? ` Feats: ${featNames.join(", ")}.` : "";
  const startingSpellNames = state.startingSpells
    .map((spell) => `${spell.name} (${spell.level})`)
    .join(", ");
  const spellText = startingSpellNames
    ? ` Starting spells: ${startingSpellNames}.`
    : "";
  const magicInitiateChoices = [state.originFeat, state.humanFeat]
    .map((feat) => feat?.magicInitiate)
    .filter(Boolean)
    .map((choice) => {
      const cantrips = choice.cantrips.map((spell) => spell.name).join(", ");
      return ` Magic Initiate (${choice.sourceClass}): ${cantrips}; ${choice.spell?.name}.`;
    })
    .join("");
  document.querySelector("#summary-title").textContent =
    `${raceName} ${className}`;
  document.querySelector("#summary-text").textContent =
    `You enter the first dungeon as a ${raceName} ${className}.${spellText}${featText}${magicInitiateChoices} Next we can add stats, starting gear, room crawling, loot, enemies, and death-or-glory run progression.`;
  document.querySelector("#summary-race-name").textContent = raceName;
  document.querySelector("#summary-race-image").src = state.race.image;
  document.querySelector("#summary-race-image").alt = state.race.name;
  document.querySelector("#summary-race-description").textContent =
    featureText(state.race.features);
  document.querySelector("#summary-class-icon").src = state.class.image;
  document.querySelector("#summary-class-icon").alt = state.class.name;
  document.querySelector("#summary-class-name").textContent = state.class.name;
  document.querySelector("#summary-class-description").textContent =
    featureText(state.class.features);
  saveCharacter();
}

async function loadRaceFeatures() {
  try {
    const response = await fetch("Races/features.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load race features: ${response.status}`);
    }

    const featureMap = await response.json();
    races.forEach((race) => {
      race.features = featureMap[race.name] || race.features;
    });
  } catch (error) {
    console.warn(error);
  }
}

async function loadSubraceFeatures() {
  try {
    const response = await fetch("Races/subraces.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load subrace options: ${response.status}`);
    }

    subraceMap = await response.json();
  } catch (error) {
    console.warn(error);
    subraceMap = {};
  }
}

async function loadClassFeatures() {
  try {
    const response = await fetch("Classes/features.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load class features: ${response.status}`);
    }

    const featureMap = await response.json();
    classes.forEach((characterClass) => {
      const classFeatures =
        featureMap[characterClass.name] ||
        "Write this class's features in Classes/features.json.";
      const savingThrows = classSavingThrowProficiencies[characterClass.name];

      characterClass.features = Array.isArray(classFeatures) && savingThrows
        ? [
            classFeatures[0],
            `Saves: ${savingThrows.join(", ")}`,
            ...classFeatures.slice(1),
          ]
        : classFeatures;
    });
  } catch (error) {
    console.warn(error);
    classes.forEach((characterClass) => {
      const savingThrows = classSavingThrowProficiencies[characterClass.name];
      characterClass.features = savingThrows
        ? [`Saves: ${savingThrows.join(", ")}`]
        : "Write this class's features in Classes/features.json.";
    });
  }
}

async function loadClassOptions() {
  try {
    const response = await fetch("Classes/options.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load class options: ${response.status}`);
    }

    classOptionMap = await response.json();
  } catch (error) {
    console.warn(error);
    classOptionMap = {};
  }
}

async function loadSpells() {
  try {
    const response = await fetch("Spells/spells.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load spells: ${response.status}`);
    }

    spellMap = await response.json();
  } catch (error) {
    console.warn(error);
    spellMap = {
      cantrips: [],
      level1: [],
    };
  }
}

async function loadOriginFeats() {
  try {
    const response = await fetch("Feats/origin-feats.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load origin feats: ${response.status}`);
    }

    const featMap = await response.json();
    originFeats = Object.entries(featMap).map(([name, features]) => ({
      name,
      features,
    }));
  } catch (error) {
    console.warn(error);
    originFeats = [];
  }
}

confirmRaceButton.addEventListener("click", () => {
  if (!state.race) return;
  if (getSubraceOptions(state.race.name).length > 0) {
    renderSubraceOptions();
    showStage("subrace");
  } else {
    renderClassOptions();
    showStage("class");
  }
});

confirmSubraceButton.addEventListener("click", () => {
  if (!state.subrace) return;
  renderClassOptions();
  showStage("class");
});

confirmClassButton.addEventListener("click", () => {
  if (!state.class) return;
  if (getClassOptions(state.class.name).length > 0) {
    renderClassOptionOptions();
    showStage("class-option");
  } else {
    continueAfterClassChoices();
  }
});

confirmClassOptionButton.addEventListener("click", () => {
  if (!state.classOption) return;
  continueAfterClassChoices();
});

confirmSpellButton.addEventListener("click", () => {
  if (state.pendingMagicInitiateFeat) {
    const featKey = state.pendingMagicInitiateFeat;
    const selection = magicInitiateSelectionFor(featKey);

    if (!selection.sourceClass) return;

    if (selection.step === "cantrips" && selection.cantrips.length === 0 && !selection.pendingSpell) {
      renderMagicInitiateSpellOptions();
      return;
    }

    if (!selection.pendingSpell) return;

    if (selection.cantrips.length < 2) {
      selection.cantrips.push(selection.pendingSpell);
      selection.pendingSpell = null;
      renderMagicInitiateSpellOptions();
      return;
    }

    selection.spell = selection.pendingSpell;
    delete selection.pendingSpell;
    state.pendingMagicInitiateFeat = null;

    if (featKey === "originFeat") {
      continueAfterOriginFeat();
    } else {
      renderSummary();
      showStage("summary");
    }
    return;
  }

  if (!state.pendingStartingSpell) return;

  state.startingSpells.push(state.pendingStartingSpell);
  state.startingSpell = state.startingSpells[0] || null;
  state.pendingStartingSpell = null;

  if (startingSpellPickKind()) {
    renderSpellOptions();
    return;
  }

  continueAfterSpellChoice();
});

confirmOriginFeatButton.addEventListener("click", () => {
  if (!state.originFeat) return;
  continueAfterFeatChoice("originFeat");
});

confirmHumanFeatButton.addEventListener("click", () => {
  if (!state.humanFeat) return;
  continueAfterFeatChoice("humanFeat");
});

rerollButton.addEventListener("click", () => {
  state.race = null;
  state.subrace = null;
  state.class = null;
  state.classOption = null;
  state.startingSpell = null;
  state.startingSpells = [];
  state.pendingStartingSpell = null;
  state.originFeat = null;
  state.humanFeat = null;
  state.pendingMagicInitiateFeat = null;
  continueButton.textContent = "Continue";
  continueButton.disabled = false;
  renderRaceOptions();
  showStage("race");
});

continueButton.addEventListener("click", () => {
  saveCharacter();
  window.location.href = "future.html";
});

try {
  renderRaceOptions();
Promise.all([
  loadRaceFeatures(),
  loadSubraceFeatures(),
  loadClassFeatures(),
  loadClassOptions(),
  loadSpells(),
  loadOriginFeats(),
]).then(renderRaceOptions);
} catch (error) {
  console.error("Game failed to start", error);
}
