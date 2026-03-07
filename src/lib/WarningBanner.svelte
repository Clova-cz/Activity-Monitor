<script>
  let dismissed = false;
</script>

{#if !dismissed}
  <div class="warning-banner" role="alert">
    <div class="warning-content">
      <span class="warning-icon">⚠️</span>
      <div class="warning-text">
        <strong>NOT FOR PRODUCTION USE</strong>
        <span>
          This application was AI-generated and is intended for demonstration
          purposes only. Do not use in a production environment. Data is stored
          locally in your browser and is not secured.
        </span>
      </div>
    </div>
    <button
      class="dismiss-btn"
      on:click={() => (dismissed = true)}
      aria-label="Dismiss warning"
    >
      ✕
    </button>
  </div>
{/if}

<style>
  .warning-banner {
    background: linear-gradient(135deg, #7c2d12, #9a3412);
    border-bottom: 3px solid #f97316;
    color: #fff7ed;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.875rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .warning-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    flex: 1;
  }

  .warning-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    line-height: 1.4;
  }

  .warning-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    line-height: 1.4;
  }

  .warning-text strong {
    font-size: 0.9375rem;
    letter-spacing: 0.05em;
    color: #fde68a;
  }

  .dismiss-btn {
    background: transparent;
    border: 1px solid rgba(255, 247, 237, 0.4);
    color: #fff7ed;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    flex-shrink: 0;
    line-height: 1;
    transition: background 0.15s;
  }

  .dismiss-btn:hover {
    background: rgba(255, 247, 237, 0.15);
  }
</style>
