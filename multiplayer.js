(() => {
  const config = window.AVTIZM_SUPABASE_CONFIG;
  const supabaseFactory = window.supabase?.createClient;
  const mode = document.body.dataset.vttView === "player" ? "player" : "dm";
  const characterScope = document.body.dataset.multiplayerScope === "characters";
  const sessionStorageKey = `avtizm4.multiplayer.${mode}`;
  const characterStorageKey = "avtizm4.character";
  const characterCampaignStorageKey = "avtizm4.characterCampaign";
  const rewardStorageKey = "avtizm4.rewards";
  const playerStateStorageKey = "avtizm4.vtt.player";
  const pendingRewardStorageKey = "avtizm4.pendingDungeonReward";

  const state = {
    available: Boolean(config?.url && config?.publishableKey && supabaseFactory),
    connected: false,
    busy: false,
    error: "",
    userId: null,
    campaignId: null,
    campaignName: "",
    joinCode: "",
    role: mode,
    tokenId: null,
    displayName: "",
    members: [],
    onlineUserIds: [],
    tokenPositions: [],
    client: null,
    channel: null,
  };

  let barElement = null;
  let lastPlayerViewRevision = 0;
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  function loadJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function reportError(context, error) {
    console.warn(
      `${context}: ${error?.message || String(error)}`,
      error?.code || "",
      error?.details || "",
    );
  }

  function emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(`avtizm-multiplayer:${name}`, {
      detail: { ...detail, multiplayer: api },
    }));
  }

  function characterDisplayName() {
    const character = loadJson(characterStorageKey, null);
    const race = character?.race?.name;
    const characterClass = character?.class?.name;
    return [race, characterClass].filter(Boolean).join(" ") || "Player";
  }

  function setBusy(busy, error = "") {
    state.busy = busy;
    state.error = error;
    renderBar();
  }

  function persistSession() {
    if (!state.connected) {
      localStorage.removeItem(sessionStorageKey);
      return;
    }
    localStorage.setItem(sessionStorageKey, JSON.stringify({
      campaignId: state.campaignId,
      role: state.role,
      tokenId: state.tokenId,
      displayName: state.displayName,
      campaignName: state.campaignName,
      joinCode: state.joinCode,
    }));
  }

  function clearLocalPlayerData() {
    [
      characterStorageKey,
      characterCampaignStorageKey,
      rewardStorageKey,
      playerStateStorageKey,
      pendingRewardStorageKey,
    ].forEach((key) => localStorage.removeItem(key));
  }

  function createBar() {
    barElement = document.querySelector("[data-multiplayer-mount]");
    if (!barElement) {
      barElement = document.createElement("section");
      barElement.className = "multiplayer-bar";
      barElement.setAttribute("aria-label", "Multiplayer connection");
      const header = document.querySelector(".dungeon-header, .future-header, .lobby-header");
      header?.insertAdjacentElement("afterend", barElement);
    }
    renderBar();
  }

  function disconnectedMarkup() {
    if (!state.available) {
      return `
        <div class="multiplayer-summary">
          <span class="connection-dot is-offline"></span>
          <div>
            <strong>Multiplayer unavailable</strong>
            <small>Supabase configuration or client library is missing.</small>
          </div>
        </div>
      `;
    }

    if (mode === "dm") {
      return `
        <form class="multiplayer-form" data-create-campaign>
          <div class="multiplayer-summary">
            <span class="connection-dot is-offline"></span>
            <div>
              <strong>Start an online campaign</strong>
              <small>Create a code for players to join.</small>
            </div>
          </div>
          <label>
            Campaign
            <input name="campaignName" maxlength="80" value="D&amp;D Roguelike" required />
          </label>
          <label>
            DM name
            <input name="displayName" maxlength="50" value="Dungeon Master" required />
          </label>
          <button type="submit" ${state.busy ? "disabled" : ""}>
            ${state.busy ? "Connecting…" : "Create Game"}
          </button>
        </form>
      `;
    }

    return `
      <form class="multiplayer-form" data-join-campaign>
        <div class="multiplayer-summary">
          <span class="connection-dot is-offline"></span>
          <div>
            <strong>Join an online campaign</strong>
            <small>Enter the six-character code from your DM.</small>
          </div>
        </div>
        <label>
          Game code
          <input name="joinCode" class="join-code-input" maxlength="6" autocomplete="off" required />
        </label>
        <label>
          Player name
          <input name="displayName" maxlength="50" value="${escapeHtml(characterDisplayName())}" required />
        </label>
        <button type="submit" ${state.busy ? "disabled" : ""}>
          ${state.busy ? "Joining…" : "Join Game"}
        </button>
      </form>
    `;
  }

  function connectedMarkup() {
    const players = state.members.filter((member) => member.role === "player");
    const playerList = mode === "dm"
      ? `
        <div class="multiplayer-members" aria-label="Connected players">
          ${players.map((member) => `
            <span class="multiplayer-member">
              ${escapeHtml(member.display_name)}
            </span>
          `).join("") || "<small>Waiting for players…</small>"}
        </div>
      `
      : "";

    return `
      <div class="multiplayer-connected">
        <div class="multiplayer-summary">
          <span class="connection-dot is-online"></span>
          <div>
            <strong>${escapeHtml(state.campaignName || "Online campaign")}</strong>
            <small>${mode === "dm" ? "DM view" : `Playing as ${escapeHtml(state.displayName)}`}</small>
          </div>
        </div>
        <button class="join-code-copy" type="button" data-copy-code title="Copy game code">
          <span>Game code</span>
          <strong>${escapeHtml(state.joinCode)}</strong>
        </button>
        ${playerList}
        <button class="secondary-button" type="button" data-disconnect>Leave</button>
      </div>
    `;
  }

  function renderBar() {
    if (!barElement) return;
    barElement.innerHTML = `
      ${state.connected ? connectedMarkup() : disconnectedMarkup()}
      ${state.error ? `<p class="multiplayer-error" role="alert">${escapeHtml(state.error)}</p>` : ""}
    `;

    barElement.querySelector("[data-create-campaign]")?.addEventListener("submit", handleCreate);
    barElement.querySelector("[data-join-campaign]")?.addEventListener("submit", handleJoin);
    barElement.querySelector("[data-disconnect]")?.addEventListener("click", disconnect);
    barElement.querySelector("[data-copy-code]")?.addEventListener("click", async () => {
      await navigator.clipboard?.writeText(state.joinCode);
      const label = barElement.querySelector("[data-copy-code] span");
      if (label) {
        label.textContent = "Copied";
        window.setTimeout(() => {
          if (label) label.textContent = "Game code";
        }, 1200);
      }
    });
  }

  async function ensureUser() {
    const { data: sessionData } = await state.client.auth.getSession();
    let user = sessionData.session?.user || null;
    if (!user) {
      const { data, error } = await state.client.auth.signInAnonymously();
      if (error) throw error;
      user = data.user;
    }
    state.userId = user?.id || null;
    if (!state.userId) throw new Error("Could not create a multiplayer identity.");
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (state.busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { data, error } = await state.client.rpc("create_campaign", {
      p_name: String(form.get("campaignName") || "").trim(),
      p_display_name: String(form.get("displayName") || "").trim(),
    });
    if (error) {
      setBusy(false, error.message);
      return;
    }
    const result = data?.[0];
    await connectToCampaign({
      campaignId: result.campaign_id,
      role: result.member_role,
      tokenId: result.token_id,
      displayName: String(form.get("displayName") || "").trim(),
      campaignName: String(form.get("campaignName") || "").trim(),
      joinCode: result.join_code,
    });
    setBusy(false);
  }

  async function handleJoin(event) {
    event.preventDefault();
    if (state.busy) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get("joinCode") || "").trim().toUpperCase();
    const displayName = String(form.get("displayName") || "").trim();
    setBusy(true);
    const { data, error } = await state.client.rpc("join_campaign", {
      p_code: code,
      p_display_name: displayName,
      p_character: {},
      p_player_state: {},
    });
    if (error) {
      setBusy(false, error.message);
      return;
    }
    const result = data?.[0];
    clearLocalPlayerData();
    await connectToCampaign({
      campaignId: result.campaign_id,
      role: result.member_role,
      tokenId: result.token_id,
      displayName,
      campaignName: result.campaign_name,
      joinCode: result.join_code,
    });
    setBusy(false);
  }

  async function restoreCampaign() {
    const saved = loadJson(sessionStorageKey, null);
    if (!saved?.campaignId) return;
    const memberRequest = state.client
      .from("campaign_members")
      .select("campaign_id,user_id,role,display_name,token_id")
      .eq("campaign_id", saved.campaignId)
      .eq("user_id", state.userId)
      .maybeSingle();
    const campaignRequest = state.client
      .from("campaigns")
      .select("id,name,join_code,active")
      .eq("id", saved.campaignId)
      .maybeSingle();
    const [
      { data: member, error: memberError },
      { data: campaign, error: campaignError },
    ] = await Promise.all([memberRequest, campaignRequest]);
    if (
      memberError
      || campaignError
      || !member
      || !campaign?.active
      || member.role !== mode
    ) {
      localStorage.removeItem(sessionStorageKey);
      return;
    }
    await connectToCampaign({
      campaignId: member.campaign_id,
      role: member.role,
      tokenId: member.token_id,
      displayName: member.display_name,
      campaignName: campaign.name || saved.campaignName,
      joinCode: campaign.join_code || saved.joinCode,
    });
  }

  async function connectToCampaign(session) {
    state.campaignId = session.campaignId;
    state.role = session.role;
    state.tokenId = session.tokenId;
    state.displayName = session.displayName;
    state.campaignName = session.campaignName || "";
    state.joinCode = session.joinCode || "";
    if (!state.campaignName || !state.joinCode) {
      const { data: campaign, error } = await state.client
        .from("campaigns")
        .select("id,name,join_code,active")
        .eq("id", state.campaignId)
        .single();
      if (error) throw error;
      state.campaignName = campaign.name;
      state.joinCode = campaign.join_code;
    }
    state.connected = true;
    persistSession();
    await subscribeToCampaign();
    if (characterScope) {
      await refreshMembers();
    } else {
      await Promise.all([refreshMembers(), loadInitialState()]);
    }
    renderBar();
    emit("connected", getState());
  }

  async function refreshMembers() {
    if (!state.connected) return [];
    const membersRequest = state.client
      .from("campaign_members")
      .select("campaign_id,user_id,role,display_name,token_id,joined_at,last_seen")
      .eq("campaign_id", state.campaignId)
      .order("joined_at");
    const charactersRequest = mode === "dm"
      ? state.client
        .from("player_characters")
        .select("campaign_id,user_id,character,player_state,updated_at")
        .eq("campaign_id", state.campaignId)
      : state.client
        .from("player_characters")
        .select("campaign_id,user_id,character,player_state,updated_at")
        .eq("campaign_id", state.campaignId)
        .eq("user_id", state.userId)
        .maybeSingle();
    const [
      { data: members, error },
      characterResponse,
    ] = await Promise.all([membersRequest, charactersRequest]);
    if (error) {
      reportError("Could not refresh campaign members", error);
      return state.members;
    }

    let characterRows = [];
    if (mode === "dm") {
      if (!characterResponse.error) characterRows = characterResponse.data || [];
    } else {
      if (characterResponse.data) {
        characterRows = [characterResponse.data];
        restoreOwnCharacter(characterResponse.data);
      }
    }

    const charactersByUser = new Map(characterRows.map((row) => [row.user_id, row]));
    state.members = (members || []).map((member) => ({
      ...member,
      character: charactersByUser.get(member.user_id)?.character || null,
      player_state: charactersByUser.get(member.user_id)?.player_state || null,
    }));
    renderBar();
    emit("members-changed", { members: state.members });
    return state.members;
  }

  function restoreOwnCharacter(row) {
    if (!row?.character || Object.keys(row.character).length === 0) return;
    const localCharacter = loadJson(characterStorageKey, null);
    const localCampaignId = localStorage.getItem(characterCampaignStorageKey);
    const localTime = Date.parse(localCharacter?.savedAt || 0) || 0;
    const remoteTime = Date.parse(row.character?.savedAt || row.updated_at || 0) || 0;
    if (!localCharacter || localCampaignId !== state.campaignId || remoteTime > localTime) {
      localStorage.setItem(characterStorageKey, JSON.stringify(row.character));
    }
    localStorage.setItem(characterCampaignStorageKey, state.campaignId);
    if (row.player_state && Object.keys(row.player_state).length > 0) {
      const localState = loadJson(playerStateStorageKey, {});
      localStorage.setItem(playerStateStorageKey, JSON.stringify({
        ...localState,
        ...row.player_state,
      }));
      if (Array.isArray(row.player_state.rewards)) {
        const localRewards = loadJson(rewardStorageKey, []);
        const localRewardTime = Math.max(
          0,
          ...localRewards.map((reward) => Date.parse(reward?.savedAt || 0) || 0),
        );
        const remoteTime = Date.parse(row.updated_at || 0) || 0;
        if (localRewards.length === 0 || remoteTime >= localRewardTime) {
          localStorage.setItem(rewardStorageKey, JSON.stringify(row.player_state.rewards));
        }
      }
    }
  }

  function rememberTokenPosition(position) {
    if (!position?.token_id) return;
    const index = state.tokenPositions.findIndex(
      (item) => item.token_id === position.token_id,
    );
    if (index >= 0) {
      state.tokenPositions[index] = position;
    } else {
      state.tokenPositions.push(position);
    }
  }

  async function refreshTokenPositions() {
    if (!state.connected) return [];
    const { data, error } = await state.client
      .from("campaign_token_positions")
      .select("campaign_id,token_id,owner_user_id,dungeon_id,x,y,revision,updated_at")
      .eq("campaign_id", state.campaignId);
    if (error) {
      reportError("Could not load token positions", error);
      return state.tokenPositions;
    }
    state.tokenPositions = data || [];
    emit("token-positions", { positions: state.tokenPositions });
    return state.tokenPositions;
  }

  async function subscribeToCampaign() {
    if (state.channel) await state.client.removeChannel(state.channel);
    state.channel = state.client
      .channel(`campaign:${state.campaignId}`, {
        config: {
          presence: {
            key: state.userId,
          },
        },
      })
      .on("presence", { event: "sync" }, () => {
        const presenceState = state.channel?.presenceState?.() || {};
        state.onlineUserIds = [...new Set(
          Object.values(presenceState)
            .flat()
            .map((presence) => presence.user_id)
            .filter(Boolean),
        )];
        renderBar();
        emit("presence-changed", { onlineUserIds: state.onlineUserIds });
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_members",
          filter: `campaign_id=eq.${state.campaignId}`,
        },
        () => refreshMembers(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_characters",
          filter: `campaign_id=eq.${state.campaignId}`,
        },
        () => refreshMembers(),
      );

    if (!characterScope) {
      state.channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_token_positions",
          filter: `campaign_id=eq.${state.campaignId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            state.tokenPositions = state.tokenPositions.filter(
              (item) => item.token_id !== payload.old?.token_id,
            );
            emit("token-position-deleted", { position: payload.old });
            return;
          }
          if (payload.new?.campaign_id !== state.campaignId) return;
          rememberTokenPosition(payload.new);
          emit("token-position", { position: payload.new });
        },
      );
    }

    if (!characterScope && mode === "dm") {
      state.channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "player_actions",
          filter: `campaign_id=eq.${state.campaignId}`,
        },
        (payload) => emit("game-action", { action: payload.new }),
      );
    } else if (!characterScope) {
      state.channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_views",
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          if (payload.new?.campaign_id === state.campaignId) {
            emit("dungeon-state", {
              state: payload.new.dungeon_state,
              revision: payload.new.revision,
            });
          }
        },
      );
    }

    state.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await state.channel.track({
          user_id: state.userId,
          role: mode,
          online_at: new Date().toISOString(),
        });
      }
      if (status === "CHANNEL_ERROR") {
        state.error = "Realtime connection interrupted. Reconnecting…";
        renderBar();
      }
      if (status === "SUBSCRIBED" && state.error.includes("Realtime")) {
        state.error = "";
        renderBar();
      }
    });
  }

  async function loadInitialState(force = false) {
    if (mode === "dm") {
      const { data } = await state.client
        .from("campaign_dm_state")
        .select("dungeon_state,revision")
        .eq("campaign_id", state.campaignId)
        .maybeSingle();
      await refreshTokenPositions();
      if (data?.dungeon_state) {
        emit("dungeon-state", {
          state: data.dungeon_state,
          revision: data.revision,
          force,
        });
      }
      const { data: pending } = await state.client
        .from("player_actions")
        .select("*")
        .eq("campaign_id", state.campaignId)
        .eq("status", "pending")
        .order("created_at");
      (pending || []).forEach((action) => emit("game-action", { action }));
      return;
    }

    const { data } = await state.client
      .from("player_views")
      .select("dungeon_state,revision")
      .eq("campaign_id", state.campaignId)
      .eq("user_id", state.userId)
      .maybeSingle();
    await refreshTokenPositions();
    if (data?.dungeon_state) {
      emit("dungeon-state", {
        state: data.dungeon_state,
        revision: data.revision,
        force,
      });
    }
  }

  async function refreshDungeonState() {
    if (!state.connected || mode !== "player") return;
    await loadInitialState(true);
  }

  async function disconnect() {
    if (state.channel) {
      await state.client.removeChannel(state.channel);
      state.channel = null;
    }
    state.connected = false;
    state.campaignId = null;
    state.campaignName = "";
    state.joinCode = "";
    state.tokenId = null;
    state.members = [];
    state.onlineUserIds = [];
    state.tokenPositions = [];
    state.error = "";
    persistSession();
    renderBar();
    emit("disconnected", {});
  }

  async function syncCharacter(character, playerState) {
    if (!state.connected || mode !== "player") return;
    const { error } = await state.client.rpc("sync_player_character_sheet", {
      p_campaign_id: state.campaignId,
      p_character: character || {},
      p_sheet_state: playerState || {},
    });
    if (error) {
      reportError("Could not sync player character", error);
      return false;
    }
    return true;
  }

  async function grantReward(userId, rewardType) {
    if (!state.connected || mode !== "dm" || !userId || !rewardType) return null;
    const { data, error } = await state.client.rpc("queue_campaign_reward", {
      p_campaign_id: state.campaignId,
      p_user_id: userId,
      p_reward_type: rewardType,
    });
    if (error) {
      reportError("Could not send reward", error);
      return null;
    }
    await refreshMembers();
    return data;
  }

  async function consumeRewardGrant(grantId) {
    if (!state.connected || mode !== "player" || !grantId) return false;
    const { error } = await state.client.rpc("consume_campaign_reward", {
      p_campaign_id: state.campaignId,
      p_grant_id: grantId,
    });
    if (error) {
      reportError("Could not claim reward", error);
      return false;
    }
    await refreshMembers();
    return true;
  }

  async function saveDmState(dungeonState) {
    if (!state.connected || mode !== "dm" || !dungeonState) return;
    const { data: current } = await state.client
      .from("campaign_dm_state")
      .select("revision")
      .eq("campaign_id", state.campaignId)
      .maybeSingle();
    const { error } = await state.client
      .from("campaign_dm_state")
      .upsert({
        campaign_id: state.campaignId,
        dungeon_state: dungeonState,
        revision: Number(current?.revision || 0) + 1,
        updated_at: new Date().toISOString(),
        updated_by: state.userId,
      }, { onConflict: "campaign_id" });
    if (error) reportError("Could not save DM dungeon state", error);
  }

  async function savePlayerViews(views) {
    if (!state.connected || mode !== "dm" || !Array.isArray(views) || views.length === 0) return;
    const revision = Math.max(Date.now(), lastPlayerViewRevision + 1);
    lastPlayerViewRevision = revision;
    const rows = views.map((view) => ({
      campaign_id: state.campaignId,
      user_id: view.userId,
      dungeon_state: view.dungeonState,
      revision,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await state.client
      .from("player_views")
      .upsert(rows, { onConflict: "campaign_id,user_id" });
    if (error) reportError("Could not save player views", error);
  }

  async function syncTokenPositions(tokens) {
    if (!state.connected || mode !== "dm" || !Array.isArray(tokens)) return [];
    const { data, error } = await state.client.rpc("sync_campaign_token_positions", {
      p_campaign_id: state.campaignId,
      p_tokens: tokens,
    });
    if (error) {
      reportError("Could not initialize token positions", error);
      return [];
    }
    state.tokenPositions = data || [];
    emit("token-positions", { positions: state.tokenPositions });
    return state.tokenPositions;
  }

  async function moveToken(tokenId, path, expectedRevision = null) {
    if (!state.connected || !tokenId || !Array.isArray(path)) return null;
    const { data, error } = await state.client
      .rpc("move_campaign_token", {
        p_campaign_id: state.campaignId,
        p_token_id: tokenId,
        p_path: path,
        p_expected_revision: expectedRevision,
      })
      .single();
    if (error) {
      reportError("Could not move token", error);
      return null;
    }
    rememberTokenPosition(data);
    emit("token-position", { position: data });
    return data;
  }

  async function submitAction(actionType, payload) {
    if (!state.connected || mode !== "player") return null;
    const { data, error } = await state.client
      .from("player_actions")
      .insert({
        campaign_id: state.campaignId,
        user_id: state.userId,
        action_type: actionType,
        payload: payload || {},
      })
      .select("id")
      .single();
    if (error) {
      state.error = error.message;
      renderBar();
      return null;
    }
    return data.id;
  }

  async function completeAction(actionId, accepted, result = {}) {
    if (!state.connected || mode !== "dm") return;
    const { error } = await state.client
      .from("player_actions")
      .update({
        status: accepted ? "accepted" : "rejected",
        result,
        processed_at: new Date().toISOString(),
      })
      .eq("id", actionId)
      .eq("campaign_id", state.campaignId);
    if (error) reportError("Could not complete player action", error);
  }

  function getState() {
    return {
      available: state.available,
      connected: state.connected,
      userId: state.userId,
      campaignId: state.campaignId,
      campaignName: state.campaignName,
      joinCode: state.joinCode,
      role: state.role,
      tokenId: state.tokenId,
      displayName: state.displayName,
      members: state.members,
      onlineUserIds: state.onlineUserIds,
      tokenPositions: state.tokenPositions,
    };
  }

  const api = {
    ready,
    getState,
    refreshMembers,
    refreshDungeonState,
    refreshTokenPositions,
    syncCharacter,
    grantReward,
    consumeRewardGrant,
    saveDmState,
    savePlayerViews,
    syncTokenPositions,
    moveToken,
    submitAction,
    completeAction,
  };
  window.avtizmMultiplayer = api;

  async function initialize() {
    createBar();
    if (!state.available) {
      resolveReady(api);
      return;
    }
    try {
      state.client = supabaseFactory(config.url, config.publishableKey, {
        auth: {
          storageKey: `avtizm4.auth.${mode}`,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
      await ensureUser();
      await restoreCampaign();
    } catch (error) {
      state.error = error.message || "Could not initialize multiplayer.";
      reportError("Could not initialize multiplayer", error);
      renderBar();
    } finally {
      resolveReady(api);
      emit("ready", getState());
    }
  }

  initialize();
})();
