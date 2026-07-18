(() => {
  const view = document.body.dataset.lobbyView;
  const playerStatus = document.querySelector("#player-lobby-status");
  const roster = document.querySelector("#dm-roster");
  const rosterCount = document.querySelector("#roster-count");
  const characterStorageKey = "avtizm4.character";

  function loadCharacter() {
    try {
      return JSON.parse(localStorage.getItem(characterStorageKey)) || null;
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  function choiceName(choice) {
    return choice?.name || "—";
  }

  function hasCharacter(character) {
    return Boolean(character?.race?.name && character?.class?.name);
  }

  function metric(label, value) {
    const item = document.createElement("div");
    item.className = "character-metric";
    const key = document.createElement("span");
    key.textContent = label;
    const content = document.createElement("strong");
    content.textContent = value ?? "—";
    item.append(key, content);
    return item;
  }

  function renderPlayerLobby(state) {
    if (!playerStatus) return;
    if (!state?.connected) {
      playerStatus.replaceChildren();
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "First step";
      const title = document.createElement("h2");
      title.textContent = "Enter the game code above";
      const copy = document.createElement("p");
      copy.textContent = "Your DM will see you appear in the party roster as soon as you join.";
      playerStatus.append(eyebrow, title, copy);
      return;
    }

    const character = loadCharacter();
    const ready = hasCharacter(character);
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = ready ? "Character found" : "Lobby joined";
    const title = document.createElement("h2");
    title.textContent = ready
      ? `${choiceName(character.race)} ${choiceName(character.class)}`
      : "Now create your character";
    const copy = document.createElement("p");
    copy.textContent = ready
      ? "Continue with this character or build a new one for this lobby."
      : "Choose your race, class, and starting features. You will go straight to your sheet when finished.";
    const actions = document.createElement("div");
    actions.className = "lobby-actions";

    const primary = document.createElement("a");
    primary.className = "lobby-button";
    primary.href = ready ? "future.html" : "character-builder.html?from=lobby";
    primary.textContent = ready ? "Open Character Sheet" : "Create Character";
    actions.append(primary);

    if (ready) {
      const rebuild = document.createElement("a");
      rebuild.className = "lobby-button secondary";
      rebuild.href = "character-builder.html?from=lobby";
      rebuild.textContent = "Create a New Character";
      actions.append(rebuild);
    }
    playerStatus.replaceChildren(eyebrow, title, copy, actions);
  }

  function renderAbilities(character) {
    const strip = document.createElement("div");
    strip.className = "ability-strip";
    ["str", "dex", "con", "int", "wis", "cha"].forEach((ability) => {
      const item = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = ability.toUpperCase();
      const score = document.createElement("strong");
      score.textContent = character?.stats?.[ability] ?? "—";
      item.append(label, score);
      strip.append(item);
    });
    return strip;
  }

  function rosterCard(member, state, multiplayer) {
    const character = member.character;
    const ready = hasCharacter(character);
    const online = (state.onlineUserIds || []).includes(member.user_id);
    const card = document.createElement("article");
    card.className = "roster-card";

    const header = document.createElement("header");
    header.className = "roster-card-header";
    const identity = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = member.display_name;
    const characterName = document.createElement("p");
    characterName.textContent = ready
      ? `${choiceName(character.race)} · ${choiceName(character.class)}`
      : "Building a character";
    identity.append(name, characterName);
    const status = document.createElement("span");
    status.className = `status-pill${online && ready ? "" : " waiting"}`;
    status.textContent = `${online ? "Online" : "Offline"} · ${ready ? "Ready" : "Building"}`;
    header.append(identity, status);
    card.append(header);

    if (!ready) {
      const note = document.createElement("p");
      note.className = "roster-note";
      note.textContent = "This player joined the lobby but has not finished their character yet.";
      card.append(note);
      return card;
    }

    const metrics = document.createElement("div");
    metrics.className = "character-metrics";
    metrics.append(
      metric("Level", character.hp?.level || 1),
      metric("HP", character.hp?.max || "—"),
      metric("Lineage", choiceName(character.subrace || character.race)),
      metric("Path", choiceName(character.classOption || character.class)),
    );
    card.append(metrics, renderAbilities(character));

    const rewards = Array.isArray(member.player_state?.rewards)
      ? member.player_state.rewards
      : [];
    const pending = Array.isArray(member.player_state?.pendingRewards)
      ? member.player_state.pendingRewards
      : [];
    const rewardTitle = document.createElement("span");
    rewardTitle.className = "roster-section-title";
    rewardTitle.textContent = `Rewards · ${rewards.length} claimed · ${pending.length} waiting`;
    const grantButtons = document.createElement("div");
    grantButtons.className = "reward-grant-buttons";
    [
      ["level-up", "Level-Up"],
      ["common", "Common"],
      ["elite", "Elite"],
      ["boss", "Boss"],
      ["final-boss", "Final Boss"],
    ].forEach(([rewardType, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.rewardType = rewardType;
      button.textContent = `Send ${label}`;
      button.addEventListener("click", async () => {
        button.disabled = true;
        const granted = await multiplayer.grantReward(member.user_id, rewardType);
        button.textContent = granted ? "Sent" : "Try Again";
        window.setTimeout(() => {
          button.disabled = false;
          button.textContent = `Send ${label}`;
        }, 1000);
      });
      grantButtons.append(button);
    });
    card.append(rewardTitle, grantButtons);
    return card;
  }

  function renderDmRoster(state, multiplayer = window.avtizmMultiplayer) {
    if (!roster || !rosterCount) return;
    const players = (state?.members || []).filter((member) => member.role === "player");
    rosterCount.textContent = `${players.length} player${players.length === 1 ? "" : "s"}`;
    if (!state?.connected) {
      const empty = document.createElement("article");
      empty.className = "empty-roster";
      const title = document.createElement("h2");
      title.textContent = "Create a lobby to begin";
      const copy = document.createElement("p");
      copy.textContent = "Your players and their characters will appear here.";
      empty.append(title, copy);
      roster.replaceChildren(empty);
      return;
    }
    if (players.length === 0) {
      const empty = document.createElement("article");
      empty.className = "empty-roster";
      const title = document.createElement("h2");
      title.textContent = "Waiting for the party";
      const copy = document.createElement("p");
      copy.textContent = `Share code ${state.joinCode}. This roster updates automatically.`;
      empty.append(title, copy);
      roster.replaceChildren(empty);
      return;
    }
    roster.replaceChildren(...players.map((member) => rosterCard(member, state, multiplayer)));
  }

  function render(multiplayer = window.avtizmMultiplayer) {
    const state = multiplayer?.getState();
    if (view === "player") renderPlayerLobby(state);
    if (view === "dm") renderDmRoster(state, multiplayer);
  }

  ["ready", "connected", "disconnected", "members-changed", "presence-changed"].forEach((eventName) => {
    window.addEventListener(`avtizm-multiplayer:${eventName}`, (event) => {
      render(event.detail.multiplayer);
    });
  });

  window.avtizmMultiplayer?.ready.then(() => render());
})();
