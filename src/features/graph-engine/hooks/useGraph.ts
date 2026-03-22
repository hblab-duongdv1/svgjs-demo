/**
 * Primary integration hook: mounts `GraphSvgEngine`, wires pointer + wheel input,
 * and exposes command/document helpers. Pair with `useGraphUiStore` for selection/tool.
 */
export { useGraphEditorRuntime as useGraph } from './useGraphEditorRuntime';
