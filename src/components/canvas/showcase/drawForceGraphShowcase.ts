import type { Circle, G, Line, Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

type GraphNode = {
  id: string;
  group: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
};

type GraphLink = {
  source: GraphNode;
  target: GraphNode;
  value: number;
};

type MiserablesPayload = {
  nodes: Array<{ id: string; group: number }>;
  links: Array<{ source: string; target: string; value: number }>;
};

const DATA_URL =
  'https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json';
const WIDTH = 800;
const HEIGHT = 600;
const PALETTE = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];
const FORCE_GRAPH_CLEANUP_KEY = '__force_graph_cleanup__';
const LINK_COLOR = '#9CA3AF';
const LINK_ACTIVE_COLOR = '#F59E0B';
const NODE_STROKE_COLOR = '#FFFFFF';
const DEFAULT_NODE_SIZE = 5;
const DEFAULT_LINK_DISTANCE = 44;
const DEFAULT_REPULSION = 2800;

function colorByGroup(group: number): string {
  return PALETTE[Math.abs(group) % PALETTE.length];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function makeGraph(
  payload: MiserablesPayload,
  nodeLimit: number,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const limitedNodes = payload.nodes.slice(0, nodeLimit);
  const allowedNodeIds = new Set(limitedNodes.map((node) => node.id));
  const nodes = limitedNodes.map((node, index) => ({
    ...node,
    x: 120 + ((index * 37) % 560),
    y: 120 + ((index * 53) % 360),
    vx: 0,
    vy: 0,
    fx: null,
    fy: null,
  }));
  const index = new Map(nodes.map((node) => [node.id, node]));
  const links: GraphLink[] = [];
  for (const link of payload.links) {
    if (!allowedNodeIds.has(link.source) || !allowedNodeIds.has(link.target)) {
      continue;
    }
    const source = index.get(link.source);
    const target = index.get(link.target);
    if (!source || !target) {
      continue;
    }
    links.push({ source, target, value: link.value });
  }

  return { nodes, links };
}

function runForceTick(
  nodes: GraphNode[],
  links: GraphLink[],
  alpha: number,
  linkDistance: number,
  repulsion: number,
): void {
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const desiredLinkLength = linkDistance;
  const spring = 0.012;
  const centerPull = 0.0014;
  const damping = 0.88;

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy + 0.01;
      const dist = Math.sqrt(distSq);
      const force = (repulsion * alpha) / distSq;
      const fx = (force * dx) / dist;
      const fy = (force * dy) / dist;
      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
    }
  }

  for (const link of links) {
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const delta = dist - desiredLinkLength;
    const force = spring * delta * alpha;
    const fx = (force * dx) / dist;
    const fy = (force * dy) / dist;
    link.source.vx += fx;
    link.source.vy += fy;
    link.target.vx -= fx;
    link.target.vy -= fy;
  }

  for (const node of nodes) {
    node.vx += (centerX - node.x) * centerPull * alpha;
    node.vy += (centerY - node.y) * centerPull * alpha;

    node.vx *= damping;
    node.vy *= damping;

    if (node.fx !== null && node.fy !== null) {
      node.x = node.fx;
      node.y = node.fy;
      node.vx *= 0.5;
      node.vy *= 0.5;
      continue;
    }

    node.x = clamp(node.x + node.vx, 24, WIDTH - 24);
    node.y = clamp(node.y + node.vy, 96, HEIGHT - 28);
  }
}

function clientToSvgPoint(draw: Svg, clientX: number, clientY: number): { x: number; y: number } {
  const root = draw.node;
  const point = root.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = root.getScreenCTM();
  if (!matrix) {
    return { x: clientX, y: clientY };
  }
  const transformed = point.matrixTransform(matrix.inverse());
  return { x: transformed.x, y: transformed.y };
}

