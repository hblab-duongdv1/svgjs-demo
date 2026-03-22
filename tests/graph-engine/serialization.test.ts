import { describe, expect, it } from 'vitest';

import { AddEdgeCommand, AddNodeCommand } from '../../src/features/graph-engine/commands/implementations';
import { GraphDocModel } from '../../src/features/graph-engine/model/GraphDocModel';
import { deserializeGraph, serializeGraph } from '../../src/features/graph-engine/serialization';

describe('graph serialization', () => {
  it('round-trips normalized graph', () => {
    const m = new GraphDocModel();
    m.execute(
      new AddNodeCommand({
        id: 'a',
        type: 'task',
        x: 0,
        y: 0,
        w: 100,
        h: 50,
        label: 'A',
      }),
    );
    m.execute(
      new AddNodeCommand({
        id: 'b',
        type: 'task',
        x: 200,
        y: 0,
        w: 100,
        h: 50,
        label: 'B',
      }),
    );
    m.execute(
      new AddEdgeCommand({
        id: 'e1',
        sourceNodeId: 'a',
        sourcePort: 'out',
        targetNodeId: 'b',
        targetPort: 'in',
      }),
    );

    const json = serializeGraph(m.graph);
    const back = deserializeGraph(json);
    expect(back.nodes.a?.label).toBe('A');
    expect(back.edges.e1?.targetNodeId).toBe('b');
  });
});
