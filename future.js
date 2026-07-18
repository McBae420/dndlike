const savedCharacterKey = "avtizm4.character";
const rewardHistoryKey = "avtizm4.rewards";
const pendingDungeonRewardKey = "avtizm4.pendingDungeonReward";
const startingStats = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};
const statLabels = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};
const statKeyMap = {
  STR: "str",
  DEX: "dex",
  CON: "con",
  INT: "int",
  WIS: "wis",
  CHA: "cha",
};
const abilityNameMap = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
};
const classSavingThrowProficiencies = {
  Barbarian: ["str", "con"],
  Bard: ["dex", "cha"],
  Cleric: ["wis", "cha"],
  Druid: ["int", "wis"],
  Fighter: ["str", "con"],
  Monk: ["str", "dex"],
  Paladin: ["wis", "cha"],
  Ranger: ["str", "dex"],
  Rogue: ["dex", "int"],
  Sorcerer: ["con", "cha"],
  Warlock: ["wis", "cha"],
  Wizard: ["int", "wis"],
};
const classSpellcastingAbilities = {
  Bard: "cha",
  Cleric: "wis",
  Druid: "wis",
  Paladin: "cha",
  Ranger: "wis",
  Sorcerer: "cha",
  Warlock: "cha",
  Wizard: "int",
};
const rewardRarityTables = {
  normal: [
    ["common", 55],
    ["uncommon", 30],
    ["rare", 11],
    ["veryRare", 3],
    ["legendary", 1],
  ],
  elite: [
    ["common", 30],
    ["uncommon", 42],
    ["rare", 18],
    ["veryRare", 7],
    ["legendary", 3],
  ],
  boss: [
    ["uncommon", 40],
    ["rare", 40],
    ["veryRare", 14],
    ["legendary", 6],
  ],
  finalBoss: [
    ["rare", 50],
    ["veryRare", 32],
    ["legendary", 18],
  ],
};

const rarityLabels = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  veryRare: "Very Rare",
  legendary: "Legendary",
};

const classKnownSpells = {
  Paladin: [
    {
      name: "Divine Smite",
      kind: "level1",
      school: "Evocation",
    },
  ],
  Ranger: [
    {
      name: "Hunter's Mark",
      kind: "level1",
      school: "Divination",
    },
  ],
};

const rewardActionDetails = {
  "level-up": {
    rarityTable: rewardRarityTables.normal,
    title: "Choose your Levelup Feature",
    context: "Level-Up Reward: choose 1 of 3 Floor 1 rewards.",
    savedType: "Dungeon Reward",
    grantsLevel: true,
    minimumRarity: "uncommon",
  },
  elite: {
    rarityTable: rewardRarityTables.elite,
    title: "Choose your Elite Reward",
    context: "Elite Reward: choose 1 of 3 rewards with better rarity odds.",
    savedType: "Elite Reward",
    grantsLevel: true,
    minimumRarity: "uncommon",
  },
  boss: {
    rarityTable: rewardRarityTables.boss,
    title: "Choose your Boss Reward",
    context: "Boss Reward: choose 1 of 3 rewards. No common rewards can appear.",
    savedType: "Boss Reward",
    grantsLevel: true,
  },
  "final-boss": {
    rarityTable: rewardRarityTables.finalBoss,
    title: "Choose your Final Boss Reward",
    context: "Final Boss Reward: choose 1 of 3 rewards. Only rare, very rare, and legendary rewards can appear.",
    savedType: "Final Boss Reward",
    grantsLevel: true,
  },
};

const savedCharacter = document.querySelector("#saved-character");
const savedRewards = document.querySelector("#saved-rewards");
const statTracker = document.querySelector("#stat-tracker");
const inventoryList = document.querySelector("#inventory-list");
const futureApp = document.querySelector(".future-app");
const rewardActionButtons = document.querySelectorAll("[data-reward-action]");
const levelUpChoice = document.querySelector("#level-up-choice");
const levelUpChoiceTitle = document.querySelector("#level-up-choice-title");
const confirmLevelUpButton = document.querySelector("#confirm-level-up");
const floorOneRewards = document.querySelector("#floor-one-rewards");
const rewardContext = document.querySelector("#reward-context");
const dmRewardGrants = document.querySelector("#dm-reward-grants");

let rewardPools = {};
let originFeats = [];
let generalFeats = [];
let spellPools = {};
let magicItemPools = {};
let currentRewardOffer = [];
let selectedRewardIndex = null;
let currentRewardClass = "Barbarian";
let currentRewardGrantsLevel = false;
let currentRewardTypeLabel = "Dungeon Reward";
let pickerMode = "reward";
let pendingReward = null;
let pendingOriginFeatChoice = null;
let pendingGeneralFeatChoices = [];
let pendingGeneralFeatTotal = 0;
let pendingGeneralFeatStatChanges = [];
let pendingFeatAsiContext = null;
let pendingStatPlan = [];
let pendingStatChanges = [];
let pendingSpellKind = null;
let pendingMagicInitiate = null;
let pendingMagicItemChoice = null;
let pendingDungeonReturnUrl = "";
let activeDmRewardGrant = null;
let multiplayerSheetSyncTimer = null;

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function choiceName(choice) {
  return choice?.name || "None";
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomOptions(items, count) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function setOptionGridCount(container, count) {
  container.classList.toggle("has-two-cards", count === 2);
  container.classList.toggle("has-one-card", count === 1);
}

function rewardArt(src, alt) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;

  const imageWrap = document.createElement("div");
  imageWrap.className = "choice-image reward-choice-image";
  imageWrap.append(image);
  return imageWrap;
}