function drawGraph(
  draw: Svg,
  content: G,
  nodes: GraphNode[],
  links: GraphLink[],
  props: SvgModuleProps,
): () => void {
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const nodeSize = clamp(props.forceNodeSize ?? DEFAULT_NODE_SIZE, 2, 18);
  const linkDistance = clamp(props.forceLinkDistance ?? DEFAULT_LINK_DISTANCE, 20, 120);
  const repulsion = clamp(props.forceRepulsion ?? DEFAULT_REPULSION, 400, 8000);
  const useGroupColors = props.forceUseGroupColors !== false;
  const staticNodeColor = props.forceNodeColor || fill;
  const resolveNodeColor = (node: GraphNode) =>
    useGroupColors ? colorByGroup(node.group) : staticNodeColor;

  content
    .plain('Force graph showcase (SVG.js) - Les Miserables network')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .center(WIDTH / 2, 46);

  content
    .plain(
      useGroupColors
        ? 'Link width follows "value", node color follows "group"'
        : 'Link width follows "value", node color follows property',
    )
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.72)
    .center(WIDTH / 2, 70);

  const graphLayer = content.group().translate(0, 8);
  const linkLayer = graphLayer.group().stroke({ color: LINK_COLOR, opacity: 0.65 });
  const nodeLayer = graphLayer.group().stroke({ color: NODE_STROKE_COLOR, width: 1.2 });

  const linkElements: Line[] = links.map((link) =>
    linkLayer
      .line(link.source.x, link.source.y, link.target.x, link.target.y)
      .stroke({ width: Math.max(1, Math.sqrt(Math.max(link.value, 1))) }),
  );

  const nodeElements: Circle[] = nodes.map((node) =>
    nodeLayer.circle(nodeSize * 2).center(node.x, node.y).fill(resolveNodeColor(node)),
  );

  const linkedByNode = new Map<string, Set<string>>();
  for (const node of nodes) {
    linkedByNode.set(node.id, new Set([node.id]));
  }
  for (const link of links) {
    linkedByNode.get(link.source.id)?.add(link.target.id);
    linkedByNode.get(link.target.id)?.add(link.source.id);
  }

  let selectedNodeId: string | null = null;
  let draggedNode: GraphNode | null = null;
  let frameId: number | null = null;
  let alpha = 1;
  let alphaTarget = 0;
  const alphaDecay = 0.028;
  const alphaMin = 0.003;

  const applyStyles = () => {
    const selectedNeighbors = selectedNodeId ? linkedByNode.get(selectedNodeId) : null;

    for (const [index, node] of nodes.entries()) {
      const isActive = !selectedNeighbors || selectedNeighbors.has(node.id);
      const isSelected = selectedNodeId === node.id;
      nodeElements[index]
        .fill(resolveNodeColor(node))
        .opacity(isActive ? 1 : 0.18)
        .stroke({
          color: isSelected ? LINK_ACTIVE_COLOR : NODE_STROKE_COLOR,
          width: isSelected ? 2.6 : 1.2,
        })
        .radius(isSelected ? nodeSize + 1.5 : nodeSize);
    }

    for (const [index, link] of links.entries()) {
      const isActive =
        !selectedNodeId ||
        link.source.id === selectedNodeId ||
        link.target.id === selectedNodeId;
      linkElements[index]
        .stroke({
          width: Math.max(1, Math.sqrt(Math.max(link.value, 1))),
          color: isActive ? LINK_ACTIVE_COLOR : LINK_COLOR,
          opacity: isActive ? 0.9 : 0.14,
        })
        .back();
    }
  };

  for (const [index, node] of nodes.entries()) {
    nodeElements[index]
      .attr('data-node-id', node.id)
      .attr('title', node.id)
      .css({ cursor: 'grab' });
    nodeElements[index].on('click', () => {
      selectedNodeId = selectedNodeId === node.id ? null : node.id;
      applyStyles();
      alphaTarget = 0.04;
    });
    nodeElements[index].on('pointerdown', (event: Event) => {
      if (!(event instanceof PointerEvent)) {
        return;
      }
      event.preventDefault();
      draggedNode = node;
      const pt = clientToSvgPoint(draw, event.clientX, event.clientY);
      node.fx = clamp(pt.x, 24, WIDTH - 24);
      node.fy = clamp(pt.y, 96, HEIGHT - 28);
      selectedNodeId = node.id;
      nodeElements[index].css({ cursor: 'grabbing' });
      alphaTarget = 0.28;
      applyStyles();
    });
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!draggedNode) {
      return;
    }
    const pt = clientToSvgPoint(draw, event.clientX, event.clientY);
    draggedNode.fx = clamp(pt.x, 24, WIDTH - 24);
    draggedNode.fy = clamp(pt.y, 96, HEIGHT - 28);
    alphaTarget = 0.3;
  };

  const onPointerUp = () => {
    if (!draggedNode) {
      return;
    }
    draggedNode.fx = null;
    draggedNode.fy = null;
    draggedNode = null;
    alphaTarget = 0;
    for (const nodeEl of nodeElements) {
      nodeEl.css({ cursor: 'grab' });
    }
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  const legend = content.group().translate(18, 540);
  legend.rect(260, 42).radius(8).fill(fill).opacity(0.08);
  legend
    .plain(`${nodes.length} nodes • ${links.length} links`)
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .move(14, 14);

  content
    .plain('Drag node to move · Click node to highlight neighbors')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'end',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.65)
    .move(WIDTH - 18, 552);

  const tick = () => {
    alpha += (alphaTarget - alpha) * 0.14;
    alpha *= 1 - alphaDecay;
    if (alpha < alphaMin) {
      alpha = alphaMin;
    }
    runForceTick(nodes, links, alpha, linkDistance, repulsion);
    for (const [index, link] of links.entries()) {
      linkElements[index].plot(link.source.x, link.source.y, link.target.x, link.target.y);
    }
    for (const [index, node] of nodes.entries()) {
      nodeElements[index].center(node.x, node.y);
    }
    frameId = window.requestAnimationFrame(tick);
  };

  applyStyles();
  frameId = window.requestAnimationFrame(tick);

  return () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };
}

function drawError(content: G, message: string): void {
  content
    .plain('Cannot load network data')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill('#DC2626')
    .center(WIDTH / 2, HEIGHT / 2 - 10);
  content
    .plain(message)
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.8)
    .center(WIDTH / 2, HEIGHT / 2 + 18);
}

export function drawForceGraphShowcase(draw: Svg, props: SvgModuleProps): void {
  const known = draw as unknown as Record<string, unknown>;
  const prevCleanup = known[FORCE_GRAPH_CLEANUP_KEY];
  if (typeof prevCleanup === 'function') {
    (prevCleanup as () => void)();
  }

  const { content } = prepareStage(draw);

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json() as Promise<MiserablesPayload>;
    })
    .then((payload) => {
      const nodeLimit = clamp(props.forceNodeCount ?? payload.nodes.length, 10, payload.nodes.length);
      const { nodes, links } = makeGraph(payload, nodeLimit);
      const cleanup = drawGraph(draw, content, nodes, links, props);
      known[FORCE_GRAPH_CLEANUP_KEY] = cleanup;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      drawError(content, message);
    });
}
