import type { GraphCommand } from './GraphCommand';

const MAX_HISTORY = 200;

export class CommandHistory {
  private past: GraphCommand[] = [];
  private future: GraphCommand[] = [];

  push(cmd: GraphCommand): void {
    this.past.push(cmd);
    if (this.past.length > MAX_HISTORY) this.past.shift();
    this.future.length = 0;
  }

  undo(): GraphCommand | null {
    const cmd = this.past.pop();
    if (!cmd) return null;
    this.future.push(cmd);
    return cmd;
  }

  redo(): GraphCommand | null {
    const cmd = this.future.pop();
    if (!cmd) return null;
    this.past.push(cmd);
    return cmd;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  clear(): void {
    this.past.length = 0;
    this.future.length = 0;
  }
}
