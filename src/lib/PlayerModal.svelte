<script>
  import { createEventDispatcher } from 'svelte';

  export let player = null; // null = add mode, object = edit mode

  const dispatch = createEventDispatcher();

  const STATUS_OPTIONS = ['Online', 'In Game', 'Offline'];

  let username = player?.username ?? '';
  let displayName = player?.displayName ?? '';
  let status = player?.status ?? 'Online';
  let game = player?.game ?? '';
  let notes = player?.notes ?? '';

  let errors = {};

  function validate() {
    errors = {};
    if (!username.trim()) errors.username = 'Username is required.';
    else if (username.trim().length < 3)
      errors.username = 'Username must be at least 3 characters.';
    else if (!/^[A-Za-z0-9_]+$/.test(username.trim()))
      errors.username = 'Username can only contain letters, numbers, and underscores.';

    if (status === 'In Game' && !game.trim())
      errors.game = 'Game name is required when status is "In Game".';

    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    dispatch('save', {
      username: username.trim(),
      displayName: displayName.trim() || username.trim(),
      status,
      game: status === 'In Game' ? game.trim() : '',
      notes: notes.trim(),
    });
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') dispatch('cancel');
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  class="overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabindex="-1"
  on:keydown={handleKeydown}
>
  <div class="modal">
    <header class="modal-header">
      <h2 id="modal-title">{player ? 'Edit Player' : 'Add Player'}</h2>
      <button class="close-btn" on:click={() => dispatch('cancel')} aria-label="Close">✕</button>
    </header>

    <form class="modal-body" on:submit|preventDefault={handleSubmit}>
      <!-- Username -->
      <div class="field">
        <label for="username">Roblox Username <span class="required">*</span></label>
        <input
          id="username"
          type="text"
          placeholder="e.g. Builderman"
          bind:value={username}
          class:error={errors.username}
          maxlength="20"
          autocomplete="off"
          spellcheck="false"
        />
        {#if errors.username}
          <span class="error-msg">{errors.username}</span>
        {/if}
      </div>

      <!-- Display Name -->
      <div class="field">
        <label for="displayName">Display Name <span class="optional">(optional)</span></label>
        <input
          id="displayName"
          type="text"
          placeholder="Defaults to username"
          bind:value={displayName}
          maxlength="40"
        />
      </div>

      <!-- Status -->
      <div class="field">
        <label for="status">Status <span class="required">*</span></label>
        <div class="select-wrapper">
          <select id="status" bind:value={status}>
            {#each STATUS_OPTIONS as opt}
              <option value={opt}>{opt}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Game (only when In Game) -->
      {#if status === 'In Game'}
        <div class="field">
          <label for="game">Game Name <span class="required">*</span></label>
          <input
            id="game"
            type="text"
            placeholder="e.g. Adopt Me!"
            bind:value={game}
            class:error={errors.game}
            maxlength="80"
          />
          {#if errors.game}
            <span class="error-msg">{errors.game}</span>
          {/if}
        </div>
      {/if}

      <!-- Notes -->
      <div class="field">
        <label for="notes">Notes <span class="optional">(optional)</span></label>
        <textarea
          id="notes"
          placeholder="Any notes about this player…"
          bind:value={notes}
          rows="2"
          maxlength="200"
        ></textarea>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={() => dispatch('cancel')}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          {player ? 'Save Changes' : 'Add Player'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 1rem;
  }

  .modal {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #334155;
    background: #0f172a;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.25rem;
    line-height: 1;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .close-btn:hover {
    color: #f1f5f9;
  }

  .modal-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  .required {
    color: #f87171;
  }

  .optional {
    color: #64748b;
    font-weight: 400;
    font-size: 0.8125rem;
  }

  input,
  textarea,
  select {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    color: #f1f5f9;
    font-size: 0.9375rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
    font-family: inherit;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: #ef4444;
  }

  input.error {
    border-color: #f87171;
  }
  .error-msg {
    font-size: 0.8125rem;
    color: #f87171;
  }

  textarea {
    resize: vertical;
  }

  .select-wrapper {
    position: relative;
  }

  .select-wrapper::after {
    content: '▾';
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
  }

  select {
    appearance: none;
    cursor: pointer;
    padding-right: 2rem;
  }

  select option {
    background: #1e293b;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, transform 0.1s;
    font-family: inherit;
  }

  .btn:active {
    transform: scale(0.97);
  }

  .btn-secondary {
    background: #334155;
    color: #cbd5e1;
  }

  .btn-secondary:hover {
    background: #475569;
  }

  .btn-primary {
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: #fff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }
</style>
