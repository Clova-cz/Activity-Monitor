<script>
  import WarningBanner from './lib/WarningBanner.svelte';
  import PlayerCard from './lib/PlayerCard.svelte';
  import PlayerModal from './lib/PlayerModal.svelte';
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

  const STATUS_OPTIONS = ['All', 'Online', 'In Game', 'Offline'];

  // ─── Derived ─────────────────────────────────────────────────────────────────

  $: filteredPlayers = players.filter((p) => {
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.username.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      (p.game && p.game.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  $: counts = {
    all: players.length,
    online: players.filter((p) => p.status === 'Online').length,
    inGame: players.filter((p) => p.status === 'In Game').length,
    offline: players.filter((p) => p.status === 'Offline').length,
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function addLog(action, message) {
    activityLog = [
      { id: nextLogId++, action, message, timestamp: new Date().toISOString() },
      ...activityLog,
    ].slice(0, 200); // keep last 200 entries
  }

  // ─── Modal handlers ──────────────────────────────────────────────────────────

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
</script>

<WarningBanner />

<main>
  <!-- Header -->
  <header class="app-header">
    <div class="header-left">
      <div class="logo" aria-hidden="true">🎮</div>
      <div>
        <h1>Roblox Activity Monitor</h1>
        <p class="subtitle">Manually track your friends' Roblox activity</p>
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

<!-- Modal -->
{#if showModal}
  <PlayerModal
    player={editingPlayer}
    on:save={handleSave}
    on:cancel={closeModal}
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
