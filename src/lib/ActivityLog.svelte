<script>
  export let entries = [];

  const ACTION_ICONS = {
    added: '➕',
    removed: '🗑️',
    status_change: '🔄',
    game_change: '🎮',
    edited: '✏️',
  };

  function formatTimestamp(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · ' +
      d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }
</script>

<section class="log-section">
  <h2>Activity Log</h2>

  {#if entries.length === 0}
    <p class="empty">No activity recorded yet. Add a player to get started.</p>
  {:else}
    <ul class="log-list" aria-label="Activity log">
      {#each entries as entry (entry.id)}
        <li class="log-entry">
          <span class="log-icon" aria-hidden="true">{ACTION_ICONS[entry.action] ?? '📋'}</span>
          <div class="log-body">
            <span class="log-message">{entry.message}</span>
            <span class="log-time">{formatTimestamp(entry.timestamp)}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .log-section {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 1.25rem;
  }

  h2 {
    margin: 0 0 1rem;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .empty {
    color: #475569;
    font-size: 0.875rem;
    margin: 0;
  }

  .log-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .log-list::-webkit-scrollbar {
    width: 4px;
  }

  .log-list::-webkit-scrollbar-track {
    background: #0f172a;
    border-radius: 4px;
  }

  .log-list::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }

  .log-entry {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    background: #0f172a;
    border-radius: 6px;
    border-left: 3px solid #334155;
  }

  .log-icon {
    font-size: 0.9375rem;
    line-height: 1.4;
    flex-shrink: 0;
  }

  .log-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .log-message {
    font-size: 0.875rem;
    color: #cbd5e1;
    line-height: 1.4;
  }

  .log-time {
    font-size: 0.75rem;
    color: #475569;
  }
</style>