function statRewardArt(stat, alt) {
  return rewardArt(`reward-img/ASI-${statLabels[stat]}.png`, alt);
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

function spellRewardArt(spell) {
  return rewardArt(spellSchoolArtPath(spell?.school), spell?.name || "Spell");
}

function appendSpellDetails(description, spell, spellKindLabel) {
  const effectText =
    spell?.description || spell?.effect || spell?.text || spell?.details || "Missing in Spells/spells.json";
  const detailRows = [
    ["School", spell?.school || "Unknown"],
    ["Casting Time", spell?.castingTime || "Unknown"],
    ["Range", spell?.range || "Unknown"],
    ["Components", spell?.components || "Unknown"],
    ["Duration", spell?.duration || "Unknown"],
    ["Effect", effectText],
  ];

  description.append(
    ...detailRows.map(([label, value]) => {
      const item = document.createElement("li");
      item.innerHTML = `<span class="feature-label">${label}:</span> ${value}`;
      return item;
    }),
  );
}

function magicItemRarityForReward(reward) {
  const text = `${reward?.name || ""} ${reward?.text || ""}`;
  const match = /\brandom\s+(common|uncommon|rare|very rare|legendary)\s+magic item/i.exec(text);
  if (!match) return null;
  const rarity = match[1].toLowerCase();
  return rarity === "very rare" ? "veryRare" : rarity;
}

function canClassUseMagicItem(item, className) {
  return !item?.requiredClasses?.length || item.requiredClasses.includes(className);
}

function magicItemOptionsForReward(reward, className = "") {
  const rarity = magicItemRarityForReward(reward);
  const items = rarity ? magicItemPools[rarity] || [] : [];
  return className ? items.filter((item) => canClassUseMagicItem(item, className)) : items;
}

function needsMagicItemPicker(reward, className = "") {
  return magicItemOptionsForReward(reward, className).length > 0;
}

function magicItemMeta(item) {
  return [
    item?.type,
    item?.attunement ? "Attunement" : "No attunement",
    item?.price,
  ].filter(Boolean).join(" - ");
}

function magicItemArtPath(item) {
  return /potion/i.test(`${item?.name || ""} ${item?.type || ""}`)
    ? "reward-img/potions.jpg"
    : "reward-img/Magic-item.png";
}

function magicItemDisplayName(item) {
  return item?.spellScrollSpell ? `${item.name}: ${item.spellScrollSpell.name}` : item?.name || "Magic Item";
}

function magicItemDescription(item) {
  if (!item?.spellScrollSpell) return item?.description || "Magic item.";
  const level = item.spellScrollLevel || 1;
  return `Contains ${item.spellScrollSpell.name}, a random level ${level} spell. ${item.description || ""}`.trim();
}

function spellScrollLevel(item) {
  return item?.spellScrollLevel || (item?.grantsRandomLevel1Spell ? 1 : 0);
}

function resolveMagicItemChoice(item, spell = null) {
  const scrollLevel = spellScrollLevel(item);
  if (!scrollLevel) return item;
  return {
    ...item,
    spellScrollSpell: spell,
  };
}

function appendMagicItemDetails(description, item) {
  const detailRows = [
    ["Type", item?.type || "Unknown"],
    ["Attunement", item?.attunement ? "Yes" : "No"],
    ["Price", item?.price || "Unknown"],
    ["Effect", magicItemDescription(item)],
  ];

  description.append(
    ...detailRows.map(([label, value]) => {
      const detail = document.createElement("li");
      detail.innerHTML = `<span class="feature-label">${label}:</span> ${value}`;
      return detail;
    }),
  );
}

function rewardArtPath(reward) {
  const text = `${reward?.name || ""} ${reward?.category || ""} ${reward?.text || ""}`.toLowerCase();

  if (/potion/.test(text)) return "reward-img/potions.jpg";
  if (/gold|coin|money|trade goods?\b|\bgp\b/.test(text)) return "reward-img/Gold.png";
  if (/origin feat|origin spark/.test(text)) return "reward-img/Origin-feat.png";
  if (/\b(?:gain|choose|random)\s+\d*\s*random feats?\b|\bgain\s+\d+\s+random feats?\b|\bfeat reward\b/.test(text)) {
    return "reward-img/FEAT.png";
  }
  if (/spell|cantrip/.test(text)) return "reward-img/SPELL.png";
  if (/stat|ability score|growth|training|form/.test(text)) return "reward-img/ASI.png";
  if (/relic|treasure|magic item/.test(text)) return "reward-img/Magic-item.png";
  return "reward-img/placeholder.png";
}

function renderSavedCharacter() {
  const character = getCharacterWithStats();

  if (!character) {
    savedCharacter.textContent = "No character saved yet. Build one, then press Continue.";
    return;
  }

  const raceName = character.subrace
    ? `${choiceName(character.race)} (${choiceName(character.subrace)})`
    : choiceName(character.race);
  const className = character.classOption
    ? `${choiceName(character.class)} (${choiceName(character.classOption)})`
    : choiceName(character.class);
  const feats = [character.originFeat, character.humanFeat]
    .filter(Boolean)
    .map(choiceName);

  const details = [
    ["Race", raceName],
    ["Class", className],
    ["Feats", feats.length > 0 ? feats.join(", ") : "None"],
  ];

  const detailRows = details.map(([label, value]) => {
    const row = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    row.append(strong, value);
    return row;
  });

  const detailsBlock = document.createElement("div");
  detailsBlock.className = "character-details";
  detailsBlock.append(...detailRows);

  const levelCard = document.createElement("section");
  levelCard.className = "level-card";

  const levelLabel = document.createElement("strong");
  levelLabel.textContent = "Level";

  const levelValue = document.createElement("span");
  levelValue.className = "level-value";
  levelValue.textContent = character.hp?.level || 1;

  levelCard.append(levelLabel, levelValue);

  const proficiencyCard = document.createElement("section");
  proficiencyCard.className = "proficiency-card";

  const proficiencyLabel = document.createElement("strong");
  proficiencyLabel.textContent = "PB";

  const proficiencyValue = document.createElement("span");
  proficiencyValue.className = "proficiency-value";
  proficiencyValue.textContent = `+${proficiencyBonus(character.hp.level)}`;

  proficiencyCard.append(proficiencyLabel, proficiencyValue);

  const hitDieCard = document.createElement("section");
  hitDieCard.className = "hit-die-card";

  const hitDieLabel = document.createElement("strong");
  hitDieLabel.textContent = "Hit Die";

  const hitDieValue = document.createElement("span");
  hitDieValue.className = "hit-die-value";
  hitDieValue.textContent = `d${classHitDie(character.class?.features)}`;

  hitDieCard.append(hitDieLabel, hitDieValue);

  const characterBadges = document.createElement("div");
  characterBadges.className = "character-badges";
  characterBadges.append(levelCard, proficiencyCard, hitDieCard);

  const characterTopline = document.createElement("div");
  characterTopline.className = "character-topline";
  characterTopline.append(characterBadges, detailsBlock);

  savedCharacter.replaceChildren(characterTopline, renderSpellbook(character));
}

function saveCharacter(character) {
  localStorage.setItem(savedCharacterKey, JSON.stringify(character));
}

function saveReward(reward) {
  const rewards = loadJson(rewardHistoryKey, []);
  rewards.unshift(reward);
  localStorage.setItem(rewardHistoryKey, JSON.stringify(rewards));
  const character = getCharacterWithStats();
  if (character) {
    saveCharacter(character);
  }
  scheduleMultiplayerSheetSync();
}

function multiplayerOwnMember() {
  const state = window.avtizmMultiplayer?.getState();
  if (!state?.connected) return null;
  return (state.members || []).find((member) => member.user_id === state.userId) || null;
}

function multiplayerSheetState() {
  const savedState = loadJson("avtizm4.vtt.player", {});
  return {
    ...savedState,
    rewards: loadJson(rewardHistoryKey, []),
    sheetUpdatedAt: new Date().toISOString(),
  };
}

async function syncMultiplayerSheet() {
  const multiplayer = window.avtizmMultiplayer;
  const state = multiplayer?.getState();
  const character = loadJson(savedCharacterKey, null);
  if (!state?.connected || !character) return false;
  return multiplayer.syncCharacter(character, multiplayerSheetState());
}

function scheduleMultiplayerSheetSync() {
  if (multiplayerSheetSyncTimer) window.clearTimeout(multiplayerSheetSyncTimer);
  multiplayerSheetSyncTimer = window.setTimeout(() => {
    multiplayerSheetSyncTimer = null;
    syncMultiplayerSheet();
  }, 180);
}

function rewardGrantLabel(type) {
  return {
    "level-up": "Level-Up Reward",
    common: "Common Reward",
    elite: "Elite Reward",
    boss: "Boss Reward",
    "final-boss": "Final Boss Reward",
    feat: "Feat Reward",
    asi: "Ability Score Reward",
  }[type] || "Reward";
}

function renderDmRewardGrants() {
  if (!dmRewardGrants) return;
  const state = window.avtizmMultiplayer?.getState();
  const ownMember = multiplayerOwnMember();
  const grants = Array.isArray(ownMember?.player_state?.pendingRewards)
    ? ownMember.player_state.pendingRewards
    : [];

  if (!state?.connected) {
    rewardContext.textContent = "Join a lobby to receive rewards from your DM.";
    const empty = document.createElement("p");
    empty.className = "dm-reward-empty";
    empty.textContent = "No lobby connected.";
    dmRewardGrants.replaceChildren(empty);
    return;
  }
  if (grants.length === 0) {
    rewardContext.textContent = "Your character is synchronized. Waiting for the DM to send a reward.";
    const empty = document.createElement("p");
    empty.className = "dm-reward-empty";
    empty.textContent = "No unclaimed rewards.";
    dmRewardGrants.replaceChildren(empty);
    return;
  }

  rewardContext.textContent = `${grants.length} reward${grants.length === 1 ? "" : "s"} waiting. Choose one to claim.`;
  dmRewardGrants.replaceChildren(...grants.map((grant) => {
    const card = document.createElement("article");
    card.className = "dm-reward-grant";
    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = rewardGrantLabel(grant.type);
    const meta = document.createElement("small");
    meta.textContent = "Sent by your DM";
    details.append(title, meta);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Choose";
    button.addEventListener("click", () => {
      activeDmRewardGrant = grant;
      openRewardChoice(grant.type);
    });
    card.append(details, button);
    return card;
  }));
}

function applyStatChanges(stats, changes) {
  (changes || []).forEach((change) => {
    if (stats[change.stat] !== undefined) {
      stats[change.stat] += change.amount;
    }
  });
}

function abilityScoreIncreaseText(feat) {
  return (feat?.features || []).find((feature) =>
    /ability score increase|increase one ability score/i.test(feature),
  ) || "";
}

function abilityKeysFromText(text) {
  const matches = text.match(/Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma/g);
  return [...new Set((matches || []).map((name) => abilityNameMap[name]).filter(Boolean))];
}

function featAsiOptions(feat, chosenChanges = []) {
  const text = abilityScoreIncreaseText(feat);
  if (!text) return [];

  const allStats = Object.keys(statLabels);

  if (/increase one ability score[\s\S]*by 2[\s\S]*increase two ability scores[\s\S]*by 1/i.test(text)) {
    return allStats.map((stat) => ({
      name: `${statLabels[stat]} +2`,
      stat,
      amount: 2,
      mode: "single",
      complete: true,
      features: [`Increase ${statLabels[stat]} by 2.`],
    }));
  }

  const statKeys = abilityKeysFromText(text);
  if (statKeys.length === 0) return [];

  return statKeys.map((stat) => ({
    name: `${statLabels[stat]} +1`,
    stat,
    amount: 1,
    mode: "single",
    complete: true,
    features: [`Increase ${statLabels[stat]} by 1.`],
  }));
}

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function proficiencyBonus(level) {
  return 2 + Math.floor((level - 1) / 4);
}

function classSavingThrows(character) {
  return classSavingThrowProficiencies[character?.class?.name] || [];
}

function hasToughFeat(character) {
  const rewards = loadJson(rewardHistoryKey, []);
  const featNames = [
    character?.originFeat?.name,
    character?.humanFeat?.name,
    ...rewards.map((reward) => reward.featChoice?.name),
    ...rewards.flatMap((reward) => (reward.featChoices || []).map((feat) => feat.name)),
  ];
  return featNames.some((name) => /tough|tought/i.test(name || ""));
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

function manaFromText(text) {
  const manaMatches = [...(text || "").matchAll(/(?:gain|have|also gain)\s+(\d+)\s+max Mana/gi)];
  return manaMatches.reduce((total, match) => total + Number(match[1]), 0);
}

function rewardManaChange(reward) {
  return manaFromText(reward?.text || "");
}

function classStatChanges(features) {
  const statLine = (Array.isArray(features) ? features : [features || ""]).find((feature) =>
    feature.startsWith("Stats:"),
  );
  const changes = [];
  const statPattern = /([+-]\d+)\s+(STR|DEX|CON|INT|WIS|CHA)(?:\s+or\s+(STR|DEX|CON|INT|WIS|CHA))?/g;
  let match = statPattern.exec(statLine || "");

  while (match) {
    changes.push({
      stat: statKeyMap[match[2]],
      amount: Number(match[1]),
    });
    match = statPattern.exec(statLine || "");
  }

  return changes;
}

function classHitDie(features) {
  const statLine = (Array.isArray(features) ? features : [features || ""]).find((feature) =>
    feature.startsWith("HP:"),
  );
  const hp = Number((statLine || "").replace("HP:", "").trim());
  return Number.isFinite(hp) && hp > 0 ? hp : 8;
}

function classMaxMana(features) {
  return manaFromText((Array.isArray(features) ? features : [features || ""]).join(" "));
}

function calculateStats(character) {
  const stats = { ...startingStats };
  const rewards = loadJson(rewardHistoryKey, []);
  applyStatChanges(stats, classStatChanges(character.class?.features));
  rewards.forEach((reward) => applyStatChanges(stats, reward.statChanges));
  return stats;
}

function calculateHp(character, stats) {
  const rewards = loadJson(rewardHistoryKey, []);
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

function calculateMana(character) {
  const rewards = loadJson(rewardHistoryKey, []);
  const classMana = classMaxMana(character.class?.features);
  const rewardMana = rewards.reduce(
    (total, reward) => total + (reward.manaChange ?? rewardManaChange(reward)),
    0,
  );

  return {
    max: classMana + rewardMana,
  };
}

function getCharacterWithStats() {
  const character = loadJson(savedCharacterKey, null);

  if (!character) return null;

  character.stats = calculateStats(character);
  character.hp = calculateHp(character, character.stats);
  character.mana = calculateMana(character);
  saveCharacter(character);
  return character;
}

function modifierText(score) {
  const modifier = abilityModifier(score);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function featureLabel(feature) {
  return feature?.includes(":") ? feature.split(":")[0] : "";
}

function featureDetail(feature) {
  return feature?.includes(":") ? feature.slice(feature.indexOf(":") + 1).trim() : feature;
}

function labeledFeatureValue(features, label) {
  const feature = (Array.isArray(features) ? features : []).find((item) =>
    item.startsWith(`${label}:`),
  );
  return feature ? featureDetail(feature) : "";
}

function classFeatureValue(character, label) {
  return labeledFeatureValue(character?.class?.features, label);
}

function featFeatureList(character) {
  const rewards = loadJson(rewardHistoryKey, []);
  return [
    ...(character?.originFeat?.features || []),
    ...(character?.humanFeat?.features || []),
    ...rewards.flatMap((reward) => reward.featChoice?.features || []),
    ...rewards.flatMap((reward) =>
      (reward.featChoices || []).flatMap((feat) => feat.features || []),
    ),
  ];
}

function trainingFeatureText(character) {
  return [
    ...(character?.classOption?.features || []),
    ...featFeatureList(character),
  ].join(" ");
}

function normalizedListValue(value) {
  return String(value || "")
    .split(/,\s*|\s+and\s+/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function titleCaseShort(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function classArmorProficiency(character) {
  const armor = normalizedListValue(classFeatureValue(character, "Armor"));
  const trainingText = trainingFeatureText(character);

  if (/\bgain(?:s)?\s+(?:training|proficiency)?\s*(?:with)?[^.]*light armor/i.test(trainingText)) armor.push("Light");
  if (/\bgain(?:s)?\s+(?:training|proficiency)?\s*(?:with)?[^.]*medium armor/i.test(trainingText)) armor.push("Medium");
  if (/\bgain(?:s)?\s+(?:training|proficiency)?\s*(?:with)?[^.]*heavy armor/i.test(trainingText)) armor.push("Heavy");
  if (/\bgain(?:s)?\s+(?:training|proficiency)?\s*(?:with)?[^.]*shields?/i.test(trainingText)) armor.push("Shields");

  const hasAllArmor = armor.some((item) => /all armor/i.test(item));
  const filtered = hasAllArmor
    ? armor.filter((item) => !/^(light|medium|heavy)$/i.test(item))
    : armor;

  return [...new Set(filtered.map(titleCaseShort))].join(", ");
}

function classWeaponProficiency(character) {
  const weapons = normalizedListValue(classFeatureValue(character, "Weapons"));
  const trainingText = trainingFeatureText(character);

  if (/\bgain(?:s)?\s+proficiency\s+with[^.]*simple weapons?/i.test(trainingText)) weapons.push("Simple");
  if (/\bgain(?:s)?\s+proficiency\s+with[^.]*improvised weapons?/i.test(trainingText)) weapons.push("Improvised");
  if (/\bgain(?:s)?\s+proficiency\s+with[^.]*martial weapons?|\bgain(?:s)?[^.]*martial weapons?/i.test(trainingText)) weapons.push("Martial");

  return [...new Set(weapons.map(titleCaseShort))].join(", ");
}

function traitStatDisplayValue(label, value) {
  return String(value || "")
    .replace(/^You have\s+/i, "")
    .replace(new RegExp(`^${label}\\s*`, "i"), "")
    .trim();
}

function spellcastingAbility(character) {
  const spellcasting = classFeatureValue(character, "Spellcasting");
  const match = /spellcasting ability is\s+(\w+)/i.exec(spellcasting);
  if (match) return abilityNameMap[match[1]] || "";
  if (spellcasting) return classSpellcastingAbilities[character?.class?.name] || "";

  const magicInitiate =
    character?.originFeat?.magicInitiate ||
    character?.humanFeat?.magicInitiate ||
    loadJson(rewardHistoryKey, []).find((reward) => reward.featChoice?.magicInitiate)
      ?.featChoice?.magicInitiate;

  return classSpellcastingAbilities[magicInitiate?.sourceClass] || "";
}

function spellSaveDc(character) {
  const ability = spellcastingAbility(character);
  if (!ability) return null;
  return 8 + proficiencyBonus(character.hp.level) + abilityModifier(character.stats[ability]);
}

function spellKindLabel(kind) {
  if (!kind) return "";
  if (kind === "cantrips") return "Cantrip";
  if (/^level\d+$/i.test(kind)) return `Level ${kind.replace(/\D/g, "")}`;
  return kind;
}

function spellKey(spell, fallbackKind = "") {
  const kind = spellKindLabel(spell?.level || spell?.kind || fallbackKind);
  return `${String(spell?.name || "").toLowerCase()}::${kind.toLowerCase()}`;
}

function spellKindRank(kind) {
  if (/cantrip/i.test(kind || "")) return 0;
  const levelMatch = /level\s*(\d+)/i.exec(kind || "");
  return levelMatch ? Number(levelMatch[1]) : 99;
}

function addSpellEntry(entries, spell, source, fallbackKind = "") {
  if (!spell?.name) return;

  entries.push({
    name: spell.name,
    kind: spellKindLabel(spell.level || spell.kind || fallbackKind),
    school: spell.school || "",
    source,
  });
}

function findCantripByName(name) {
  return (spellPools.cantrips || []).find(
    (spell) => spell.name.toLowerCase() === String(name || "").toLowerCase(),
  );
}

function knownCantripNamesFromText(text) {
  const names = [];
  const pattern = /\b(?:you\s+(?:also\s+)?know|know)\s+(?:the\s+)?([A-Z][A-Za-z' -]*(?:\s+and\s+[A-Z][A-Za-z' -]*)?)\s+cantrips?\b/gi;
  let match = pattern.exec(text || "");

  while (match) {
    names.push(
      ...match[1]
        .split(/\s+and\s+/i)
        .map((name) => name.trim())
        .filter(Boolean),
    );
    match = pattern.exec(text || "");
  }

  return names;
}

function featureCantripSpells(features, source) {
  return (Array.isArray(features) ? features : [features || ""])
    .filter(Boolean)
    .flatMap((feature) => {
      const label = featureLabel(feature) || source;
      return knownCantripNamesFromText(featureDetail(feature)).map((name) => ({
        spell: findCantripByName(name) || {
          name,
          level: "Cantrip",
          school: "",
        },
        source: label,
      }));
    });
}

function featureDetailWithoutKnownCantrips(detail) {
  return String(detail || "")
    .replace(/\bYou\s+(?:also\s+)?know\s+(?:the\s+)?[A-Z][A-Za-z' -]*(?:\s+and\s+[A-Z][A-Za-z' -]*)?\s+cantrips?\.\s*/gi, "")
    .replace(/\bKnow\s+(?:the\s+)?[A-Z][A-Za-z' -]*(?:\s+and\s+[A-Z][A-Za-z' -]*)?\s+cantrips?\.\s*/g, "")
    .replace(/^You also\s+/i, "You ")
    .trim();
}

function characterSpellEntries(character) {
  const entries = [];
  const rewards = loadJson(rewardHistoryKey, []);

  const startingSpells =
    character.startingSpells?.length > 0
      ? character.startingSpells
      : [character.startingSpell].filter(Boolean);
  startingSpells.forEach((spell) =>
    addSpellEntry(entries, spell, "Starting Class"),
  );

  (classKnownSpells[character.class?.name] || []).forEach((spell) =>
    addSpellEntry(entries, spell, `${character.class.name} Feature`, spell.kind),
  );

  [
    ...featureCantripSpells(character.race?.features, choiceName(character.race)),
    ...featureCantripSpells(character.subrace?.features, choiceName(character.subrace)),
    ...featureCantripSpells(character.classOption?.features, choiceName(character.classOption)),
  ].forEach(({ spell, source }) => addSpellEntry(entries, spell, source, "Cantrip"));

  [character.originFeat, character.humanFeat].forEach((feat) => {
    const magicInitiate = feat?.magicInitiate;
    if (!magicInitiate) return;

    magicInitiate.cantrips?.forEach((spell) =>
      addSpellEntry(entries, spell, `Magic Initiate (${magicInitiate.sourceClass})`, "Cantrip"),
    );
    addSpellEntry(
      entries,
      magicInitiate.spell,
      `Magic Initiate (${magicInitiate.sourceClass})`,
      "Level 1",
    );
  });

  rewards.forEach((reward) => {
    addSpellEntry(
      entries,
      reward.spellChoice,
      reward.name || "Reward",
      reward.spellChoice?.kind || "",
    );
    addSpellEntry(
      entries,
      reward.magicItemChoice?.spellScrollSpell,
      rewardDisplayName(reward),
      `level${reward.magicItemChoice?.spellScrollLevel || 1}`,
    );

    const magicInitiate = reward.featChoice?.magicInitiate;
    if (!magicInitiate) return;

    magicInitiate.cantrips?.forEach((spell) =>
      addSpellEntry(entries, spell, `Magic Initiate (${magicInitiate.sourceClass})`, "Cantrip"),
    );
    addSpellEntry(
      entries,
      magicInitiate.spell,
      `Magic Initiate (${magicInitiate.sourceClass})`,
      "Level 1",
    );
  });

  return entries.sort(
    (a, b) =>
      spellKindRank(a.kind) - spellKindRank(b.kind) ||
      a.name.localeCompare(b.name),
  );
}

function renderSpellbook(character) {
  const spellbook = document.createElement("section");
  spellbook.className = "spellbook";

  const title = document.createElement("h3");
  title.textContent = "Spells";

  const manaBadge = document.createElement("div");
  manaBadge.className = "spellbook-mana";

  const manaLabel = document.createElement("strong");
  manaLabel.textContent = "Mana";

  const manaValue = document.createElement("span");
  manaValue.textContent = character.mana?.max ?? 0;

  manaBadge.append(manaLabel, manaValue);

  const spellDc = spellSaveDc(character);
  const spellDcBadge = document.createElement("div");
  spellDcBadge.className = "spellbook-mana spellbook-dc";

  const spellDcLabel = document.createElement("strong");
  spellDcLabel.textContent = "Save DC";

  const spellDcValue = document.createElement("span");
  spellDcValue.textContent = spellDc ?? "-";

  spellDcBadge.append(spellDcLabel, spellDcValue);

  const spellBadges = document.createElement("div");
  spellBadges.className = "spellbook-badges";
  spellBadges.append(manaBadge);
  if (spellDc !== null) spellBadges.append(spellDcBadge);

  const header = document.createElement("div");
  header.className = "spellbook-header";
  header.append(title, spellBadges);

  const spells = characterSpellEntries(character);
  if (spells.length === 0) {
    const empty = document.createElement("p");
    empty.className = "spellbook-empty";
    empty.textContent = "No spells learned yet.";
    spellbook.append(header, empty);
    return spellbook;
  }

  const groupedSpells = new Map();
  spells.forEach((spell) => {
    if (!groupedSpells.has(spell.kind)) {
      groupedSpells.set(spell.kind, []);
    }
    groupedSpells.get(spell.kind).push(spell);
  });

  const list = document.createElement("div");
  list.className = "spell-list";
  list.append(
    ...[...groupedSpells.entries()].map(([kind, kindSpells]) => {
      const group = document.createElement("section");
      group.className = "spell-level-group";

      const heading = document.createElement("h4");
      heading.textContent = kind;

      group.append(heading, ...kindSpells.map(createSpellRow));
      return group;
    }),
  );

  spellbook.append(header, list);
  return spellbook;
}

function createSpellRow(spell) {
  const row = document.createElement("section");
  row.className = "spell-row";

  const name = document.createElement("strong");
  name.textContent = spell.name;

  const meta = document.createElement("span");
  meta.textContent = [spell.kind, spell.school].filter(Boolean).join(" - ");

  const source = document.createElement("small");
  source.textContent = spell.source;

  row.append(name, meta, source);
  return row;
}

function renderStatTracker() {
  const character = getCharacterWithStats();

  if (!character) {
    statTracker.textContent = "No character saved yet.";
    return;
  }

  const statsList = document.createElement("div");
  statsList.className = "stat-list";
  const saveProficiencies = new Set(classSavingThrows(character));
  const profBonus = proficiencyBonus(character.hp.level);
  statsList.append(
    ...Object.entries(statLabels).map(([stat, label]) => {
      const statLine = document.createElement("div");
      statLine.className = "stat-line";

      const row = document.createElement("section");
      row.className = "stat-row";

      const name = document.createElement("strong");
      name.textContent = label;

      const score = document.createElement("span");
      score.className = "stat-score";
      score.textContent = character.stats[stat];

      const modifier = document.createElement("span");
      modifier.className = "stat-modifier";
      modifier.textContent = modifierText(character.stats[stat]);

      const saveRow = document.createElement("section");
      saveRow.className = "stat-row stat-save-row";

      const saveLabel = document.createElement("strong");
      saveLabel.textContent = "Save";

      const saveValue = abilityModifier(character.stats[stat]) + (saveProficiencies.has(stat) ? profBonus : 0);
      const savingThrow = document.createElement("span");
      savingThrow.className = "stat-save";
      savingThrow.textContent = saveValue >= 0 ? `+${saveValue}` : String(saveValue);

      row.append(name, score, modifier);
      saveRow.append(saveLabel, savingThrow);
      statLine.append(row, saveRow);
      return statLine;
    }),
  );

  const traitStats = [
    {
      label: "Creature Type",
      value: labeledFeatureValue(character.race?.features, "Creature Type"),
    },
    {
      label: "Size",
      value: labeledFeatureValue(character.race?.features, "Size"),
      icon: "Icons/user.png",
    },
    {
      label: "Speed",
      value: labeledFeatureValue(character.race?.features, "Speed"),
      icon: "Icons/running.png",
    },
    {
      label: "Darkvision",
      value: labeledFeatureValue(character.race?.features, "Darkvision"),
      icon: "Icons/eye.png",
    },
    {
      label: "Armor",
      value: classArmorProficiency(character),
    },
    {
      label: "Weapons",
      value: classWeaponProficiency(character),
    },
  ].filter(({ value }) => value);

  if (traitStats.length > 0) {
    const traitStatsList = document.createElement("div");
    traitStatsList.className = "trait-stat-list";
    traitStatsList.append(
      ...traitStats.map(({ label, value, icon }) => {
        const row = document.createElement("section");
        row.className = icon ? "trait-stat-row has-icon" : "trait-stat-row";

        if (icon) {
          const iconElement = document.createElement("span");
          iconElement.className = "trait-stat-icon";
          iconElement.style.setProperty("--icon-url", `url("${icon}")`);
          iconElement.setAttribute("aria-hidden", "true");
          row.append(iconElement);
        }

        const name = document.createElement("strong");
        name.textContent = label;

        const text = document.createElement("span");
        text.textContent = traitStatDisplayValue(label, value);

        row.append(name, text);
        return row;
      }),
    );
    statsList.append(traitStatsList);
  }

  const hpCard = document.createElement("section");
  hpCard.className = "hp-card";

  const hpLabel = document.createElement("strong");
  hpLabel.textContent = "HP";

  const hpValue = document.createElement("span");
  hpValue.className = "hp-value";
  hpValue.textContent = character.hp.max;

  hpCard.append(hpLabel, hpValue);

  statTracker.replaceChildren(statsList, hpCard);
}

function rewardStatPlan(reward) {
  const text = `${reward.name} ${reward.text}`;
  const statRewards = [
    { pattern: /Perfected Form/i, amount: 2, rolls: 3 },
    { pattern: /Double Growth/i, amount: 2, rolls: 2 },
    { pattern: /Sudden Growth/i, amount: 2, rolls: 1 },
    { pattern: /Wandering Training/i, amount: 1, rolls: 1 },
  ];
  const match = statRewards.find((statReward) => statReward.pattern.test(text));

  if (!match) return [];

  return Array.from({ length: match.rolls }, () => match.amount);
}

function needsOriginFeatPicker(reward) {
  return /origin spark|random origin feat/i.test(`${reward.name} ${reward.text}`);
}

function generalFeatCountForReward(reward) {
  const text = `${reward.name} ${reward.text}`;
  if (/origin feat/i.test(text)) return 0;

  const match = /gain\s+(\d+)\s+random feats?/i.exec(text);
  return match ? Number(match[1]) : 0;
}

function needsGeneralFeatPicker(reward) {
  return generalFeatCountForReward(reward) > 0;
}

function needsStatPicker(reward) {
  return rewardStatPlan(reward).length > 0;
}

function spellKindForReward(reward) {
  const text = `${reward.name} ${reward.text}`;

  if (/\b(?:gain|add|learn|choose)\b[\s\S]{0,80}\bcantrip\b/i.test(text)) {
    return "cantrips";
  }

  const levelMatch = /\b(?:gain|add|learn|choose|random)\b[\s\S]{0,80}\blevel\s*(\d+)\b[\s\S]{0,40}\bspell\b/i.exec(text);
  if (levelMatch) {
    return `level${levelMatch[1]}`;
  }

  const wordLevelMatch = /\b(?:gain|add|learn|choose|random)\b[\s\S]{0,80}\b(first|second|third|fourth)[-\s]+level(?:\s+\w+){0,4}\s+spell\b/i.exec(text);
  if (wordLevelMatch) {
    const wordLevels = {
      first: 1,
      second: 2,
      third: 3,
      fourth: 4,
    };
    return `level${wordLevels[wordLevelMatch[1].toLowerCase()]}`;
  }

  if (/\b(?:gain|add|learn|choose)\b[\s\S]{0,100}\bspell\b/i.test(text)) {
    return "level1";
  }

  return null;
}

function spellOptionsForReward(reward) {
  const spellKind = spellKindForReward(reward);
  if (!spellKind) return [];

  const spells = spellPools[spellKind] || [];
  const character = loadJson(savedCharacterKey, null);
  const knownSpellKeys = new Set(
    character ? characterSpellEntries(character).map((spell) => spellKey(spell, spell.kind)) : [],
  );
  const classFilteredSpells = spells.filter((spell) =>
    spell.lists?.includes(currentRewardClass),
  );

  return classFilteredSpells.filter((spell) => !knownSpellKeys.has(spellKey(spell, spellKind)));
}

function needsSpellPicker(reward) {
  return spellOptionsForReward(reward).length > 0;
}

function isSpellReward(reward) {
  return Boolean(spellKindForReward(reward));
}

function isCantripReward(reward) {
  return spellKindForReward(reward) === "cantrips";
}

function classCanGainCantripReward(className) {
  return (spellPools.cantrips || []).some((spell) => spell.lists?.includes(className));
}

function rollRarity(rarityTable = rewardRarityTables.normal) {
  const roll = Math.random() * 100;
  let total = 0;

  for (const [rarity, chance] of rarityTable) {
    total += chance;
    if (roll < total) return rarity;
  }

  return rarityTable[rarityTable.length - 1][0];
}

function rewardKey(reward) {
  return [
    reward.className || "shared",
    reward.rarity || "unknown",
    reward.category || "Reward",
    reward.name,
  ].join("::");
}

function rewardRarityStep(reward) {
  const order = ["common", "uncommon", "rare", "veryRare", "legendary"];
  return Math.max(0, order.indexOf(reward?.rarity || "common"));
}

function upgradeName(baseName, reward) {
  const step = rewardRarityStep(reward);
  return step > 0 ? `${baseName} +${step}` : baseName;
}

function spellRewardBaseName(spellKind) {
  if (spellKind === "cantrips") return "Spellcraft";
  const levelMatch = /^level(\d+)$/i.exec(spellKind || "");
  if (levelMatch) return `Spellcraft +${levelMatch[1]}`;
  return spellKind ? "Spellcraft" : "";
}

function rewardBaseName(reward) {
  const text = `${reward?.name || ""} ${reward?.category || ""} ${reward?.text || ""}`;
  const spellKind = spellKindForReward(reward);

  if (spellKind) return spellRewardBaseName(spellKind);
  if (/ability score|stat|growth|training|form/i.test(text)) return "Ability Score Increase";
  if (/origin feat|random origin feat|random feat|feat reward|\bfeat\b/i.test(text)) return "Feat";
  if (/potion/i.test(text)) return "Potion";
  if (/magic item|relic|treasure/i.test(text)) return "Magic Item";
  return reward?.name || "Reward";
}

function rewardDisplayName(reward) {
  if (reward?.magicItemChoice) return magicItemDisplayName(reward.magicItemChoice);
  if (spellKindForReward(reward)) return reward?.displayName || rewardBaseName(reward);
  return reward?.displayName || upgradeName(rewardBaseName(reward), reward);
}

function rewardOfferKey(reward) {
  return spellKindForReward(reward) ? "spell" : rewardBaseName(reward).toLowerCase();
}

function canOfferReward(reward, takenRewardKeys, offeredRewardKeys = new Set()) {
  if (isCantripReward(reward) && !classCanGainCantripReward(currentRewardClass)) {
    return false;
  }

  if (offeredRewardKeys.has(rewardOfferKey(reward))) return false;

  return reward.repeatable || reward.upgradeable || !takenRewardKeys.has(rewardKey(reward));
}

function takenRewardKeys() {
  return new Set(loadJson(rewardHistoryKey, []).map(rewardKey));
}

function floorOneCardsFor(className, rarity) {
  return [
    ...(rewardPools.shared?.floor1?.[rarity] || []).map((card) => ({
      ...card,
      className: "shared",
      rarity,
    })),
    ...(rewardPools.classes?.[className]?.floor1?.[rarity] || []).map((card) => ({
      ...card,
      className,
      rarity,
    })),
  ];
}

function drawFloorOneReward(className, rarity, offeredRewardKeys = new Set()) {
  const historyKeys = takenRewardKeys();
  const cards = floorOneCardsFor(className, rarity).filter((card) =>
    canOfferReward(card, historyKeys, offeredRewardKeys),
  );
  const fallback = ["legendary", "veryRare", "rare", "uncommon", "common"].flatMap((fallbackRarity) =>
    floorOneCardsFor(className, fallbackRarity)
      .filter((card) => canOfferReward(card, historyKeys, offeredRewardKeys))
      .map((card) => ({
        ...card,
        rarity: fallbackRarity,
      })),
  );

  if (cards.length > 0) {
    return {
      ...randomFrom(cards),
      rarity,
    };
  }

  const fallbackReward = randomFrom(fallback);
  if (fallbackReward) {
    return {
      ...fallbackReward,
      rarity,
    };
  }

  return {
    name: "Missing Reward",
    category: "System",
    rarity,
    text: "Add Floor 1 rewards in Rewards/rewards.json.",
  };
}

function isLevelUpStyleReward(reward) {
  return (
    needsOriginFeatPicker(reward) ||
    needsGeneralFeatPicker(reward) ||
    needsStatPicker(reward) ||
    isSpellReward(reward) ||
    /subclass|class feature|level-up|levelup/i.test(
      `${reward.category || ""} ${reward.name || ""} ${reward.text || ""}`,
    )
  );
}

function drawCommonMinorReward(className, offeredRewardKeys = new Set()) {
  const historyKeys = takenRewardKeys();
  const cards = floorOneCardsFor(className, "common").filter(
    (card) => canOfferReward(card, historyKeys, offeredRewardKeys) && !isLevelUpStyleReward(card),
  );
  const reward = randomFrom(cards);

  if (reward) {
    return {
      ...reward,
      rarity: "common",
    };
  }

  const fallbackRewards = [
    {
      name: "Spare Potion",
      category: "Loot",
      text: "Gain 1 healing potion.",
    },
    {
      name: "Coin Purse",
      category: "Treasure",
      text: "Gain a small amount of gold or trade goods.",
    },
  ].map((fallbackReward) => ({
    ...fallbackReward,
    rarity: "common",
    className: "shared",
    repeatable: true,
  }));

  return randomFrom(
    fallbackRewards.filter((fallbackReward) => !offeredRewardKeys.has(rewardOfferKey(fallbackReward))),
  ) || fallbackRewards[0];
}

function createAsiReward() {
  return {
    name: "Ability Score Increase",
    category: "Ability Score",
    rarity: "uncommon",
    text: "Increase one ability score by 1.",
    repeatable: true,
  };
}

function createFeatReward() {
  return {
    name: "Feat Reward",
    category: "General",
    rarity: "uncommon",
    text: "Gain 1 random feat.",
    repeatable: true,
  };
}

function currentClassName() {
  const character = loadJson(savedCharacterKey, null);
  return character?.class?.name || "Barbarian";
}

function rollFloorOneRewards(actionDetails = rewardActionDetails["level-up"]) {
  currentRewardClass = currentClassName();
  const className = currentRewardClass;
  const offeredKeys = new Set();
  const rewards = Array.from({ length: 3 }, () => {
    const reward = drawFloorOneReward(
      className,
      rollRarity(actionDetails.rarityTable),
      offeredKeys,
    );
    offeredKeys.add(rewardOfferKey(reward));
    return reward;
  });

  if (
    actionDetails.minimumRarity === "uncommon" &&
    rewards.every((reward) => reward.rarity === "common")
  ) {
    offeredKeys.delete(rewardOfferKey(rewards[0]));
    rewards[0] = drawFloorOneReward(className, "uncommon", offeredKeys);
    offeredKeys.add(rewardOfferKey(rewards[0]));
  }

  currentRewardOffer = rewards;
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  renderFloorOneRewards(rewards, className, actionDetails.title);
}

function rollCommonMinorRewards() {
  currentRewardClass = currentClassName();
  const className = currentRewardClass;
  const offeredKeys = new Set();
  const rewards = Array.from({ length: 3 }, () => {
    const reward = drawCommonMinorReward(className, offeredKeys);
    offeredKeys.add(rewardOfferKey(reward));
    return reward;
  });

  currentRewardOffer = rewards;
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  renderFloorOneRewards(rewards, className, "Choose your Common Reward");
}

function renderFloorOneRewards(rewards, className, title = "Choose your Levelup Feature") {
  pickerMode = "reward";
  levelUpChoiceTitle.textContent = title;
  setOptionGridCount(floorOneRewards, rewards.length);
  floorOneRewards.replaceChildren(
    ...rewards.map((reward, index) => {
      const displayName = rewardDisplayName(reward);
      const card = document.createElement("button");
      card.className = `choice-card subrace-card levelup-card ${reward.rarity}`;
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${displayName}`);
      card.dataset.index = String(index);
      card.dataset.name = displayName.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";

      const title = document.createElement("span");
      title.textContent = displayName;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list subrace-feature-list levelup-feature-list";

      const effect = document.createElement("li");
      effect.innerHTML = `<span class="feature-label">Effect:</span> ${reward.text}`;

      name.append(title);
      description.append(effect);
      card.append(name, rewardArt(rewardArtPath(reward), displayName), description);
      card.addEventListener("click", () => selectPickerCard(index, card));

      return card;
    }),
  );
}

function renderOriginFeatPicker() {
  pickerMode = "origin-feat";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  levelUpChoiceTitle.textContent = "Choose your Origin Feat";
  const visibleFeats = randomOptions(originFeats, Math.min(3, originFeats.length));
  currentRewardOffer = visibleFeats;
  setOptionGridCount(floorOneRewards, visibleFeats.length);

  floorOneRewards.replaceChildren(
    ...visibleFeats.map((feat, index) => {
      const card = document.createElement("button");
      card.className = "choice-card subrace-card levelup-card uncommon";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${feat.name}`);
      card.dataset.index = String(index);
      card.dataset.name = feat.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = feat.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list subrace-feature-list levelup-feature-list";
      description.append(
        ...feat.features.map((feature) => {
          const item = document.createElement("li");
          const [label, ...textParts] = feature.split(":");
          if (textParts.length > 0) {
            item.innerHTML = `<span class="feature-label">${label}:</span> ${textParts.join(":").trim()}`;
          } else {
            item.textContent = feature;
          }
          return item;
        }),
      );

      name.append(title);
      card.append(name, rewardArt("reward-img/Origin-feat.png", feat.name), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function takenGeneralFeatNames() {
  return new Set(
    loadJson(rewardHistoryKey, []).flatMap((reward) => [
      reward.featChoice?.name,
      ...(reward.featChoices || []).map((feat) => feat.name),
    ]).filter(Boolean),
  );
}

function isRepeatableFeat(feat) {
  return (feat?.features || []).some((feature) => /repeatable/i.test(feature));
}

function renderGeneralFeatPicker() {
  pickerMode = "general-feat";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const nextPick = pendingGeneralFeatChoices.length + 1;
  levelUpChoiceTitle.textContent =
    pendingGeneralFeatTotal > 1
      ? `Choose General Feat ${nextPick} of ${pendingGeneralFeatTotal}`
      : "Choose your General Feat";

  const takenNames = takenGeneralFeatNames();
  const chosenNames = new Set(pendingGeneralFeatChoices.map((feat) => feat.name));
  const availableFeats = generalFeats.filter(
    (feat) => (!takenNames.has(feat.name) || isRepeatableFeat(feat)) && !chosenNames.has(feat.name),
  );
  currentRewardOffer = randomOptions(availableFeats, Math.min(3, availableFeats.length));
  setOptionGridCount(floorOneRewards, currentRewardOffer.length);

  floorOneRewards.replaceChildren(
    ...currentRewardOffer.map((feat, index) => {
      const card = document.createElement("button");
      card.className = "choice-card subrace-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${feat.name}`);
      card.dataset.index = String(index);
      card.dataset.name = feat.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = feat.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list subrace-feature-list levelup-feature-list";
      const prerequisite = document.createElement("li");
      prerequisite.innerHTML = `<span class="feature-label">Prerequisite:</span> ${feat.prerequisite || "None"}`;
      description.append(
        prerequisite,
        ...feat.features.slice(0, 5).map((feature) => {
          const item = document.createElement("li");
          const [label, ...textParts] = feature.split(".");
          if (textParts.length > 0 && label.length < 42) {
            item.innerHTML = `<span class="feature-label">${label}.</span> ${textParts.join(".").trim()}`;
          } else {
            item.textContent = feature;
          }
          return item;
        }),
      );

      name.append(title);
      card.append(name, rewardArt("reward-img/FEAT.png", feat.name), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
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

function magicInitiateSpellOptions(sourceClass, spellKind) {
  const pool = spellKind === "cantrips" ? spellPools.cantrips : spellPools.level1;
  return (pool || []).filter((spell) => spell.lists?.includes(sourceClass));
}

function renderMagicInitiateSourcePicker() {
  pickerMode = "magic-initiate-source";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  pendingMagicInitiate = {
    sourceClass: "",
    cantrips: [],
    spell: null,
  };
  levelUpChoiceTitle.textContent = "Choose Magic Initiate Spell List";
  const sources = ["Cleric", "Druid", "Wizard"].map(createMagicInitiateSourceChoice);
  currentRewardOffer = sources;
  setOptionGridCount(floorOneRewards, sources.length);

  floorOneRewards.replaceChildren(
    ...sources.map((source, index) => {
      const card = document.createElement("button");
      card.className = "choice-card spell-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${source.name}`);
      card.dataset.index = String(index);
      card.dataset.name = source.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = source.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list spell-feature-list levelup-feature-list";
      description.append(
        ...source.features.map((feature) => {
          const item = document.createElement("li");
          const [label, ...textParts] = feature.split(":");
          if (textParts.length > 0) {
            item.innerHTML = `<span class="feature-label">${label}:</span> ${textParts.join(":").trim()}`;
          } else {
            item.textContent = feature;
          }
          return item;
        }),
      );

      name.append(title);
      card.append(name, rewardArt("reward-img/SPELL.png", source.name), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function renderMagicInitiateSpellPicker() {
  pickerMode = "magic-initiate-spell";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const choosingCantrip = pendingMagicInitiate.cantrips.length < 2;
  const spellKind = choosingCantrip ? "cantrips" : "level1";
  const spellKindLabel = choosingCantrip ? "Cantrip" : "Level 1 Spell";
  levelUpChoiceTitle.textContent = choosingCantrip
    ? `Choose Magic Initiate Cantrip ${pendingMagicInitiate.cantrips.length + 1}`
    : "Choose Magic Initiate Spell";

  const chosenCantripKeys = new Set(
    pendingMagicInitiate.cantrips.map((spell) => spellKey(spell, "cantrips")),
  );
  const spells = magicInitiateSpellOptions(
    pendingMagicInitiate.sourceClass,
    spellKind,
  ).filter((spell) => !chosenCantripKeys.has(spellKey(spell, spellKind)));
  currentRewardOffer = randomOptions(spells, Math.min(3, spells.length));
  setOptionGridCount(floorOneRewards, currentRewardOffer.length);

  floorOneRewards.replaceChildren(
    ...currentRewardOffer.map((spell, index) => {
      const card = document.createElement("button");
      card.className = "choice-card spell-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${spell.name}`);
      card.dataset.index = String(index);
      card.dataset.name = spell.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = spell.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list spell-feature-list levelup-feature-list";

      name.append(title);
      appendSpellDetails(description, spell, spellKindLabel);
      card.append(name, spellRewardArt(spell), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function renderStatPicker() {
  pickerMode = "stat";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const amount = pendingStatPlan[pendingStatChanges.length];
  levelUpChoiceTitle.textContent = `Choose your +${amount} Stat`;

  const statOptions = randomOptions(Object.keys(statLabels), 3).map((stat) => ({
    name: statLabels[stat],
    stat,
    amount,
    features: [`Increase ${statLabels[stat]} by ${amount}.`],
  }));
  currentRewardOffer = statOptions;
  setOptionGridCount(floorOneRewards, statOptions.length);

  floorOneRewards.replaceChildren(
    ...statOptions.map((statOption, index) => {
      const card = document.createElement("button");
      card.className = "choice-card spell-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${statOption.name}`);
      card.dataset.index = String(index);
      card.dataset.name = statOption.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = statOption.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list subrace-feature-list levelup-feature-list";
      const effect = document.createElement("li");
      effect.innerHTML = `<span class="feature-label">Effect:</span> +${amount} ${statOption.name}`;

      name.append(title);
      description.append(effect);
      card.append(name, statRewardArt(statOption.stat, statOption.name), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function renderFeatAsiPicker(feat, chosenChanges = []) {
  pickerMode = "feat-asi";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const options = featAsiOptions(feat, chosenChanges);
  const secondSplitChoice = chosenChanges[0]?.mode === "split";
  levelUpChoiceTitle.textContent = secondSplitChoice
    ? `Choose ${feat.name} second +1 Stat`
    : `Choose ${feat.name} Ability Score Increase`;
  currentRewardOffer = options;
  setOptionGridCount(floorOneRewards, options.length);

  if (options.length === 1) {
    resolveFeatAsiChoice(options[0]);
    return;
  }

  floorOneRewards.replaceChildren(
    ...options.map((statOption, index) => {
      const card = document.createElement("button");
      card.className = "choice-card spell-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${statOption.name}`);
      card.dataset.index = String(index);
      card.dataset.name = statOption.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = statOption.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list subrace-feature-list levelup-feature-list";
      description.append(
        ...statOption.features.map((feature) => {
          const item = document.createElement("li");
          item.innerHTML = `<span class="feature-label">Effect:</span> ${feature}`;
          return item;
        }),
      );

      name.append(title);
      card.append(name, statRewardArt(statOption.stat, statOption.name), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function renderDirectAsiPicker() {
  pendingReward = createAsiReward();
  pendingStatPlan = [1];
  pendingStatChanges = [];
  renderStatPicker();
}

function renderDirectGeneralFeatPicker() {
  pendingReward = createFeatReward();
  pendingGeneralFeatChoices = [];
  pendingGeneralFeatTotal = 1;
  pendingGeneralFeatStatChanges = [];
  renderGeneralFeatPicker();
}

function renderSpellPicker() {
  pickerMode = "spell";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const spells = spellOptionsForReward(pendingReward);
  const spellKindLabel =
    pendingSpellKind === "cantrips"
      ? "Cantrip"
      : `Level ${pendingSpellKind.replace("level", "")} Spell`;
  levelUpChoiceTitle.textContent = `Choose your ${spellKindLabel}`;
  currentRewardOffer = randomOptions(spells, Math.min(3, spells.length));
  setOptionGridCount(floorOneRewards, currentRewardOffer.length);

  floorOneRewards.replaceChildren(
    ...currentRewardOffer.map((spell, index) => {
      const card = document.createElement("button");
      card.className = "choice-card subrace-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${spell.name}`);
      card.dataset.index = String(index);
      card.dataset.name = spell.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = spell.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list spell-feature-list levelup-feature-list";

      name.append(title);
      appendSpellDetails(description, spell, spellKindLabel);
      card.append(name, spellRewardArt(spell), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function spellScrollOptions(item) {
  const scrollLevel = spellScrollLevel(item);
  if (!scrollLevel) return [];
  const character = loadJson(savedCharacterKey, null);
  const knownSpellKeys = new Set(
    character ? characterSpellEntries(character).map((spell) => spellKey(spell, spell.kind)) : [],
  );
  return (spellPools[`level${scrollLevel}`] || []).filter(
    (spell) => !knownSpellKeys.has(spellKey(spell, `level${scrollLevel}`)),
  );
}

function renderSpellScrollPicker() {
  pickerMode = "spell-scroll";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const scrollLevel = spellScrollLevel(pendingMagicItemChoice);
  const spells = spellScrollOptions(pendingMagicItemChoice);
  levelUpChoiceTitle.textContent = `Choose Spell Scroll Level ${scrollLevel} Spell`;
  currentRewardOffer = randomOptions(spells, Math.min(3, spells.length));
  setOptionGridCount(floorOneRewards, currentRewardOffer.length);

  floorOneRewards.replaceChildren(
    ...currentRewardOffer.map((spell, index) => {
      const card = document.createElement("button");
      card.className = "choice-card subrace-card levelup-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${spell.name}`);
      card.dataset.index = String(index);
      card.dataset.name = spell.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = spell.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list spell-feature-list levelup-feature-list";

      name.append(title);
      appendSpellDetails(description, spell, `Level ${scrollLevel} Spell`);
      card.append(name, spellRewardArt(spell), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function renderMagicItemPicker() {
  pickerMode = "magic-item";
  selectedRewardIndex = null;
  confirmLevelUpButton.disabled = true;
  const itemRarity = magicItemRarityForReward(pendingReward) || "common";
  const items = magicItemOptionsForReward(pendingReward, currentRewardClass);
  levelUpChoiceTitle.textContent = `Choose your ${rarityLabels[itemRarity] || itemRarity} Magic Item`;
  currentRewardOffer = randomOptions(items, Math.min(3, items.length));
  setOptionGridCount(floorOneRewards, currentRewardOffer.length);

  floorOneRewards.replaceChildren(
    ...currentRewardOffer.map((magicItem, index) => {
      const card = document.createElement("button");
      card.className = `choice-card subrace-card levelup-card ${itemRarity}`;
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${magicItem.name}`);
      card.dataset.index = String(index);
      card.dataset.name = magicItem.name.toLowerCase();

      const name = document.createElement("div");
      name.className = "choice-name";
      const title = document.createElement("span");
      title.textContent = magicItem.name;

      const description = document.createElement("ul");
      description.className = "choice-description feature-list subrace-feature-list levelup-feature-list";

      name.append(title);
      appendMagicItemDetails(description, magicItem);
      card.append(name, rewardArt(magicItemArtPath(magicItem), magicItem.name), description);
      card.addEventListener("click", () => selectPickerCard(index, card));
      return card;
    }),
  );
}

function selectPickerCard(index, card) {
  selectedRewardIndex = index;
  confirmLevelUpButton.disabled = false;
  floorOneRewards.querySelectorAll(".choice-card").forEach((rewardCard) => {
    rewardCard.classList.toggle("is-selected", rewardCard === card);
  });
}

function resetPendingRewardState() {
  pendingReward = null;
  currentRewardGrantsLevel = false;
  currentRewardTypeLabel = "Dungeon Reward";
  pendingOriginFeatChoice = null;
  pendingGeneralFeatChoices = [];
  pendingGeneralFeatTotal = 0;
  pendingGeneralFeatStatChanges = [];
  pendingFeatAsiContext = null;
  pendingStatPlan = [];
  pendingStatChanges = [];
  pendingSpellKind = null;
  pendingMagicInitiate = null;
  pendingMagicItemChoice = null;
}

function finishGeneralFeatChoice() {
  if (pendingGeneralFeatChoices.length < pendingGeneralFeatTotal) {
    renderGeneralFeatPicker();
    return;
  }

  saveResolvedReward(pendingReward, {
    featChoices: pendingGeneralFeatChoices,
    statChanges: [
      ...(pendingReward.statChanges || []),
      ...pendingGeneralFeatStatChanges,
    ],
  });
}

function selectGeneralFeat(feat) {
  pendingGeneralFeatChoices.push(feat);
  const options = featAsiOptions(feat);

  if (options.length > 0) {
    pendingFeatAsiContext = {
      feat,
      changes: [],
    };
    renderFeatAsiPicker(feat);
    return;
  }

  finishGeneralFeatChoice();
}

function resolveFeatAsiChoice(statChoice) {
  const change = {
    stat: statChoice.stat,
    amount: statChoice.amount,
    mode: statChoice.mode,
  };
  pendingFeatAsiContext.changes.push(change);

  if (!statChoice.complete && statChoice.mode === "split") {
    renderFeatAsiPicker(pendingFeatAsiContext.feat, pendingFeatAsiContext.changes);
    return;
  }

  const statChanges = pendingFeatAsiContext.changes.map(({ stat, amount }) => ({
    stat,
    amount,
  }));
  pendingFeatAsiContext.feat.statChanges = statChanges;
  pendingGeneralFeatStatChanges.push(...statChanges);
  pendingFeatAsiContext = null;
  finishGeneralFeatChoice();
}

function openRewardChoice(action = "level-up") {
  resetPendingRewardState();
  currentRewardClass = currentClassName();
  const actionDetails = rewardActionDetails[action];
  currentRewardGrantsLevel = actionDetails?.grantsLevel === true;
  currentRewardTypeLabel = actionDetails?.savedType || "Dungeon Reward";

  if (action === "common") {
    rollCommonMinorRewards();
    rewardContext.textContent = "Common Reward: choose 1 common minor reward.";
  } else if (action === "asi") {
    renderDirectAsiPicker();
    rewardContext.textContent = "ASI Reward: choose one ability score to increase by 1.";
  } else if (action === "feat") {
    renderDirectGeneralFeatPicker();
    rewardContext.textContent = "Feat Reward: choose 1 general feat.";
  } else if (actionDetails) {
    rollFloorOneRewards(actionDetails);
    rewardContext.textContent = actionDetails.context;
  } else {
    rollFloorOneRewards(rewardActionDetails["level-up"]);
    rewardContext.textContent = rewardActionDetails["level-up"].context;
  }

  futureApp.classList.add("is-hidden");
  levelUpChoice.classList.remove("is-hidden");
}

function pendingRewardActionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("reward");
  return ["level-up", "asi"].includes(action) ? action : "";
}

function openPendingDungeonReward() {
  const params = new URLSearchParams(window.location.search);
  const pendingReward = loadJson(pendingDungeonRewardKey, null);
  const action = pendingRewardActionFromUrl() || pendingReward?.action || "";
  if (!action) return;
  pendingDungeonReturnUrl = params.get("return") || pendingReward?.returnUrl || "dungeon-player.html";
  openRewardChoice(action);
  window.history.replaceState({}, document.title, window.location.pathname);
}

function closeLevelUpChoice() {
  levelUpChoice.classList.add("is-hidden");
  futureApp.classList.remove("is-hidden");
}

function confirmLevelUpChoice() {
  if (selectedRewardIndex === null) return;

  if (pickerMode === "reward") {
    const reward = currentRewardOffer[selectedRewardIndex];
    pendingReward = reward;

    if (needsOriginFeatPicker(reward)) {
      renderOriginFeatPicker();
      return;
    }

    if (needsGeneralFeatPicker(reward)) {
      pendingGeneralFeatChoices = [];
      pendingGeneralFeatTotal = generalFeatCountForReward(reward);
      pendingGeneralFeatStatChanges = [];
      renderGeneralFeatPicker();
      return;
    }

    if (needsStatPicker(reward)) {
      pendingStatPlan = rewardStatPlan(reward);
      pendingStatChanges = [];
      renderStatPicker();
      return;
    }

    if (needsSpellPicker(reward)) {
      pendingSpellKind = spellKindForReward(reward);
      renderSpellPicker();
      return;
    }

    if (needsMagicItemPicker(reward, currentRewardClass)) {
      renderMagicItemPicker();
      return;
    }

    if (isSpellReward(reward)) {
      rewardContext.textContent = `${currentRewardClass} has no spells in that spell pool. Pick another Level-Up Reward.`;
      return;
    }

    saveResolvedReward(reward, {});
    return;
  }

  if (pickerMode === "origin-feat") {
    const feat = currentRewardOffer[selectedRewardIndex];
    if (feat.name === "Magic Initiate") {
      pendingOriginFeatChoice = feat;
      renderMagicInitiateSourcePicker();
      return;
    }

    saveResolvedReward(pendingReward, {
      featChoice: feat,
    });
    return;
  }

  if (pickerMode === "general-feat") {
    const feat = currentRewardOffer[selectedRewardIndex];
    selectGeneralFeat(feat);
    return;
  }

  if (pickerMode === "feat-asi") {
    const statChoice = currentRewardOffer[selectedRewardIndex];
    resolveFeatAsiChoice(statChoice);
    return;
  }

  if (pickerMode === "magic-initiate-source") {
    const source = currentRewardOffer[selectedRewardIndex];
    pendingMagicInitiate.sourceClass = source.name;
    renderMagicInitiateSpellPicker();
    return;
  }

  if (pickerMode === "magic-initiate-spell") {
    const spell = currentRewardOffer[selectedRewardIndex];

    if (pendingMagicInitiate.cantrips.length < 2) {
      pendingMagicInitiate.cantrips.push(spell);
      renderMagicInitiateSpellPicker();
      return;
    }

    pendingMagicInitiate.spell = spell;
    saveResolvedReward(pendingReward, {
      featChoice: {
        ...pendingOriginFeatChoice,
        magicInitiate: pendingMagicInitiate,
      },
    });
    return;
  }

  if (pickerMode === "stat") {
    const statChoice = currentRewardOffer[selectedRewardIndex];
    pendingStatChanges.push({
      stat: statChoice.stat,
      amount: statChoice.amount,
    });

    if (pendingStatChanges.length < pendingStatPlan.length) {
      renderStatPicker();
      return;
    }

    saveResolvedReward(pendingReward, {
      statChanges: pendingStatChanges,
    });
    return;
  }

  if (pickerMode === "spell") {
    const spell = currentRewardOffer[selectedRewardIndex];
    saveResolvedReward(pendingReward, {
      spellChoice: {
        name: spell.name,
        kind: pendingSpellKind,
        school: spell.school,
        lists: spell.lists || [],
      },
    });
    return;
  }

  if (pickerMode === "magic-item") {
    const magicItem = currentRewardOffer[selectedRewardIndex];
    if (spellScrollLevel(magicItem)) {
      pendingMagicItemChoice = magicItem;
      renderSpellScrollPicker();
      return;
    }

    saveResolvedReward(pendingReward, {
      magicItemChoice: magicItem,
      rarity: magicItem.rarity || magicItemRarityForReward(pendingReward) || "common",
      category: "Magic Item",
      text: magicItemDescription(magicItem),
    });
    return;
  }

  if (pickerMode === "spell-scroll") {
    const spell = currentRewardOffer[selectedRewardIndex];
    const magicItem = resolveMagicItemChoice(pendingMagicItemChoice, spell);
    saveResolvedReward(pendingReward, {
      magicItemChoice: magicItem,
      rarity: magicItem.rarity || magicItemRarityForReward(pendingReward) || "common",
      category: "Magic Item",
      text: magicItemDescription(magicItem),
    });
  }
}

function saveResolvedReward(reward, overrides) {
  const savedReward = {
    ...reward,
    ...overrides,
    displayName: rewardDisplayName({ ...reward, ...overrides }),
    statChanges: overrides.statChanges || [],
    hpChange: rewardHpChange(reward),
    manaChange: rewardManaChange(reward),
    pool: "Floor 1",
    rewardType: currentRewardTypeLabel,
    characterClass: currentRewardClass,
    grantsLevel: currentRewardGrantsLevel,
    savedAt: new Date().toISOString(),
  };

  saveReward(savedReward);
  closeLevelUpChoice();
  renderSavedRewards();
  renderStatTracker();
  renderSavedCharacter();
  rewardContext.textContent = `${rewardDisplayName(savedReward)} added. Features and Inventory updated.`;
  if (activeDmRewardGrant?.id) {
    const grantId = activeDmRewardGrant.id;
    activeDmRewardGrant = null;
    if (multiplayerSheetSyncTimer) window.clearTimeout(multiplayerSheetSyncTimer);
    multiplayerSheetSyncTimer = null;
    syncMultiplayerSheet()
      .then(() => window.avtizmMultiplayer?.consumeRewardGrant(grantId))
      .then(() => renderDmRewardGrants());
  } else {
    scheduleMultiplayerSheetSync();
  }
  if (pendingDungeonReturnUrl) {
    const returnUrl = pendingDungeonReturnUrl;
    pendingDungeonReturnUrl = "";
    localStorage.removeItem(pendingDungeonRewardKey);
    window.location.href = returnUrl;
  }
}

function featureTextEntries(features, source, omittedLabels = new Set(), options = {}) {
  return (Array.isArray(features) ? features : [features || ""])
    .filter(Boolean)
    .filter((feature) => {
      const label = featureLabel(feature);
      const detail = featureDetailWithoutKnownCantrips(featureDetail(feature));
      if (omittedLabels.has(label)) return false;
      if (!detail) return false;
      if (/choose one|choose .* after selecting/i.test(detail)) return false;
      if (options.omitSourceHeader && label === source && detail === source) return false;
      if (options.omitLineLabels?.has(label)) return false;
      return true;
    })
    .reduce((entries, feature) => {
      const label = featureLabel(feature);
      const detail = featureDetailWithoutKnownCantrips(featureDetail(feature));
      const shouldMerge = entries.length > 0 && (label === "Uses" || (!label && /^You can use/i.test(detail)));

      if (shouldMerge) {
        entries[entries.length - 1].text = `${entries[entries.length - 1].text} ${detail}`;
        return entries;
      }

      entries.push({
        name: label || source,
        source,
        text: detail,
        rarity: "common",
        featureGroup: options.groupBySource ? source : "",
        groupMeta: options.groupMeta || "",
        forceGrouped: options.forceGrouped || false,
      });
      return entries;
    }, []);
}

function isInventoryReward(reward) {
  const text = `${reward?.name || ""} ${reward?.category || ""} ${reward?.text || ""}`;
  return /relic|treasure|magic item|potion|gold|coin|trade goods?|inventory|item/i.test(text);
}

function isSpellOnlyReward(reward) {
  return Boolean(reward?.spellChoice || spellKindForReward(reward) || reward?.category === "Spell");
}

function rewardFeatureEntries(reward) {
  const entries = [];
  const rewardSource = rewardDisplayName(reward);
  const rewardFeatEntries = (feat) =>
    featureTextEntries(feat.features, feat.name, new Set(), {
      groupBySource: true,
      groupMeta: rewardSource,
      forceGrouped: true,
    }).map((entry) => ({
      ...entry,
      rarity: reward.rarity,
    }));

  if (reward.featChoice) {
    entries.push(...rewardFeatEntries(reward.featChoice));
  }

  (reward.featChoices || []).forEach((feat) => {
    entries.push(...rewardFeatEntries(feat));
  });

  if (entries.length === 0 && !isInventoryReward(reward) && !isSpellOnlyReward(reward)) {
    entries.push({
      name: rewardSource,
      source: reward.rewardType || reward.pool || "Reward",
      text: reward.text,
      rarity: reward.rarity,
      rewardGroup: rewardSource,
    });
  }

  return entries;
}

function characterFeatureEntries(character) {
  if (!character) return [];

  const entries = [
    ...featureTextEntries(
      character.race?.features,
      choiceName(character.race),
      new Set(["Creature Type", "Size", "Speed", "Darkvision"]),
      {
        groupBySource: true,
        groupMeta: "Race",
        forceGrouped: true,
      },
    ),
    ...featureTextEntries(character.subrace?.features, choiceName(character.subrace), new Set(), {
      groupBySource: true,
      groupMeta: "Lineage",
      forceGrouped: true,
    }),
    ...featureTextEntries(
      character.class?.features,
      choiceName(character.class),
      new Set(["Stats", "Saves", "HP", "Armor", "Weapons", "Spellcasting"]),
      {
        groupBySource: true,
        groupMeta: "Class",
        forceGrouped: true,
      },
    ),
    ...featureTextEntries(
      character.classOption?.features,
      choiceName(character.classOption),
      new Set(["Divine Order", "Primal Order"]),
      {
        omitSourceHeader: true,
        groupBySource: true,
        groupMeta: "Class Feature",
        forceGrouped: true,
      },
    ),
    ...featureTextEntries(character.originFeat?.features, choiceName(character.originFeat), new Set(), {
      groupBySource: true,
      groupMeta: "Feat",
      forceGrouped: true,
    }),
    ...featureTextEntries(character.humanFeat?.features, choiceName(character.humanFeat), new Set(), {
      groupBySource: true,
      groupMeta: "Feat",
      forceGrouped: true,
    }),
  ];

  return entries;
}

function renderFeatureEntry(entry) {
  const item = document.createElement("section");
  item.className = `reward-item feature-item ${entry.rarity || "common"}`;

  const title = document.createElement("h3");
  title.textContent = entry.name;

  const meta = document.createElement("p");
  meta.className = "reward-meta";
  meta.textContent = entry.source;

  const text = document.createElement("p");
  text.textContent = entry.text || "Feature gained.";

  item.append(title, meta, text);
  return item;
}

function renderGroupedRewardFeatures(entries) {
  if (entries.length === 1 && !entries[0].forceGrouped) return renderFeatureEntry(entries[0]);

  const item = document.createElement("section");
  item.className = `reward-item feature-item grouped-feature-item ${entries[0].rarity || "common"}`;

  const title = document.createElement("h3");
  title.textContent = entries[0].rewardGroup || entries[0].featureGroup || entries[0].source;

  const list = document.createElement("div");
  list.className = "grouped-feature-list";
  list.append(
    ...entries.map((entry) => {
      const feature = document.createElement("section");
      feature.className = "grouped-feature";

      const name = document.createElement("strong");
      name.textContent = entry.name;

      const text = document.createElement("p");
      text.textContent = entry.text || "Feature gained.";

      feature.append(name, text);
      return feature;
    }),
  );

  item.append(title, list);
  return item;
}

function groupedFeatureCards(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const key = entry.rewardGroup || entry.featureGroup || `${entry.source}::${entry.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  return [...groups.values()].map(renderGroupedRewardFeatures);
}

function renderInventoryEntry(reward) {
  const item = document.createElement("section");
  item.className = `reward-item inventory-item ${reward.rarity || "common"}`;
  const magicItem = reward.magicItemChoice;

  const title = document.createElement("h3");
  title.textContent = rewardDisplayName(reward);

  const meta = document.createElement("p");
  meta.className = "reward-meta";
  meta.textContent = magicItem
    ? [rarityLabels[magicItem.rarity] || magicItem.rarity, magicItemMeta(magicItem)].filter(Boolean).join(" - ")
    : [rarityLabels[reward.rarity] || reward.rarity, reward.category]
    .filter(Boolean)
    .join(" - ");

  const text = document.createElement("p");
  text.textContent = magicItem ? magicItemDescription(magicItem) : reward.text;

  item.append(title, meta, text);
  return item;
}

function renderCharacterInventoryEntry(entry) {
  const item = document.createElement("section");
  item.className = "reward-item inventory-item common";

  const title = document.createElement("h3");
  title.textContent = `${entry.name}${entry.quantity ? ` x${entry.quantity}` : ""}`;

  const meta = document.createElement("p");
  meta.className = "reward-meta";
  meta.textContent = entry.source || "Inventory";

  const text = document.createElement("p");
  text.textContent = entry.text || "Inventory item.";

  item.append(title, meta, text);
  return item;
}

function renderSavedRewards() {
  const rewards = loadJson(rewardHistoryKey, []);
  const character = getCharacterWithStats();
  const baseFeatureEntries = characterFeatureEntries(character);
  const rewardFeatureEntryGroups = rewards.map(rewardFeatureEntries).filter((entries) => entries.length > 0);
  const hasFeatures = baseFeatureEntries.length > 0 || rewardFeatureEntryGroups.length > 0;
  const characterInventory = Array.isArray(character?.inventory) ? character.inventory : [];
  const inventoryRewards = rewards.filter(isInventoryReward);

  if (!hasFeatures) {
    savedRewards.textContent = "No features yet.";
  } else {
    savedRewards.replaceChildren(
      ...groupedFeatureCards(baseFeatureEntries),
      ...rewardFeatureEntryGroups.flatMap(groupedFeatureCards),
    );
  }

  if (!inventoryList) return;

  if (characterInventory.length === 0 && inventoryRewards.length === 0) {
    inventoryList.textContent = "No inventory items yet.";
    return;
  }

  inventoryList.replaceChildren(
    ...characterInventory.map(renderCharacterInventoryEntry),
    ...inventoryRewards.map(renderInventoryEntry),
  );
}

async function loadRewardPools() {
  const response = await fetch("Rewards/rewards.json", { cache: "no-store" });
  rewardPools = await response.json();
}

async function loadOriginFeats() {
  const response = await fetch("Feats/origin-feats.json", { cache: "no-store" });
  const featMap = await response.json();
  originFeats = Object.entries(featMap).map(([name, features]) => ({
    name,
    features,
  }));
}

async function loadGeneralFeats() {
  const response = await fetch("Feats/general-feats.json", { cache: "no-store" });
  generalFeats = await response.json();
}

async function loadSpellPools() {
  const response = await fetch("Spells/spells.json", { cache: "no-store" });
  spellPools = await response.json();
}

async function loadMagicItemPools() {
  const response = await fetch("MagicItems/magic-items.json", { cache: "no-store" });
  magicItemPools = await response.json();
}

rewardActionButtons.forEach((button) => {
  button.disabled = true;
  button.addEventListener("click", () => openRewardChoice(button.dataset.rewardAction));
});
confirmLevelUpButton.addEventListener("click", confirmLevelUpChoice);

renderSavedCharacter();
renderStatTracker();
renderSavedRewards();
renderDmRewardGrants();
["ready", "connected"].forEach((eventName) => {
  window.addEventListener(`avtizm-multiplayer:${eventName}`, () => {
    renderSavedCharacter();
    renderStatTracker();
    renderSavedRewards();
    renderDmRewardGrants();
    scheduleMultiplayerSheetSync();
  });
});
window.addEventListener("avtizm-multiplayer:members-changed", () => {
  renderSavedCharacter();
  renderStatTracker();
  renderSavedRewards();
  renderDmRewardGrants();
});
window.addEventListener("avtizm-multiplayer:disconnected", renderDmRewardGrants);
window.avtizmMultiplayer?.ready.then(() => {
  renderDmRewardGrants();
  scheduleMultiplayerSheetSync();
});
Promise.all([loadRewardPools(), loadOriginFeats(), loadGeneralFeats(), loadSpellPools(), loadMagicItemPools()])
  .then(() => {
    rewardActionButtons.forEach((button) => {
      button.disabled = false;
    });
    renderSavedCharacter();
    renderSavedRewards();
    openPendingDungeonReward();
  })
  .catch((error) => {
  console.error(error);
  rewardContext.textContent = "Could not load reward data.";
  });
