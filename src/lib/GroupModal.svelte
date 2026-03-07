<script>
  import { createEventDispatcher } from 'svelte';

  export let group = null; // null = create mode, object = edit mode

  const dispatch = createEventDispatcher();

  let name = group?.name ?? '';
  let description = group?.description ?? '';
  let errors = {};

  function validate() {
    errors = {};
    if (!name.trim()) errors.name = 'Group name is required.';
    else if (name.trim().length < 2) errors.name = 'Group name must be at least 2 characters.';
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    dispatch('save', { name: name.trim(), description: description.trim() });
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
  aria-labelledby="group-modal-title"
  tabindex="-1"
  on:keydown={handleKeydown}
>
  <div class="modal">
    <header class="modal-header">
      <h2 id="group-modal-title">{group ? 'Edit Group' : 'New Group'}</h2>
      <button class="close-btn" on:click={() => dispatch('cancel')} aria-label="Close">✕</button>
    </header>

    <form class="modal-body" on:submit|preventDefault={handleSubmit}>
      <div class="field">
        <label for="group-name">Group Name <span class="required">*</span></label>
        <input
          id="group-name"
          type="text"
          placeholder="e.g. Alpha Squad"
          bind:value={name}
          class:error={errors.name}
          maxlength="50"
          autocomplete="off"
          spellcheck="false"
        />
        {#if errors.name}
          <span class="error-msg">{errors.name}</span>
        {/if}
      </div>

      <div class="field">
        <label for="group-desc">Description <span class="optional">(optional)</span></label>
        <textarea
          id="group-desc"
          placeholder="Brief description of this group…"
          bind:value={description}
          rows="2"
          maxlength="200"
        ></textarea>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={() => dispatch('cancel')}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          {group ? 'Save Changes' : 'Create Group'}
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
    max-width: 420px;
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

  .required { color: #f87171; }
  .optional { color: #64748b; font-weight: 400; font-size: 0.8125rem; }

  input,
  textarea {
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
  textarea:focus { border-color: #ef4444; }

  input.error { border-color: #f87171; }

  .error-msg { font-size: 0.8125rem; color: #f87171; }

  textarea { resize: vertical; }

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

  .btn:active { transform: scale(0.97); }

  .btn-secondary { background: #334155; color: #cbd5e1; }
  .btn-secondary:hover { background: #475569; }

  .btn-primary { background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; }
  .btn-primary:hover { opacity: 0.9; }
</style>
