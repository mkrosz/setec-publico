// Acessibilidade compartilhada dos modais (palestra e minicurso):
// guarda o elemento que abriu o modal, move o foco para o botão de fechar,
// prende o Tab/Shift+Tab dentro do conteúdo do modal, fecha com Esc e,
// ao fechar, devolve o foco para quem abriu.

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalA11yOptions {
  /** Áreas do modal que fazem parte do "loop" de foco, na ordem visual. */
  scopes: () => (HTMLElement | null)[];
  /** Elemento que recebe o foco ao abrir (normalmente o botão Fechar). */
  initialFocus: () => HTMLElement | null;
  /** Chamado ao apertar Esc com o modal aberto. */
  onEscape: () => void;
}

function isVisible(el: HTMLElement): boolean {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
}

export function createModalA11y({ scopes, initialFocus, onEscape }: ModalA11yOptions) {
  let previous: HTMLElement | null = null;
  let active = false;

  function focusables(): HTMLElement[] {
    return scopes()
      .filter((s): s is HTMLElement => !!s)
      .flatMap((scope) => Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE)))
      .filter(isVisible);
  }

  function onKeydown(e: KeyboardEvent) {
    if (!active) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;

    const items = focusables();
    if (items.length === 0) {
      e.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const current = document.activeElement as HTMLElement | null;
    const inside = !!current && items.includes(current);

    if (e.shiftKey) {
      if (!inside || current === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (!inside || current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return {
    /** Chamar logo depois de deixar o modal visível. */
    activate() {
      if (!active) {
        const el = document.activeElement;
        previous = el instanceof HTMLElement && el !== document.body ? el : null;
      }
      active = true;
      document.addEventListener('keydown', onKeydown);
      const target = initialFocus() ?? focusables()[0] ?? null;
      target?.focus({ preventScroll: true });
    },
    /** Chamar ao fechar o modal. */
    deactivate() {
      if (!active) return;
      active = false;
      document.removeEventListener('keydown', onKeydown);
      if (previous && previous.isConnected) previous.focus({ preventScroll: true });
      previous = null;
    },
  };
}
