import { CommandHistory } from '../commands/history';
import type { GraphCommand } from '../commands/GraphCommand';
import { deserializeGraph, serializeGraph } from '../serialization';
import type { NormalizedGraph } from '../graphTypes';
import { createEmptyGraph } from './graphFactory';

/**
 * Single writer for graph mutations: executes commands, maintains undo/redo.
 * Rendering layers read `graph` directly and diff imperatively — no React per node.
 */
export class GraphDocModel {
  graph: NormalizedGraph;
  readonly history = new CommandHistory();

  constructor(seed?: NormalizedGraph) {
    this.graph = seed ?? createEmptyGraph();
  }

  execute(cmd: GraphCommand): void {
    cmd.apply(this.graph);
    this.history.push(cmd);
  }

  /** Pops the last command from the undo stack and applies its inverse to the graph. */
  undo(): boolean {
    const cmd = this.history.undo();
    if (!cmd) return false;
    cmd.revert(this.graph);
    return true;
  }

  redo(): boolean {
    const cmd = this.history.redo();
    if (!cmd) return false;
    cmd.apply(this.graph);
    return true;
  }

  toJSON(): string {
    return serializeGraph(this.graph);
  }

  loadJSON(json: string): void {
    this.graph = deserializeGraph(json);
    this.history.clear();
  }

  replaceGraph(g: NormalizedGraph): void {
    this.graph = g;
    this.history.clear();
  }
}
