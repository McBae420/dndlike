const rarityTables = {
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

const floorOrder = ["floor1", "floor2", "floor3", "final"];
const floorNames = {
  floor1: "Floor 1",
  floor2: "Floor 2",
  floor3: "Floor 3",
  final: "Final",
};

let rewardPools = {};
let spellPools = {};
let magicItemPools = {};
let originFeats = [];
let generalFeats = [];
let pendingOriginReward = null;
let pendingOriginFeat = null;
let pendingMagicInitiate = null;
let pendingMagicItemReward = null;
let pendingMagicItemChoice = null;
let pendingGeneralReward = null;
let pendingGeneralFeatChoices = [];
let pendingGeneralFeatTotal = 0;
let pendingGeneralFeatStatChanges = [];
let pendingFeatAsiContext = null;
const savedCharacterKey = "avtizm4.character";
const rewardHistoryKey = "avtizm4.rewards";
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

const floorSelect = document.querySelector("#floor-select");
const rewardTypeSelect = document.querySelector("#reward-type-select");
const classSelect = document.querySelector("#class-select");
const viewSelect = document.querySelector("#view-select");
const classOnlyToggle = document.querySelector("#class-only-toggle");
const rollButton = document.querySelector("#roll-rewards");
const rewardOptions = document.querySelector("#reward-options");
const rewardHistory = document.querySelector("#reward-history");
const clearHistoryButton = document.querySelector("#clear-history");

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
  imageWrap.className = "reward-image";
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

function magicItemDisplayName(item) {
  return item?.spellScrollSpell ? `${item.name}: ${item.spellScrollSpell.name}` : item?.name || "Magic Item";
}

function rewardDisplayName(reward) {
  if (reward?.magicItemChoice) return magicItemDisplayName(reward.magicItemChoice);
  if (spellKindForReward(reward)) return reward?.displayName || rewardBaseName(reward);
  return reward?.displayName || upgradeName(rewardBaseName(reward), reward);
}

function rewardOfferKey(reward) {
  return spellKindForReward(reward) ? "spell" : rewardBaseName(reward).toLowerCase();
}

function spellDetailEntries(spell) {
  const details = [
    ["Casting", spell?.castingTime],
    ["Range", spell?.range],
    ["Components", spell?.components],
    ["Duration", spell?.duration],
  ];

  return details.filter(([, value]) => Boolean(value));
}

function createSpellDetailsBlock(spell) {
  const details = spellDetailEntries(spell);
  if (details.length === 0) return null;

  const block = document.createElement("div");
  block.className = "spell-details";

  details.forEach(([label, value]) => {
    const line = document.createElement("p");
    line.className = "spell-detail";
    line.textContent = `${label}: ${value}`;
    block.append(line);
  });

  return block;
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

function spellScrollOptions(item) {
  const scrollLevel = spellScrollLevel(item);
  if (!scrollLevel) return [];
  const knownKeys = knownSpellKeys();
  return (spellPools[`level${scrollLevel}`] || []).filter(
    (spell) => !knownKeys.has(spellKey(spell, `level${scrollLevel}`)),
  );
}

function renderRewardMagicItemPicker(reward, className) {
  const itemRarity = magicItemRarityForReward(reward) || "common";
  const visibleItems = randomOptions(magicItemOptionsForReward(reward, className), 3);
  setOptionGridCount(rewardOptions, visibleItems.length);

  rewardOptions.replaceChildren(
    ...visibleItems.map((magicItem) => {
      const card = document.createElement("button");
      card.className = `reward-card ${itemRarity}`;
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${magicItem.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = magicItem.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = rarityLabels[itemRarity] || itemRarity;

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = magicItemMeta(magicItem);

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = magicItemDescription(magicItem);

      header.append(title, rarity);
      card.append(header, rewardArt(magicItemArtPath(magicItem), magicItem.name), category, text);
      card.addEventListener("click", () => {
        if (spellScrollLevel(magicItem)) {
          pendingMagicItemReward = reward;
          pendingMagicItemChoice = magicItem;
          renderRewardSpellScrollPicker(reward, magicItem);
          return;
        }

        const chosenItem = resolveMagicItemChoice(magicItem);
        saveReward({
          ...reward,
          magicItemChoice: chosenItem,
          displayName: magicItemDisplayName(chosenItem),
          rarity: chosenItem.rarity || itemRarity,
          category: "Magic Item",
          text: magicItemDescription(chosenItem),
        });
        updateRewardsView();
      });

      return card;
    }),
  );
}

function renderRewardSpellScrollPicker(reward, magicItem) {
  const scrollLevel = spellScrollLevel(magicItem);
  const spells = spellScrollOptions(magicItem);
  const visibleSpells = randomOptions(spells, Math.min(3, spells.length));
  setOptionGridCount(rewardOptions, visibleSpells.length);

  rewardOptions.replaceChildren(
    ...visibleSpells.map((spell) => {
      const card = document.createElement("button");
      card.className = "reward-card rare spell-reward-card";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${spell.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = spell.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = `Scroll Spell ${scrollLevel}`;

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = spell.school;

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = spell.description || (spell.lists || []).join(", ");

      header.append(title, rarity);
      card.append(header, spellRewardArt(spell), category, text);
      card.addEventListener("click", () => {
        const chosenItem = resolveMagicItemChoice(magicItem, spell);
        saveReward({
          ...reward,
          magicItemChoice: chosenItem,
          displayName: magicItemDisplayName(chosenItem),
          rarity: chosenItem.rarity || magicItemRarityForReward(reward) || "common",
          category: "Magic Item",
          text: magicItemDescription(chosenItem),
        });
        pendingMagicItemReward = null;
        pendingMagicItemChoice = null;
        updateRewardsView();
      });

      return card;
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

function loadSavedCharacter() {
  try {
    return JSON.parse(localStorage.getItem(savedCharacterKey));
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function saveCharacter(character) {
  if (character) {
    localStorage.setItem(savedCharacterKey, JSON.stringify(character));
  }
}

function rollRarity(table) {
  const roll = Math.random() * 100;
  let total = 0;

  for (const [rarity, chance] of table) {
    total += chance;
    if (roll < total) return rarity;
  }

  return table[table.length - 1][0];
}

function rewardPoolFor(floor, rewardType) {
  if (rewardType !== "boss") return floor;

  const nextFloorIndex = Math.min(floorOrder.indexOf(floor) + 1, floorOrder.length - 1);
  return floorOrder[nextFloorIndex];
}

function getCardsForRarity(poolKey, rarity) {
  return rewardPools.shared?.[poolKey]?.[rarity] || [];
}

function getClassCardsForRarity(className, poolKey, rarity) {
  return rewardPools.classes?.[className]?.[poolKey]?.[rarity] || [];
}

function getRewardCards(poolKey, rarity, className, includeShared) {
  const sharedCards = includeShared ? getCardsForRarity(poolKey, rarity) : [];
  const classCards = getClassCardsForRarity(className, poolKey, rarity);
  return [...sharedCards, ...classCards].filter((card) =>
    canOfferRewardToClass(card, className),
  );
}

function isCantripReward(reward) {
  return spellKindForReward(reward) === "cantrips";
}

function classCanGainCantripReward(className) {
  return (spellPools.cantrips || []).some((spell) => spell.lists?.includes(className));
}

function canOfferRewardToClass(reward, className) {
  return !isCantripReward(reward) || classCanGainCantripReward(className);
}

function drawReward(poolKey, rarity, className, includeShared, offeredRewardKeys = new Set()) {
  const cards = getRewardCards(poolKey, rarity, className, includeShared).filter(
    (card) =>
      canOfferRewardToClass(card, className) &&
      !offeredRewardKeys.has(rewardOfferKey({ ...card, rarity })),
  );
  const fallbackRarities = ["legendary", "veryRare", "rare", "uncommon", "common"];
  const fallback = fallbackRarities.flatMap((fallbackRarity) => [
    ...(includeShared
      ? getCardsForRarity(poolKey, fallbackRarity).map((card) => ({
          ...card,
          rarity: fallbackRarity,
        }))
      : []),
    ...getClassCardsForRarity(className, poolKey, fallbackRarity).map((card) => ({
      ...card,
      rarity: fallbackRarity,
    })),
  ]).filter(
    (card) =>
      canOfferRewardToClass(card, className) &&
      !offeredRewardKeys.has(rewardOfferKey(card)),
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
    text: "Add cards for this pool and rarity in Rewards/rewards.json.",
  };
}

function currentPoolContext() {
  const selectedFloor = floorSelect.value;
  const rewardType = rewardTypeSelect.value;
  const className = classSelect.value;
  const poolKey = rewardType === "finalBoss" ? "final" : rewardPoolFor(selectedFloor, rewardType);
  const includeShared = !classOnlyToggle.checked;

  return {
    className,
    includeShared,
    poolKey,
    rewardType,
  };
}

function updateRewardsView() {
  rollButton.textContent = viewSelect.value === "all" ? "Refresh List" : "Roll Rewards";

  if (viewSelect.value === "all") {
    renderAllRewards();
  } else {
    rollRewardOffer();
  }
}

function rollRewardOffer() {
  const { className, poolKey, rewardType, includeShared } = currentPoolContext();
  const table = rarityTables[rewardType];
  const offeredKeys = new Set();

  const rewards = Array.from({ length: 3 }, () => {
    const rarity = rollRarity(table);
    const reward = drawReward(poolKey, rarity, className, includeShared, offeredKeys);
    offeredKeys.add(rewardOfferKey(reward));
    return reward;
  });

  if (rewards.every((reward) => reward.rarity === "common")) {
    offeredKeys.delete(rewardOfferKey(rewards[0]));
    rewards[0] = drawReward(poolKey, "uncommon", className, includeShared, offeredKeys);
    offeredKeys.add(rewardOfferKey(rewards[0]));
  }

  renderRewards(rewards, poolKey, rewardType, className, includeShared);
}

function renderAllRewards() {
  const { className, poolKey, rewardType, includeShared } = currentPoolContext();
  const rarityOrder = ["common", "uncommon", "rare", "veryRare", "legendary"];
  const rewards = rarityOrder.flatMap((rarity) =>
    getRewardCards(poolKey, rarity, className, includeShared).map((card) => ({
      ...card,
      rarity,
    })),
  );

  renderRewards(rewards, poolKey, rewardType, className, includeShared);
}

function renderRewards(rewards, poolKey, rewardType, className, includeShared) {
  setOptionGridCount(rewardOptions, rewards.length);
  rewardOptions.replaceChildren(
    ...rewards.map((reward) => {
      const displayName = rewardDisplayName(reward);
      const card = document.createElement("button");
      card.className = `reward-card ${reward.rarity}`;
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${displayName}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = displayName;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = rarityLabels[reward.rarity] || reward.rarity;

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = reward.category;

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = reward.text;

      const pool = document.createElement("p");
      pool.className = "pool-note";
      pool.textContent = `${floorNames[poolKey]} pool - ${className} class pool${includeShared ? " + shared pool" : " only"} - ${rewardTypeLabel(rewardType)}`;

      header.append(title, rarity);
      card.append(header, rewardArt(rewardArtPath(reward), displayName), category, text, pool);
      card.addEventListener("click", () => {
        const savedReward = {
          ...reward,
          displayName,
          statChanges: rewardStatChanges(reward),
          hpChange: rewardHpChange(reward),
          pool: floorNames[poolKey],
          rewardType: rewardTypeLabel(rewardType),
          className,
          grantsLevel: false,
          savedAt: new Date().toISOString(),
        };

        if (needsSpellPicker(savedReward, className)) {
          renderRewardSpellPicker(savedReward, className);
          return;
        }

        if (needsMagicItemPicker(savedReward, className)) {
          renderRewardMagicItemPicker(savedReward, className);
          return;
        }

        if (needsOriginFeatPicker(savedReward)) {
          renderRewardOriginFeatPicker(savedReward);
          return;
        }

        if (needsGeneralFeatPicker(savedReward)) {
          renderRewardGeneralFeatPicker(savedReward);
          return;
        }

        saveReward(savedReward);
        updateRewardsView();
      });
      return card;
    }),
  );
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

function renderRewardOriginFeatPicker(reward) {
  pendingOriginReward = reward;
  pendingOriginFeat = null;
  pendingMagicInitiate = null;
  const visibleFeats = randomOptions(originFeats, Math.min(3, originFeats.length));
  setOptionGridCount(rewardOptions, visibleFeats.length);

  rewardOptions.replaceChildren(
    ...visibleFeats.map((feat) => {
      const card = document.createElement("button");
      card.className = "reward-card uncommon";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${feat.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = feat.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = "Origin Feat";

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = reward.name;

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = feat.features.join(" ");

      header.append(title, rarity);
      card.append(header, rewardArt("reward-img/Origin-feat.png", feat.name), category, text);
      card.addEventListener("click", () => {
        if (feat.name === "Magic Initiate") {
          pendingOriginFeat = feat;
          renderMagicInitiateSourcePicker();
          return;
        }

        saveReward({
          ...pendingOriginReward,
          featChoice: feat,
        });
        updateRewardsView();
      });

      return card;
    }),
  );
}

function takenGeneralFeatNames() {
  return new Set(
    loadRewardHistory().flatMap((reward) => [
      reward.featChoice?.name,
      ...(reward.featChoices || []).map((feat) => feat.name),
    ]).filter(Boolean),
  );
}

function isRepeatableFeat(feat) {
  return (feat?.features || []).some((feature) => /repeatable/i.test(feature));
}

function renderRewardGeneralFeatPicker(reward) {
  if (pendingGeneralReward !== reward) {
    pendingGeneralReward = reward;
    pendingGeneralFeatChoices = [];
    pendingGeneralFeatTotal = generalFeatCountForReward(reward);
    pendingGeneralFeatStatChanges = [];
    pendingFeatAsiContext = null;
  }

  const takenNames = takenGeneralFeatNames();
  const chosenNames = new Set(pendingGeneralFeatChoices.map((feat) => feat.name));
  const availableFeats = generalFeats.filter(
    (feat) => (!takenNames.has(feat.name) || isRepeatableFeat(feat)) && !chosenNames.has(feat.name),
  );
  const visibleFeats = randomOptions(availableFeats, Math.min(3, availableFeats.length));
  setOptionGridCount(rewardOptions, visibleFeats.length);

  rewardOptions.replaceChildren(
    ...visibleFeats.map((feat) => {
      const card = document.createElement("button");
      card.className = "reward-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${feat.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = feat.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent =
        pendingGeneralFeatTotal > 1
          ? `Feat ${pendingGeneralFeatChoices.length + 1}/${pendingGeneralFeatTotal}`
          : "Feat";

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = feat.prerequisite || "No prerequisite";

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = feat.features.slice(0, 4).join(" ");

      header.append(title, rarity);
      card.append(header, rewardArt("reward-img/FEAT.png", feat.name), category, text);
      card.addEventListener("click", () => {
        selectRewardGeneralFeat(feat);
      });

      return card;
    }),
  );
}

function finishRewardGeneralFeatChoice() {
  if (pendingGeneralFeatChoices.length < pendingGeneralFeatTotal) {
    renderRewardGeneralFeatPicker(pendingGeneralReward);
    return;
  }

  saveReward({
    ...pendingGeneralReward,
    featChoices: pendingGeneralFeatChoices,
    statChanges: [
      ...(pendingGeneralReward.statChanges || []),
      ...pendingGeneralFeatStatChanges,
    ],
  });
  pendingGeneralReward = null;
  pendingGeneralFeatChoices = [];
  pendingGeneralFeatTotal = 0;
  pendingGeneralFeatStatChanges = [];
  pendingFeatAsiContext = null;
  updateRewardsView();
}

function selectRewardGeneralFeat(feat) {
  pendingGeneralFeatChoices.push(feat);
  const options = featAsiOptions(feat);

  if (options.length > 0) {
    pendingFeatAsiContext = {
      feat,
      changes: [],
    };
    renderRewardFeatAsiPicker(feat);
    return;
  }

  finishRewardGeneralFeatChoice();
}

function renderRewardFeatAsiPicker(feat, chosenChanges = []) {
  const options = featAsiOptions(feat, chosenChanges);
  const secondSplitChoice = chosenChanges[0]?.mode === "split";
  setOptionGridCount(rewardOptions, options.length);

  if (options.length === 1) {
    resolveRewardFeatAsiChoice(options[0]);
    return;
  }

  rewardOptions.replaceChildren(
    ...options.map((statOption) => {
      const card = document.createElement("button");
      card.className = "reward-card rare";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${statOption.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = statOption.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = secondSplitChoice ? "Second +1" : "ASI";

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = feat.name;

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = statOption.features.join(" ");

      header.append(title, rarity);
      card.append(header, statRewardArt(statOption.stat, statOption.name), category, text);
      card.addEventListener("click", () => {
        resolveRewardFeatAsiChoice(statOption);
      });

      return card;
    }),
  );
}

function resolveRewardFeatAsiChoice(statOption) {
  const change = {
    stat: statOption.stat,
    amount: statOption.amount,
    mode: statOption.mode,
  };
  pendingFeatAsiContext.changes.push(change);

  if (!statOption.complete && statOption.mode === "split") {
    renderRewardFeatAsiPicker(pendingFeatAsiContext.feat, pendingFeatAsiContext.changes);
    return;
  }

  const statChanges = pendingFeatAsiContext.changes.map(({ stat, amount }) => ({
    stat,
    amount,
  }));
  pendingFeatAsiContext.feat.statChanges = statChanges;
  pendingGeneralFeatStatChanges.push(...statChanges);
  pendingFeatAsiContext = null;
  finishRewardGeneralFeatChoice();
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
  pendingMagicInitiate = {
    sourceClass: "",
    cantrips: [],
    spell: null,
  };
  const sources = ["Cleric", "Druid", "Wizard"].map(createMagicInitiateSourceChoice);
  setOptionGridCount(rewardOptions, sources.length);

  rewardOptions.replaceChildren(
    ...sources.map((source) => {
      const card = document.createElement("button");
      card.className = "reward-card rare spell-reward-card";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${source.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = source.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = "Spell List";

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = "Magic Initiate";

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = source.features.join(" ");

      header.append(title, rarity);
      card.append(header, rewardArt("reward-img/SPELL.png", source.name), category, text);
      card.addEventListener("click", () => {
        pendingMagicInitiate.sourceClass = source.name;
        renderMagicInitiateSpellPicker();
      });

      return card;
    }),
  );
}

function renderMagicInitiateSpellPicker() {
  const choosingCantrip = pendingMagicInitiate.cantrips.length < 2;
  const spellKind = choosingCantrip ? "cantrips" : "level1";
  const spellKindLabel = choosingCantrip ? "Cantrip" : "Level 1 Spell";
  const chosenCantripKeys = new Set(
    pendingMagicInitiate.cantrips.map((spell) => spellKey(spell, "cantrips")),
  );
  const spells = magicInitiateSpellOptions(
    pendingMagicInitiate.sourceClass,
    spellKind,
  ).filter((spell) => !chosenCantripKeys.has(spellKey(spell, spellKind)));
  const visibleSpells = randomOptions(spells, Math.min(3, spells.length));
  setOptionGridCount(rewardOptions, visibleSpells.length);

  rewardOptions.replaceChildren(
    ...visibleSpells.map((spell) => {
      const card = document.createElement("button");
      card.className = "reward-card rare spell-reward-card";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${spell.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = spell.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = choosingCantrip
        ? `Cantrip ${pendingMagicInitiate.cantrips.length + 1}`
        : spellKindLabel;

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = spell.school;

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = (spell.lists || []).join(", ");

      const detailsBlock = choosingCantrip ? createSpellDetailsBlock(spell) : null;

      header.append(title, rarity);
      card.append(header, spellRewardArt(spell), category, text);
      if (detailsBlock) card.append(detailsBlock);
      card.addEventListener("click", () => {
        if (pendingMagicInitiate.cantrips.length < 2) {
          pendingMagicInitiate.cantrips.push(spell);
          renderMagicInitiateSpellPicker();
          return;
        }

        pendingMagicInitiate.spell = spell;
        saveReward({
          ...pendingOriginReward,
          featChoice: {
            ...pendingOriginFeat,
            magicInitiate: pendingMagicInitiate,
          },
        });
        updateRewardsView();
      });

      return card;
    }),
  );
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

function knownSpellKeys() {
  const character = loadSavedCharacter();
  const rewards = loadRewardHistory();
  const keys = new Set();

  (character?.startingSpells || [character?.startingSpell].filter(Boolean)).forEach((spell) =>
    keys.add(spellKey(spell, spell?.level)),
  );

  [character?.originFeat, character?.humanFeat].forEach((feat) => {
    const magicInitiate = feat?.magicInitiate;
    magicInitiate?.cantrips?.forEach((spell) => keys.add(spellKey(spell, "cantrips")));
    if (magicInitiate?.spell) keys.add(spellKey(magicInitiate.spell, "level1"));
  });

  rewards.forEach((reward) => {
    if (reward.spellChoice) {
      keys.add(spellKey(reward.spellChoice, reward.spellChoice.kind));
    }
    if (reward.magicItemChoice?.spellScrollSpell) {
      keys.add(spellKey(
        reward.magicItemChoice.spellScrollSpell,
        `level${reward.magicItemChoice.spellScrollLevel || 1}`,
      ));
    }

    const magicInitiate = reward.featChoice?.magicInitiate;
    magicInitiate?.cantrips?.forEach((spell) => keys.add(spellKey(spell, "cantrips")));
    if (magicInitiate?.spell) keys.add(spellKey(magicInitiate.spell, "level1"));
  });

  return keys;
}

function spellOptionsForReward(reward, className) {
  const spellKind = spellKindForReward(reward);
  if (!spellKind) return [];

  const spells = spellPools[spellKind] || [];
  const knownKeys = knownSpellKeys();
  const classFilteredSpells = spells.filter((spell) => spell.lists?.includes(className));
  const availableClassSpells = classFilteredSpells.filter(
    (spell) => !knownKeys.has(spellKey(spell, spellKind)),
  );
  const availableSpells = spells.filter((spell) => !knownKeys.has(spellKey(spell, spellKind)));

  return availableClassSpells.length > 0 ? availableClassSpells : availableSpells;
}

function needsSpellPicker(reward, className) {
  return spellOptionsForReward(reward, className).length > 0;
}

function renderRewardSpellPicker(reward, className) {
  const spellKind = spellKindForReward(reward);
  const spellKindLabel =
    spellKind === "cantrips" ? "Cantrip" : `Level ${spellKind.replace("level", "")} Spell`;
  const spells = spellOptionsForReward(reward, className);
  const visibleSpells = randomOptions(spells, Math.min(3, spells.length));
  setOptionGridCount(rewardOptions, visibleSpells.length);

  rewardOptions.replaceChildren(
    ...visibleSpells.map((spell) => {
      const card = document.createElement("button");
      card.className = "reward-card rare spell-reward-card";
      card.type = "button";
      card.setAttribute("aria-label", `Choose ${spell.name}`);

      const header = document.createElement("div");
      header.className = "reward-card-header";

      const title = document.createElement("h2");
      title.textContent = spell.name;

      const rarity = document.createElement("span");
      rarity.className = "rarity";
      rarity.textContent = spellKindLabel;

      const category = document.createElement("p");
      category.className = "category";
      category.textContent = spell.school;

      const text = document.createElement("p");
      text.className = "reward-text";
      text.textContent = (spell.lists || []).join(", ");

      const detailsBlock = spellKind === "cantrips" ? createSpellDetailsBlock(spell) : null;

      const pool = document.createElement("p");
      pool.className = "pool-note";
      pool.textContent = `${reward.name} - ${className} spell choice`;

      header.append(title, rarity);
      card.append(header, spellRewardArt(spell), category, text);
      if (detailsBlock) card.append(detailsBlock);
      card.append(pool);
      card.addEventListener("click", () => {
        saveReward({
          ...reward,
          spellChoice: {
            name: spell.name,
            kind: spellKind,
            school: spell.school,
            lists: spell.lists || [],
            castingTime: spell.castingTime || "",
            range: spell.range || "",
            components: spell.components || "",
            duration: spell.duration || "",
          },
        });
        updateRewardsView();
      });

      return card;
    }),
  );
}

function rewardStatChanges(reward) {
  const text = `${reward.name} ${reward.text}`;
  const statRewards = [
    { pattern: /Perfected Form/i, amount: 2, rolls: 3 },
    { pattern: /Double Growth/i, amount: 2, rolls: 2 },
    { pattern: /Sudden Growth/i, amount: 2, rolls: 1 },
    { pattern: /Wandering Training/i, amount: 1, rolls: 1 },
  ];
  const match = statRewards.find((statReward) => statReward.pattern.test(text));

  if (!match) return [];

  return Array.from({ length: match.rolls }, () => ({
    stat: randomFrom(Object.keys(statLabels)),
    amount: match.amount,
  }));
}

function applyStatChanges(stats, changes) {
  (changes || []).forEach((change) => {
    if (stats[change.stat] !== undefined) {
      stats[change.stat] += change.amount;
    }
  });
}

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function hasToughFeat(character) {
  const rewards = loadRewardHistory();
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
  const hpLine = (Array.isArray(features) ? features : [features || ""]).find((feature) =>
    feature.startsWith("HP:"),
  );
  const hp = Number((hpLine || "").replace("HP:", "").trim());
  return Number.isFinite(hp) && hp > 0 ? hp : 8;
}

function classMaxMana(features) {
  return manaFromText((Array.isArray(features) ? features : [features || ""]).join(" "));
}

function calculateCharacterStats(character, rewards) {
  const stats = { ...startingStats };
  applyStatChanges(stats, classStatChanges(character?.class?.features));
  rewards.forEach((reward) => applyStatChanges(stats, reward.statChanges));
  return stats;
}

function calculateCharacterHp(character, stats, rewards) {
  const levelUpRewards = rewards.filter((reward) => reward.grantsLevel === true);
  const hitDie = classHitDie(character?.class?.features);
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

function calculateCharacterMana(character, rewards) {
  const classMana = classMaxMana(character?.class?.features);
  const rewardMana = rewards.reduce(
    (total, reward) => total + (reward.manaChange ?? rewardManaChange(reward)),
    0,
  );

  return {
    max: classMana + rewardMana,
  };
}

function updateSavedCharacterStats(history) {
  const character = loadSavedCharacter();
  if (!character) return;

  character.stats = calculateCharacterStats(character, history);
  character.hp = calculateCharacterHp(character, character.stats, history);
  character.mana = calculateCharacterMana(character, history);
  saveCharacter(character);
}

function loadRewardHistory() {
  try {
    return JSON.parse(localStorage.getItem(rewardHistoryKey)) || [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function saveReward(reward) {
  const savedReward = {
    ...reward,
    manaChange: reward.manaChange ?? rewardManaChange(reward),
  };
  const history = loadRewardHistory();
  history.unshift(savedReward);
  localStorage.setItem(rewardHistoryKey, JSON.stringify(history));
  updateSavedCharacterStats(history);
  renderRewardHistory();
}

function renderRewardHistory() {
  const history = loadRewardHistory();

  if (history.length === 0) {
    rewardHistory.textContent = "No rewards picked yet. Choose a reward card above to save it.";
    return;
  }

  rewardHistory.replaceChildren(
    ...history.map((reward) => {
      const item = document.createElement("article");
      item.className = `history-item ${reward.rarity}`;

      const title = document.createElement("h3");
      title.textContent = rewardDisplayName(reward);

      const meta = document.createElement("p");
      meta.textContent = `${rarityLabels[reward.rarity] || reward.rarity} - ${reward.category} - ${reward.pool} - ${reward.rewardType}`;

      const text = document.createElement("p");
      const statText = (reward.statChanges || [])
        .map((change) => `${statLabels[change.stat]} +${change.amount}`)
        .join(", ");
      const manaText = (reward.manaChange ?? rewardManaChange(reward)) > 0
        ? `Mana +${reward.manaChange ?? rewardManaChange(reward)}`
        : "";
      const changeText = [statText, manaText].filter(Boolean).join(", ");
      const featText = reward.featChoice ? ` Chosen feat: ${reward.featChoice.name}.` : "";
      const featChoicesText = (reward.featChoices || []).length
        ? ` Chosen feats: ${reward.featChoices.map((feat) => feat.name).join(", ")}.`
        : "";
      const magicInitiateText = reward.featChoice?.magicInitiate
        ? ` Magic Initiate (${reward.featChoice.magicInitiate.sourceClass}): ${reward.featChoice.magicInitiate.cantrips.map((spell) => spell.name).join(", ")}; ${reward.featChoice.magicInitiate.spell?.name}.`
        : "";
      const spellText = reward.spellChoice ? ` Chosen spell: ${reward.spellChoice.name}.` : "";
      const magicItemText = reward.magicItemChoice ? ` Chosen item: ${magicItemDisplayName(reward.magicItemChoice)}.` : "";
      text.textContent = changeText
        ? `${reward.text} (${changeText})${featText}${featChoicesText}${magicInitiateText}${spellText}${magicItemText}`
        : `${reward.text}${featText}${featChoicesText}${magicInitiateText}${spellText}${magicItemText}`;

      item.append(title, meta, text);
      return item;
    }),
  );
}

function useSavedClass() {
  try {
    const character = JSON.parse(localStorage.getItem(savedCharacterKey));
    if (character?.class?.name) {
      classSelect.value = character.class.name;
    }
  } catch (error) {
    console.warn(error);
  }
}

function rewardTypeLabel(type) {
  if (type === "normal") return "Dungeon Reward";
  if (type === "elite") return "Elite Reward";
  if (type === "boss") return "Boss Reward";
  return "Final Boss Reward";
}

async function loadRewardPools() {
  const response = await fetch("Rewards/rewards.json", { cache: "no-store" });
  rewardPools = await response.json();
}

async function loadSpellPools() {
  const response = await fetch("Spells/spells.json", { cache: "no-store" });
  spellPools = await response.json();
}

async function loadMagicItemPools() {
  const response = await fetch("MagicItems/magic-items.json", { cache: "no-store" });
  magicItemPools = await response.json();
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

rollButton.addEventListener("click", updateRewardsView);
rewardTypeSelect.addEventListener("change", updateRewardsView);
floorSelect.addEventListener("change", updateRewardsView);
classSelect.addEventListener("change", updateRewardsView);
viewSelect.addEventListener("change", updateRewardsView);
classOnlyToggle.addEventListener("change", updateRewardsView);
clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(rewardHistoryKey);
  updateSavedCharacterStats([]);
  renderRewardHistory();
});

useSavedClass();
renderRewardHistory();
Promise.all([loadRewardPools(), loadSpellPools(), loadMagicItemPools(), loadOriginFeats(), loadGeneralFeats()])
  .then(updateRewardsView)
  .catch((error) => {
    console.error(error);
    rewardOptions.textContent =
      "Could not load Rewards/rewards.json, Spells/spells.json, MagicItems/magic-items.json, or Feats JSON.";
  });
