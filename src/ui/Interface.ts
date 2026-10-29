import {
  CATEGORY_BY_ID,
  PARTS,
  groupPartsByCategory,
  type PartId,
  type PartInfo,
} from '../domain/parts';
import { SIGNAL_PATH, type SignalStage } from '../domain/signal';
import type { ViewPreset } from '../scene/camera';
import type { QualityTier } from '../scene/quality';

export interface InterfaceCallbacks {
  readonly onSelectPart: (partId: PartId) => void;
  readonly onClearSelection: () => void;
  readonly onFocusPart: (partId: PartId) => void;
  readonly onPreviewPart: (partId: PartId | null) => void;
  readonly onToggleExplode: () => void;
  readonly onPreset: (preset: ViewPreset) => void;
  readonly onCycleQuality: () => void;
  readonly onTourStart: () => void;
  readonly onTourNext: () => void;
  readonly onTourPrevious: () => void;
  readonly onTourExit: () => void;
  readonly onTourStage: (index: number) => void;
  readonly onFocusStagePart: (partId: PartId) => void;
}

export class Interface {
  private readonly callbacks: InterfaceCallbacks;
  private readonly tooltip: HTMLElement;
  private readonly inspector: HTMLElement;
  private readonly partsList: HTMLElement;
  private readonly searchInput: HTMLInputElement;
  private readonly partCount: HTMLElement;
  private readonly indexPanel: HTMLElement;
  private readonly indexToggle: HTMLButtonElement;
  private readonly explodeButton: HTMLButtonElement;
  private readonly qualityButton: HTMLButtonElement;
  private readonly tourBar: HTMLElement;
  private readonly tourCta: HTMLElement;
  private readonly hint: HTMLElement;
  private readonly loading: HTMLElement;
  private readonly fallback: HTMLElement;
  private readonly tourStep: HTMLElement;
  private readonly tourKicker: HTMLElement;
  private readonly tourTitle: HTMLElement;
  private readonly tourDots: HTMLElement;
  private pinned: PartInfo | null = null;
  private stageMode = false;
  private hoverId: PartId | null = null;
  private filter = '';
  private hintTimer = 0;

