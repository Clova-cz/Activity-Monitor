<script>
  import WarningBanner from './lib/WarningBanner.svelte';
  import PlayerCard from './lib/PlayerCard.svelte';
  import PlayerModal from './lib/PlayerModal.svelte';
  import GroupModal from './lib/GroupModal.svelte';
  import ActivityLog from './lib/ActivityLog.svelte';

  // ─── State ───────────────────────────────────────────────────────────────────

  let players = [];
  let activityLog = [];
  let showModal = false;
  let editingPlayer = null; // null = add mode, player object = edit mode
  let filterStatus = 'All';
  let searchQuery = '';
  let nextId = 1;
  let nextLogId = 1;

  // Groups
  let groups = [];
  let nextGroupId = 1;
  let showGroupModal = false;
  let editingGroup = null; // null = create mode, group object = edit mode
  let filterGroupId = null; // null = show all groups

  const STATUS_OPTIONS = ['All', 'Online', 'In Game', 'Offline'];

  // ─── Derived ─────────────────────────────────────────────────────────────────

  $: filteredPlayers = players.filter((p) => {
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchGroup = filterGroupId === null || p.groupId === filterGroupId;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.username.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      (p.game && p.game.toLowerCase().includes(q));
    return matchStatus && matchGroup && matchSearch;
  });

  $: counts = {
    all: players.length,
    online: players.filter((p) => p.status === 'Online').length,
    inGame: players.filter((p) => p.status === 'In Game').length,
    offline: players.filter((p) => p.status === 'Offline').length,
  };

  // Pre-compute member counts per group to avoid repeated O(n) scans in the template.
  $: memberCounts = Object.fromEntries(
    groups.map((g) => [g.id, players.filter((p) => p.groupId === g.id).length])
  );

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function addLog(action, message) {
    activityLog = [
      { id: nextLogId++, action, message, timestamp: new Date().toISOString() },
      ...activityLog,
    ].slice(0, 200); // keep last 200 entries
  }

  // ─── Player modal handlers ────────────────────────────────────────────────────

  function openAddModal() {
    editingPlayer = null;
    showModal = true;
  }

  function openEditModal(player) {
    editingPlayer = player;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingPlayer = null;
  }

  function handleSave(event) {
    const data = event.detail;

    if (editingPlayer) {
      // Edit existing player
      const prev = editingPlayer;
      players = players.map((p) =>
        p.id === prev.id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      );

      if (prev.status !== data.status) {
        addLog(
          'status_change',
          `${data.displayName || data.username}'s status changed: ${prev.status} → ${data.status}`
        );
      } else if (prev.game !== data.game && data.status === 'In Game') {
        addLog(
          'game_change',
          `${data.displayName || data.username} switched game: ${prev.game || '?'} → ${data.game}`
        );
      } else if (data.role && prev.role !== data.role) {
        const gName = groups.find((g) => g.id === data.groupId)?.name ?? 'a group';
        addLog(
          'role_change',
          `${data.displayName || data.username}'s role in ${gName} changed to ${data.role}.`
        );
      } else {
        addLog('edited', `${data.displayName || data.username}'s profile was updated.`);
      }
    } else {
      // Add new player
      const newPlayer = {
        id: nextId++,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      players = [...players, newPlayer];
      addLog('added', `${data.displayName || data.username} was added to the monitor.`);
    }

    closeModal();
  }

  function removePlayer(id) {
    const player = players.find((p) => p.id === id);
    if (!player) return;
    if (!confirm(`Remove ${player.displayName || player.username} from the monitor?`)) return;
    players = players.filter((p) => p.id !== id);
    addLog('removed', `${player.displayName || player.username} was removed from the monitor.`);
  }

  // ─── Group handlers ───────────────────────────────────────────────────────────

  function openAddGroupModal() {
    editingGroup = null;
    showGroupModal = true;
  }

  function openEditGroupModal(group) {
    editingGroup = group;
    showGroupModal = true;
  }

  function closeGroupModal() {
    showGroupModal = false;
    editingGroup = null;
  }

  function handleGroupSave(event) {
    const data = event.detail;
    if (editingGroup) {
      groups = groups.map((g) =>
        g.id === editingGroup.id ? { ...g, ...data } : g
      );
      addLog('group_edited', `Group "${data.name}" was updated.`);
    } else {
      const newGroup = { id: nextGroupId++, ...data, createdAt: new Date().toISOString() };
      groups = [...groups, newGroup];
      addLog('group_added', `Group "${data.name}" was created.`);
    }
    closeGroupModal();
  }

  function removeGroup(id) {
    const group = groups.find((g) => g.id === id);
    if (!group) return;
    const memberCount = memberCounts[id] ?? 0;
    const msg = memberCount > 0
      ? `Remove group "${group.name}"? ${memberCount} player(s) will be unassigned.`
      : `Remove group "${group.name}"?`;
    if (!confirm(msg)) return;
    groups = groups.filter((g) => g.id !== id);
    // Unassign players that belonged to this group
    players = players.map((p) =>
      p.groupId === id ? { ...p, groupId: null, role: '', proof: '' } : p
    );
    // Clear the group filter if it pointed at the deleted group
    if (filterGroupId === id) filterGroupId = null;
    addLog('group_removed', `Group "${group.name}" was removed.`);
  }

  function toggleGroupFilter(id) {
    filterGroupId = filterGroupId === id ? null : id;
  }
</script>

<WarningBanner />

<main>
  <!-- Header -->
  <header class="app-header">
    <div class="header-left">
      <div class="logo" aria-hidden="true">🎮</div>
      <div>
        <h1>Roblox Activity Monitor</h1>
        <p class="subtitle">Track your group members' Roblox activity</p>
      </div>
    </div>
    <button class="btn-add" on:click={openAddModal}>
      + Add Player
    </button>
  </header>

  <!-- Stats bar -->
  <div class="stats-bar">
    <div class="stat">
      <span class="stat-value">{counts.all}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat online">
      <span class="stat-value">{counts.online}</span>
      <span class="stat-label">Online</span>
    </div>
    <div class="stat in-game">
      <span class="stat-value">{counts.inGame}</span>
      <span class="stat-label">In Game</span>
    </div>
    <div class="stat offline">
      <span class="stat-value">{counts.offline}</span>
      <span class="stat-label">Offline</span>
    </div>
    <div class="stat groups-stat">
      <span class="stat-value">{groups.length}</span>
      <span class="stat-label">Groups</span>
    </div>
  </div>

  <!-- Groups bar -->
  <div class="groups-bar">
    <div class="groups-chips">
      <button
        class="group-chip"
        class:active={filterGroupId === null}
        on:click={() => (filterGroupId = null)}
      >
        All Players
      </button>
      {#each groups as group (group.id)}
        <div class="group-chip-wrapper">
          <button
            class="group-chip"
            class:active={filterGroupId === group.id}
            on:click={() => toggleGroupFilter(group.id)}
          >
            <span class="chip-name">{group.name}</span>
            <span class="chip-count">{memberCounts[group.id] ?? 0}</span>
          </button>
          <div class="chip-actions">
            <button
              class="chip-action"
              title="Edit group"
              on:click|stopPropagation={() => openEditGroupModal(group)}
              aria-label="Edit group {group.name}"
            >✏️</button>
            <button
              class="chip-action chip-action-danger"
              title="Delete group"
              on:click|stopPropagation={() => removeGroup(group.id)}
              aria-label="Delete group {group.name}"
            >🗑️</button>
          </div>
        </div>
      {/each}
    </div>
    <button class="btn-new-group" on:click={openAddGroupModal}>+ New Group</button>
  </div>

  <!-- Filters -->
  <div class="filters">
    <input
      class="search-input"
      type="search"
      placeholder="Search players or games…"
      bind:value={searchQuery}
      aria-label="Search players"
    />
    <div class="filter-tabs" role="tablist" aria-label="Filter by status">
      {#each STATUS_OPTIONS as opt}
        <button
          role="tab"
          aria-selected={filterStatus === opt}
          class="filter-tab"
          class:active={filterStatus === opt}
          on:click={() => (filterStatus = opt)}
        >
          {opt}
        </button>
      {/each}
    </div>
  </div>

  <!-- Players grid -->
  {#if filteredPlayers.length > 0}
    <div class="players-grid">
      {#each filteredPlayers as player (player.id)}
        <PlayerCard
          {player}
          groupName={groups.find((g) => g.id === player.groupId)?.name ?? null}
          on:edit={(e) => openEditModal(e.detail)}
          on:remove={(e) => removePlayer(e.detail)}
        />
      {/each}
    </div>
  {:else if players.length === 0}
    <div class="empty-state">
      <div class="empty-icon">👥</div>
      <h2>No players added yet</h2>
      <p>Click <strong>+ Add Player</strong> to start tracking Roblox activity.</p>
      <button class="btn-add" on:click={openAddModal}>+ Add Your First Player</button>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2>No results found</h2>
      <p>Try adjusting your search or filter.</p>
    </div>
  {/if}

  <!-- Activity Log -->
  <ActivityLog entries={activityLog} />
</main>

<!-- Player Modal -->
{#if showModal}
  <PlayerModal
    player={editingPlayer}
    {groups}
    on:save={handleSave}
    on:cancel={closeModal}
  />
{/if}

<!-- Group Modal -->
{#if showGroupModal}
  <GroupModal
    group={editingGroup}
    on:save={handleGroupSave}
    on:cancel={closeGroupModal}
  />
{/if}

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #0f172a;
    color: #f1f5f9;
    min-height: 100vh;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ── Header ── */
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .logo {
    font-size: 2.25rem;
    line-height: 1;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #ef4444, #f87171);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }

  .subtitle {
    margin: 0.125rem 0 0;
    font-size: 0.875rem;
    color: #64748b;
  }

  .btn-add {
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.25rem;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn-add:hover {
    opacity: 0.9;
  }

  .btn-add:active {
    transform: scale(0.97);
  }

  /* ── Stats bar ── */
  .stats-bar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .stat {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 0.625rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 70px;
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .stat.online .stat-value { color: #22c55e; }
  .stat.in-game .stat-value { color: #3b82f6; }
  .stat.offline .stat-value { color: #6b7280; }
  .stat.groups-stat .stat-value { color: #a78bfa; }

  /* ── Groups bar ── */
  .groups-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .groups-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex: 1;
    align-items: center;
  }

  .group-chip-wrapper {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .group-chip {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 999px;
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.3rem 0.875rem;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .group-chip:hover {
    color: #f1f5f9;
    background: #334155;
  }

  .group-chip.active {
    background: linear-gradient(135deg, #7c3aed, #4c1d95);
    border-color: #7c3aed;
    color: #fff;
    font-weight: 700;
  }

  .chip-name {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-count {
    background: rgba(255,255,255,0.15);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.05rem 0.4rem;
    line-height: 1.4;
  }

  .group-chip:not(.active) .chip-count {
    background: #334155;
    color: #94a3b8;
  }

  .chip-actions {
    display: flex;
    gap: 0.15rem;
  }

  .chip-action {
    background: transparent;
    border: 1px solid #334155;
    border-radius: 6px;
    cursor: pointer;
    padding: 0.2rem 0.35rem;
    font-size: 0.8rem;
    line-height: 1;
    transition: background 0.15s, border-color 0.15s;
  }

  .chip-action:hover {
    background: #334155;
  }

  .chip-action-danger:hover {
    background: #450a0a;
    border-color: #7f1d1d;
  }

  .btn-new-group {
    background: #1e293b;
    border: 1px dashed #475569;
    border-radius: 999px;
    color: #64748b;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.3rem 0.875rem;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn-new-group:hover {
    background: #334155;
    color: #f1f5f9;
    border-color: #64748b;
  }

  /* ── Filters ── */
  .filters {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #f1f5f9;
    font-size: 0.9375rem;
    padding: 0.5rem 0.875rem;
    min-width: 200px;
    flex: 1;
    outline: none;
    transition: border-color 0.15s;
    font-family: inherit;
  }

  .search-input:focus {
    border-color: #ef4444;
  }

  .search-input::placeholder {
    color: #475569;
  }

  .filter-tabs {
    display: flex;
    gap: 0.25rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 0.25rem;
  }

  .filter-tab {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.35rem 0.875rem;
    border-radius: 6px;
    transition: background 0.15s, color 0.15s;
    font-family: inherit;
  }

  .filter-tab:hover {
    color: #f1f5f9;
    background: #334155;
  }

  .filter-tab.active {
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: #fff;
    font-weight: 700;
  }

  /* ── Players grid ── */
  .players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  /* ── Empty state ── */
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #94a3b8;
  }

  .empty-state p {
    margin: 0;
    color: #64748b;
    font-size: 0.9375rem;
  }
</style>
