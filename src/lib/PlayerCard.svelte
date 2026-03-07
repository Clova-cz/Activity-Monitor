<script>
  import { createEventDispatcher } from 'svelte';

  export let player;
  export let groupName = null; // name of the group this player belongs to (optional)

  const dispatch = createEventDispatcher();

  const STATUS_COLORS = {
    'Online': '#22c55e',
    'In Game': '#3b82f6',
    'Offline': '#6b7280',
  };

  const STATUS_ICONS = {
    'Online': '🟢',
    'In Game': '🎮',
    'Offline': '⚫',
  };

  const ROLE_COLORS = {
    'Owner':    '#f59e0b',
    'Co-Owner': '#f97316',
    'Admin':    '#ef4444',
    'Moderator':'#8b5cf6',
    'Member':   '#3b82f6',
    'Guest':    '#6b7280',
  };

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function getInitials(name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  function isUrl(str) {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch { return false; }
  }
</script>

<div class="card" style="--status-color: {STATUS_COLORS[player.status]}">
  <div class="card-header">
    <div class="avatar" aria-hidden="true">
      {getInitials(player.displayName || player.username)}
    </div>
    <div class="player-info">
      <span class="display-name">{player.displayName || player.username}</span>
      {#if player.displayName && player.displayName !== player.username}
        <span class="username">@{player.username}</span>
      {/if}
    </div>
    <div class="actions">
      <button class="icon-btn" title="Edit player" on:click={() => dispatch('edit', player)}>
        ✏️
      </button>
      <button class="icon-btn danger" title="Remove player" on:click={() => dispatch('remove', player.id)}>
        🗑️
      </button>
    </div>
  </div>

  <div class="status-row">
    <span class="status-badge" style="background: {STATUS_COLORS[player.status]}22; color: {STATUS_COLORS[player.status]}; border-color: {STATUS_COLORS[player.status]}55;">
      {STATUS_ICONS[player.status]}
      {player.status}
    </span>
    {#if player.status === 'In Game' && player.game}
      <span class="game-name">🎯 {player.game}</span>
    {/if}
  </div>

  {#if player.role && groupName}
    <div class="group-row">
      <span
        class="role-badge"
        style="background: {ROLE_COLORS[player.role] ?? '#6b7280'}22; color: {ROLE_COLORS[player.role] ?? '#6b7280'}; border-color: {ROLE_COLORS[player.role] ?? '#6b7280'}55;"
      >
        {player.role}
      </span>
      <span class="group-tag">👥 {groupName}</span>
    </div>
  {/if}

  {#if player.proof}
    <div class="proof-row">
      {#if isUrl(player.proof)}
        <a href={player.proof} target="_blank" rel="noopener noreferrer" class="proof-link">🔗 Proof</a>
      {:else}
        <span class="proof-text">📋 {player.proof}</span>
      {/if}
    </div>
  {/if}

  {#if player.notes}
    <p class="notes">{player.notes}</p>
  {/if}

  <div class="card-footer">
    <span class="last-seen">Last updated: {formatTime(player.updatedAt)}</span>
  </div>
</div>

<style>
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-top: 3px solid var(--status-color);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: box-shadow 0.2s, transform 0.15s;
  }

  .card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1rem;
    color: #fff;
    flex-shrink: 0;
    letter-spacing: 0.05em;
  }

  .player-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .display-name {
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .username {
    font-size: 0.8125rem;
    color: #64748b;
  }

  .actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid #334155;
    border-radius: 6px;
    cursor: pointer;
    padding: 0.3rem 0.45rem;
    font-size: 0.9rem;
    line-height: 1;
    transition: background 0.15s, border-color 0.15s;
  }

  .icon-btn:hover {
    background: #334155;
  }

  .icon-btn.danger:hover {
    background: #450a0a;
    border-color: #7f1d1d;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 600;
    border: 1px solid;
  }

  .game-name {
    font-size: 0.8125rem;
    color: #93c5fd;
    background: #1e3a5f;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .notes {
    font-size: 0.8125rem;
    color: #94a3b8;
    margin: 0;
    padding: 0.5rem 0.75rem;
    background: #0f172a;
    border-radius: 6px;
    border-left: 3px solid #334155;
    line-height: 1.4;
  }

  .card-footer {
    margin-top: auto;
  }

  .last-seen {
    font-size: 0.75rem;
    color: #475569;
  }

  /* ── Group / Role / Proof ── */
  .group-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .group-tag {
    font-size: 0.8125rem;
    color: #94a3b8;
  }

  .proof-row {
    margin-top: -0.125rem;
  }

  .proof-link {
    font-size: 0.8125rem;
    color: #60a5fa;
    text-decoration: none;
  }

  .proof-link:hover {
    text-decoration: underline;
  }

  .proof-text {
    font-size: 0.8125rem;
    color: #94a3b8;
    font-style: italic;
  }
</style>