  constructor(callbacks: InterfaceCallbacks) {
    this.callbacks = callbacks;
    this.tooltip = required('tooltip');
    this.inspector = required('inspector');
    this.partsList = required('parts-list');
    this.searchInput = required<HTMLInputElement>('part-search');
    this.partCount = required('part-count');
    this.indexPanel = required('index-panel');
    this.indexToggle = required<HTMLButtonElement>('index-toggle');
    this.explodeButton = required<HTMLButtonElement>('explode-button');
    this.qualityButton = required<HTMLButtonElement>('quality-button');
    this.tourBar = required('tour-bar');
    this.tourCta = required('tour-cta');
    this.hint = required('hint');
    this.loading = required('loading');
    this.fallback = required('fallback');
    this.tourStep = required('tour-step');
    this.tourKicker = required('tour-kicker');
    this.tourTitle = required('tour-title');
    this.tourDots = required('tour-dots');

    this.renderParts();
    this.bindToolbar();
    this.bindIndex();
    this.bindTour();
    this.partCount.textContent = String(PARTS.length);
    if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) {
      this.hint.textContent = 'Tap a part · Drag to orbit · Pinch to zoom';
    }
    this.showHint();
  }

  setLoading(ready: boolean): void {
    if (!ready) {
      this.loading.classList.remove('is-ready');
      return;
    }
    this.loading.classList.add('is-ready');
    window.setTimeout(() => {
      this.loading.hidden = true;
    }, 700);
  }

  setHover(part: PartInfo | null, x = 0, y = 0): void {
    if (!part) {
      this.hoverId = null;
      this.tooltip.classList.remove('is-visible');
      this.tooltip.hidden = true;
      return;
    }
    if (this.hoverId !== part.id) {
      this.hoverId = part.id;
      this.tooltip.replaceChildren();
      const category = el('span', 'tooltip__category', CATEGORY_BY_ID[part.category].label);
      const name = el('strong', 'tooltip__name', part.name);
      const copy = el('span', 'tooltip__copy', part.tagline);
      const foot = el('span', 'tooltip__foot', 'Click to pin');
      this.tooltip.append(category, name, copy, foot);
    }
    this.tooltip.hidden = false;
    this.tooltip.classList.add('is-visible');

    const rect = this.tooltip.getBoundingClientRect();
    const pad = 14;
    let left = x + 18;
    let top = y + 20;
    if (left + rect.width + pad > window.innerWidth) left = x - rect.width - 18;
    if (top + rect.height + pad > window.innerHeight) top = y - rect.height - 16;
    left = Math.max(pad, Math.min(left, window.innerWidth - rect.width - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - rect.height - pad));
    this.tooltip.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    this.hideHint();
  }

  setPinned(part: PartInfo | null): void {
    this.pinned = part;
    this.updateActiveParts();
    if (part) {
      this.stageMode = false;
      this.renderPartInspector(part);
      this.openInspector();
    } else if (!this.stageMode) {
      this.closeInspector();
    }
  }

  setStage(stage: SignalStage | null, index = 0): void {
    if (!stage) {
      this.stageMode = false;
      if (this.pinned) {
        this.renderPartInspector(this.pinned);
        this.openInspector();
      } else {
        this.closeInspector();
      }
      this.tourBar.hidden = true;
      this.tourCta.hidden = false;
      document.body.classList.remove('tour-active');
      return;
    }

    this.stageMode = true;
    this.renderStageInspector(stage, index);
    this.openInspector();
    this.tourBar.hidden = false;
    this.tourCta.hidden = true;
    document.body.classList.add('tour-active');
    this.tourStep.textContent = `${index + 1} / ${SIGNAL_PATH.length}`;
    this.tourKicker.textContent = stage.kicker;
    this.tourTitle.textContent = stage.title;
    this.updateDots(index);
  }

  setExploded(exploded: boolean): void {
    this.explodeButton.setAttribute('aria-pressed', String(exploded));
    this.explodeButton.classList.toggle('is-active', exploded);
    this.explodeButton.textContent = exploded ? 'Assemble' : 'Explode';
  }

  setQuality(tier: QualityTier, label: string): void {
    this.qualityButton.dataset.tier = tier;
    this.qualityButton.textContent = label;
    this.qualityButton.title = `Rendering quality: ${label}. Click to cycle.`;
  }

  setPreset(preset: ViewPreset): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-view]')) {
      button.classList.toggle('is-active', button.dataset.view === preset);
    }
  }

  setIndexOpen(open: boolean): void {
    this.indexPanel.classList.toggle('is-open', open);
    this.indexToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('index-open', open);
  }

  isIndexOpen(): boolean {
    return this.indexPanel.classList.contains('is-open');
  }

  focusSearch(): void {
    this.setIndexOpen(true);
    this.searchInput.focus();
    this.searchInput.select();
  }

  toggleIndex(): void {
    this.setIndexOpen(!this.indexPanel.classList.contains('is-open'));
  }

  showHint(): void {
    window.clearTimeout(this.hintTimer);
    this.hint.classList.remove('is-hidden');
    this.hintTimer = window.setTimeout(() => this.hint.classList.add('is-hidden'), 9000);
  }

  hideHint(): void {
    window.clearTimeout(this.hintTimer);
    this.hint.classList.add('is-hidden');
  }

  showFallback(reason: string): void {
    this.loading.hidden = true;
    this.fallback.hidden = false;
    document.body.classList.add('no-webgl');
    this.fallback.replaceChildren();

    const card = el('div', 'fallback__card');
    card.append(
      el('p', 'eyebrow', 'WebGL unavailable'),
      el('h2', 'fallback__title', 'The instrument needs WebGL'),
      el(
        'p',
        'fallback__lede',
        'The 3D model cannot start in this browser. The complete anatomy and signal path are still here as text.',
      ),
    );

    const columns = el('div', 'fallback__columns');
    const partsColumn = el('section', 'fallback__column');
    partsColumn.append(el('h3', '', 'The parts'));
    for (const group of groupPartsByCategory()) {
      const block = el('div', 'fallback__group');
      block.append(el('h4', '', group.category.label));
      const list = el('dl', 'fallback__parts');
      for (const part of group.parts) {
        list.append(el('dt', '', part.name), el('dd', '', part.tagline));
      }
      block.append(list);
      partsColumn.append(block);
    }

    const signalColumn = el('section', 'fallback__column');
    signalColumn.append(el('h3', '', 'The signal path'));
    const stages = el('ol', 'fallback__stages');
    for (const stage of SIGNAL_PATH) {
      const item = el('li', '');
      item.append(el('strong', '', stage.title), el('p', '', stage.detail));
      stages.append(item);
    }
    signalColumn.append(stages);

    columns.append(partsColumn, signalColumn);
    card.append(columns, el('p', 'fallback__reason', `Reason: ${reason}`));
    this.fallback.append(card);
  }

  private bindToolbar(): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-view]')) {
      button.addEventListener('click', () => {
        const preset = button.dataset.view as ViewPreset | undefined;
        if (!preset) return;
        this.callbacks.onPreset(preset);
        this.setPreset(preset);
      });
    }
    this.explodeButton.addEventListener('click', () => this.callbacks.onToggleExplode());
    this.qualityButton.addEventListener('click', () => this.callbacks.onCycleQuality());
  }

  private bindIndex(): void {
    this.searchInput.addEventListener('input', () => {
      this.filter = this.searchInput.value.trim().toLowerCase();
      this.renderParts();
    });
    this.partsList.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...this.partsList.querySelectorAll<HTMLButtonElement>('button[data-part-id]')];
      if (buttons.length === 0) return;
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      let next = 0;
      if (event.key === 'ArrowDown') next = Math.min(buttons.length - 1, current + 1);
      else if (event.key === 'ArrowUp') next = Math.max(0, current - 1);
      else if (event.key === 'End') next = buttons.length - 1;
      else next = 0;
      event.preventDefault();
      buttons[next]?.focus();
    });
    this.indexToggle.addEventListener('click', () => this.toggleIndex());
    this.inspector.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[data-close-inspector]')) {
        this.callbacks.onClearSelection();
        return;
      }
      const focus = target.closest<HTMLElement>('[data-focus-part]');
      if (focus?.dataset.focusPart) {
        this.callbacks.onFocusPart(focus.dataset.focusPart as PartId);
        return;
      }
      const stage = target.closest<HTMLElement>('[data-stage-index]');
      if (stage?.dataset.stageIndex) {
        this.callbacks.onTourStage(Number(stage.dataset.stageIndex));
        return;
      }
      const stagePart = target.closest<HTMLElement>('[data-stage-part]');
      if (stagePart?.dataset.stagePart) {
        this.callbacks.onFocusStagePart(stagePart.dataset.stagePart as PartId);
      }
    });
  }

  private bindTour(): void {
    required<HTMLButtonElement>('tour-start').addEventListener('click', () => this.callbacks.onTourStart());
    required<HTMLButtonElement>('tour-prev').addEventListener('click', () => this.callbacks.onTourPrevious());
    required<HTMLButtonElement>('tour-next').addEventListener('click', () => this.callbacks.onTourNext());
    required<HTMLButtonElement>('tour-exit').addEventListener('click', () => this.callbacks.onTourExit());
    for (const [index, stage] of SIGNAL_PATH.entries()) {
      const dot = el('button', 'tour__dot');
      dot.type = 'button';
      dot.title = `${index + 1}. ${stage.title}`;
      dot.setAttribute('aria-label', `Go to stage ${index + 1}: ${stage.title}`);
      dot.addEventListener('click', () => this.callbacks.onTourStage(index));
      this.tourDots.append(dot);
    }
  }

  private renderParts(): void {
    this.partsList.replaceChildren();
    const query = this.filter;
    const visible = query
      ? PARTS.filter((part) => {
          const category = CATEGORY_BY_ID[part.category].label;
          return `${part.name} ${part.shortName} ${part.tagline} ${part.material} ${category}`.toLowerCase().includes(query);
        })
      : PARTS;
    const groups = groupPartsByCategory(visible);
    if (groups.length === 0) {
      this.partsList.append(el('p', 'index__empty', 'No part matches that search.'));
      this.partCount.textContent = `0 of ${PARTS.length}`;
      return;
    }

    for (const group of groups) {
      const section = el('section', 'index__group');
      const heading = el('h3', 'index__heading');
      heading.append(
        el('span', '', group.category.label),
        el('span', 'index__count', String(group.parts.length)),
      );
      section.append(heading);
      const list = el('div', 'index__items');
      for (const part of group.parts) {
        const button = el('button', 'index__part');
        button.type = 'button';
        button.dataset.partId = part.id;
        button.dataset.category = part.category;
        button.setAttribute('aria-pressed', String(this.pinned?.id === part.id));
        const dot = el('span', 'index__dot');
        dot.dataset.category = part.category;
        button.append(dot, el('span', 'index__label', part.shortName));
        button.addEventListener('mouseenter', () => this.callbacks.onPreviewPart(part.id));
        button.addEventListener('mouseleave', () => this.callbacks.onPreviewPart(null));
        button.addEventListener('focus', () => this.callbacks.onPreviewPart(part.id));
        button.addEventListener('blur', () => this.callbacks.onPreviewPart(null));
        button.addEventListener('click', () => {
          this.callbacks.onSelectPart(part.id);
          this.hideHint();
          this.setIndexOpen(false);
        });
        list.append(button);
      }
      section.append(list);
      this.partsList.append(section);
    }
    this.partCount.textContent = query ? `${visible.length} of ${PARTS.length}` : String(PARTS.length);
    this.updateActiveParts();
  }

  private updateActiveParts(): void {
    for (const button of this.partsList.querySelectorAll<HTMLButtonElement>('button[data-part-id]')) {
      const active = button.dataset.partId === this.pinned?.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      if (active) button.scrollIntoView({ block: 'nearest' });
    }
  }

  private renderPartInspector(part: PartInfo): void {
    this.inspector.replaceChildren();
    const inner = el('div', 'inspector__inner');

    const close = iconButton('Close details', '×');
    close.dataset.closeInspector = 'true';
    const top = el('div', 'inspector__top');
    const eyebrow = el('p', 'eyebrow');
    eyebrow.textContent = CATEGORY_BY_ID[part.category].label;
    top.append(eyebrow, close);

    const name = el('h2', 'inspector__name', part.name);
    const tagline = el('p', 'inspector__tagline', part.tagline);

    const purpose = section('What it does', part.purpose);
    const mechanism = section('How it works', part.mechanism);

    const meta = el('dl', 'inspector__meta');
    meta.append(el('dt', '', 'Material'), el('dd', '', part.material));
    if (part.signalStage) {
      const stageIndex = SIGNAL_PATH.findIndex((stage) => stage.id === part.signalStage);
      const stage = SIGNAL_PATH[stageIndex];
      const dt = el('dt', '', 'Signal path');
      const dd = el('dd', '');
      if (stage) {
        const chip = el('button', 'signal-chip');
        chip.type = 'button';
        chip.dataset.stageIndex = String(stageIndex);
        chip.textContent = `${String(stageIndex + 1).padStart(2, '0')} · ${stage.title}`;
        dd.append(chip);
      } else {
        dd.textContent = '—';
      }
      meta.append(dt, dd);
    }

    const fact = el('aside', 'inspector__fact');
    fact.append(el('span', 'inspector__fact-label', 'Field note'), el('p', '', part.fact));

    const actions = el('div', 'inspector__actions');
    const focus = el('button', 'button button--primary', 'Frame the part');
    focus.type = 'button';
    focus.dataset.focusPart = part.id;
    const clear = el('button', 'button button--ghost', 'Clear');
    clear.type = 'button';
    clear.dataset.closeInspector = 'true';
    actions.append(focus, clear);

    inner.append(top, name, tagline, purpose, mechanism, meta, fact, actions);
    this.inspector.append(inner);
    this.inspector.scrollTop = 0;
  }

  private renderStageInspector(stage: SignalStage, index: number): void {
    this.inspector.replaceChildren();
    const inner = el('div', 'inspector__inner inspector__inner--stage');

    const close = iconButton('Exit the signal path', '×');
    close.dataset.closeInspector = 'true';
    const top = el('div', 'inspector__top');
    const eyebrow = el('p', 'eyebrow', `Signal path · ${index + 1} of ${SIGNAL_PATH.length}`);
    top.append(eyebrow, close);

    const kicker = el('p', 'stage__kicker', stage.kicker);
    const title = el('h2', 'inspector__name', stage.title);
    const summary = el('p', 'stage__summary', stage.summary);
    const detail = el('p', 'inspector__body', stage.detail);

    inner.append(top, kicker, title, summary, detail);

    if (stage.outsideInstrument) {
      const note = el('aside', 'inspector__fact');
      note.append(
        el('span', 'inspector__fact-label', 'Beyond the instrument'),
        el(
          'p',
          '',
          'The amplifier is not part of the guitar. It is the destination of the signal the guitar produces.',
        ),
      );
      inner.append(note);
    }

    if (stage.partIds.length > 0) {
      const actions = el('div', 'inspector__actions');
      for (const partId of stage.partIds) {
        const part = PARTS.find((candidate) => candidate.id === partId);
        if (!part) continue;
        const button = el('button', 'button button--primary', `Frame the ${part.shortName.toLowerCase()}`);
        button.type = 'button';
        button.dataset.stagePart = part.id;
        actions.append(button);
      }
      const exit = el('button', 'button button--ghost', 'Leave the tour');
      exit.type = 'button';
      exit.dataset.closeInspector = 'true';
      actions.append(exit);
      inner.append(actions);
    }

    this.inspector.append(inner);
    this.inspector.scrollTop = 0;
  }

  private openInspector(): void {
    this.inspector.classList.add('is-open');
    this.inspector.setAttribute('aria-hidden', 'false');
    document.body.classList.add('inspector-open');
    this.hideHint();
  }

  private closeInspector(): void {
    this.inspector.classList.remove('is-open');
    this.inspector.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('inspector-open');
  }

  private updateDots(active: number): void {
    const dots = [...this.tourDots.querySelectorAll<HTMLButtonElement>('.tour__dot')];
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === active);
      dot.classList.toggle('is-past', index < active);
      dot.setAttribute('aria-current', index === active ? 'step' : 'false');
    });
  }
}

function required<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function iconButton(label: string, glyph: string): HTMLButtonElement {
  const button = el('button', 'icon-button', glyph);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}

function section(title: string, body: string): HTMLElement {
  const wrapper = el('section', 'inspector__section');
  wrapper.append(el('h3', 'inspector__label', title), el('p', 'inspector__body', body));
  return wrapper;
}
