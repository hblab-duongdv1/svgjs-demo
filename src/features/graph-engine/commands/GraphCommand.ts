import type { NormalizedGraph } from '../graphTypes';

/**
 * Command pattern: `apply` / `revert` mutate the normalized graph in place.
 * History stores executed instances so `revert` can undo without snapshots.
 */
export interface GraphCommand {
  readonly label: string;
  apply(graph: NormalizedGraph): void;
  revert(graph: NormalizedGraph): void;
}
