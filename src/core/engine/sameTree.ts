export interface TreeNode {
  id: string;
  value: number | null;
  left: string | null;
  right: string | null;
}

export interface ComparisonStep {
  nodeP: string | null;
  nodeQ: string | null;
  match: boolean;
  reason?: 'both_null' | 'value_match' | 'value_mismatch' | 'structure_mismatch';
}

export interface SameTreeState {
  nodesP: Map<string, TreeNode>;
  nodesQ: Map<string, TreeNode>;
  rootP: string | null;
  rootQ: string | null;
  traversalMode: 'dfs' | 'bfs';
  traversalOrderP: (string | null)[];
  traversalOrderQ: (string | null)[];
  currentIndex: number;
  comparedNodes: Set<string>;
  queueP: string[];
  queueQ: string[];
  mismatch: boolean;
  mismatchReason: string | null;
  mismatchNodeP: string | null;
  mismatchNodeQ: string | null;
  phase: 'select' | 'traversing' | 'done';
  result: 'same' | 'different' | null;
  score: number;
  startTime: number | null;
  endTime: number | null;
  seedP: (number | null)[];
  seedQ: (number | null)[];
}

export type SameTreeAction =
  | { type: 'SET_TRAVERSAL_MODE'; mode: 'dfs' | 'bfs' }
  | { type: 'START' }
  | { type: 'COMPARE_NEXT' }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
  | { type: 'NEW_TREES'; seedP: (number | null)[]; seedQ: (number | null)[] };

function generateNodeId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function buildTreeFromArray(values: (number | null)[]): { nodes: Map<string, TreeNode>; rootId: string | null } {
  if (values.length === 0 || values[0] === null) {
    return { nodes: new Map(), rootId: null };
  }

  const nodes = new Map<string, TreeNode>();
  const ids: (string | null)[] = values.map(v => v !== null ? generateNodeId() : null);
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null || ids[i] === null) continue;
    
    const leftIndex = 2 * i + 1;
    const rightIndex = 2 * i + 2;
    
    nodes.set(ids[i]!, {
      id: ids[i]!,
      value: values[i],
      left: leftIndex < values.length && values[leftIndex] !== null ? ids[leftIndex] : null,
      right: rightIndex < values.length && values[rightIndex] !== null ? ids[rightIndex] : null,
    });
  }

  return { nodes, rootId: ids[0] };
}

// Get DFS order including nulls for comparison
function getDFSOrder(nodes: Map<string, TreeNode>, rootId: string | null): (string | null)[] {
  const order: (string | null)[] = [];
  
  function dfs(nodeId: string | null) {
    order.push(nodeId);
    if (!nodeId) return;
    const node = nodes.get(nodeId);
    if (node) {
      dfs(node.left);
      dfs(node.right);
    }
  }
  
  dfs(rootId);
  return order;
}

// Get BFS order including nulls
function getBFSOrder(nodes: Map<string, TreeNode>, rootId: string | null): (string | null)[] {
  if (!rootId) return [null];
  
  const order: (string | null)[] = [];
  const queue: (string | null)[] = [rootId];
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);
    
    if (nodeId) {
      const node = nodes.get(nodeId);
      if (node) {
        queue.push(node.left);
        queue.push(node.right);
      }
    }
  }
  
  return order;
}

// Synchronized traversal - returns pairs
function getSyncedDFSOrder(
  nodesP: Map<string, TreeNode>, 
  rootP: string | null,
  nodesQ: Map<string, TreeNode>,
  rootQ: string | null
): { orderP: (string | null)[]; orderQ: (string | null)[] } {
  const orderP: (string | null)[] = [];
  const orderQ: (string | null)[] = [];
  
  function dfs(nodeP: string | null, nodeQ: string | null) {
    orderP.push(nodeP);
    orderQ.push(nodeQ);
    
    const pNode = nodeP ? nodesP.get(nodeP) : null;
    const qNode = nodeQ ? nodesQ.get(nodeQ) : null;
    
    // Continue traversal for both, even if one is null
    const hasLeftP = pNode?.left !== undefined;
    const hasLeftQ = qNode?.left !== undefined;
    const hasRightP = pNode?.right !== undefined;
    const hasRightQ = qNode?.right !== undefined;
    
    if (hasLeftP || hasLeftQ) {
      dfs(pNode?.left ?? null, qNode?.left ?? null);
    }
    if (hasRightP || hasRightQ) {
      dfs(pNode?.right ?? null, qNode?.right ?? null);
    }
  }
  
  dfs(rootP, rootQ);
  return { orderP, orderQ };
}

function getSyncedBFSOrder(
  nodesP: Map<string, TreeNode>, 
  rootP: string | null,
  nodesQ: Map<string, TreeNode>,
  rootQ: string | null
): { orderP: (string | null)[]; orderQ: (string | null)[] } {
  const orderP: (string | null)[] = [];
  const orderQ: (string | null)[] = [];
  
  const queueP: (string | null)[] = [rootP];
  const queueQ: (string | null)[] = [rootQ];
  
  while (queueP.length > 0 || queueQ.length > 0) {
    const nodeP = queueP.shift() ?? null;
    const nodeQ = queueQ.shift() ?? null;
    
    orderP.push(nodeP);
    orderQ.push(nodeQ);
    
    const pNode = nodeP ? nodesP.get(nodeP) : null;
    const qNode = nodeQ ? nodesQ.get(nodeQ) : null;
    
    // Add children
    if (pNode || qNode) {
      queueP.push(pNode?.left ?? null);
      queueQ.push(qNode?.left ?? null);
      queueP.push(pNode?.right ?? null);
      queueQ.push(qNode?.right ?? null);
    }
  }
  
  return { orderP, orderQ };
}

export function initSameTree(seedP: (number | null)[], seedQ: (number | null)[]): SameTreeState {
  const { nodes: nodesP, rootId: rootP } = buildTreeFromArray(seedP);
  const { nodes: nodesQ, rootId: rootQ } = buildTreeFromArray(seedQ);
  const { orderP, orderQ } = getSyncedDFSOrder(nodesP, rootP, nodesQ, rootQ);
  
  return {
    nodesP,
    nodesQ,
    rootP,
    rootQ,
    traversalMode: 'dfs',
    traversalOrderP: orderP,
    traversalOrderQ: orderQ,
    currentIndex: -1,
    comparedNodes: new Set(),
    queueP: [],
    queueQ: [],
    mismatch: false,
    mismatchReason: null,
    mismatchNodeP: null,
    mismatchNodeQ: null,
    phase: 'select',
    result: null,
    score: 0,
    startTime: null,
    endTime: null,
    seedP,
    seedQ,
  };
}

export function reducer(state: SameTreeState, action: SameTreeAction): SameTreeState {
  switch (action.type) {
    case 'SET_TRAVERSAL_MODE': {
      const { orderP, orderQ } = action.mode === 'dfs'
        ? getSyncedDFSOrder(state.nodesP, state.rootP, state.nodesQ, state.rootQ)
        : getSyncedBFSOrder(state.nodesP, state.rootP, state.nodesQ, state.rootQ);
      
      return {
        ...state,
        traversalMode: action.mode,
        traversalOrderP: orderP,
        traversalOrderQ: orderQ,
      };
    }

    case 'START': {
      // Check for both empty trees case
      if (!state.rootP && !state.rootQ) {
        return {
          ...state,
          phase: 'done',
          result: 'same',
          score: 10,
          startTime: Date.now(),
          endTime: Date.now(),
        };
      }
      
      const initialQueueP = state.traversalMode === 'bfs' && state.rootP ? [state.rootP] : [];
      const initialQueueQ = state.traversalMode === 'bfs' && state.rootQ ? [state.rootQ] : [];
      
      return {
        ...state,
        phase: 'traversing',
        currentIndex: 0,
        startTime: Date.now(),
        queueP: initialQueueP,
        queueQ: initialQueueQ,
        score: 0,
      };
    }

    case 'COMPARE_NEXT': {
      if (state.phase !== 'traversing' || state.mismatch) return state;
      
      const nodeP = state.traversalOrderP[state.currentIndex];
      const nodeQ = state.traversalOrderQ[state.currentIndex];
      
      // Compare nodes
      let match = true;
      let reason: string | null = null;
      
      if (nodeP === null && nodeQ === null) {
        // Both null - match, continue
        match = true;
        reason = 'both_null';
      } else if (nodeP === null || nodeQ === null) {
        // Structure mismatch
        match = false;
        reason = 'Structure mismatch: one node is null, the other is not';
      } else {
        const pNode = state.nodesP.get(nodeP);
        const qNode = state.nodesQ.get(nodeQ);
        
        if (pNode && qNode && pNode.value === qNode.value) {
          match = true;
          reason = 'value_match';
        } else {
          match = false;
          reason = `Value mismatch: ${pNode?.value} ≠ ${qNode?.value}`;
        }
      }
      
      const newCompared = new Set(state.comparedNodes);
      if (nodeP) newCompared.add(nodeP);
      if (nodeQ) newCompared.add(nodeQ);
      
      // Update queues for BFS visualization
      let newQueueP = [...state.queueP];
      let newQueueQ = [...state.queueQ];
      
      if (state.traversalMode === 'bfs') {
        if (nodeP) {
          newQueueP = newQueueP.filter(id => id !== nodeP);
          const pNode = state.nodesP.get(nodeP);
          if (pNode?.left) newQueueP.push(pNode.left);
          if (pNode?.right) newQueueP.push(pNode.right);
        }
        if (nodeQ) {
          newQueueQ = newQueueQ.filter(id => id !== nodeQ);
          const qNode = state.nodesQ.get(nodeQ);
          if (qNode?.left) newQueueQ.push(qNode.left);
          if (qNode?.right) newQueueQ.push(qNode.right);
        }
      }
      
      if (!match) {
        // Mismatch found - stop
        return {
          ...state,
          currentIndex: state.currentIndex,
          comparedNodes: newCompared,
          mismatch: true,
          mismatchReason: reason,
          mismatchNodeP: nodeP,
          mismatchNodeQ: nodeQ,
          phase: 'done',
          result: 'different',
          endTime: Date.now(),
          score: state.score + 3, // Bonus for finding mismatch
          queueP: newQueueP,
          queueQ: newQueueQ,
        };
      }
      
      // Check if done
      const nextIndex = state.currentIndex + 1;
      const isDone = nextIndex >= state.traversalOrderP.length;
      
      if (isDone) {
        return {
          ...state,
          currentIndex: nextIndex,
          comparedNodes: newCompared,
          phase: 'done',
          result: 'same',
          endTime: Date.now(),
          score: state.score + 1 + 3, // +1 for node, +3 bonus for identical
          queueP: [],
          queueQ: [],
        };
      }
      
      return {
        ...state,
        currentIndex: nextIndex,
        comparedNodes: newCompared,
        score: state.score + 1,
        queueP: newQueueP,
        queueQ: newQueueQ,
      };
    }

    case 'FINISH': {
      if (state.phase !== 'traversing') return state;
      
      // Early finish - determine result based on current state
      const allMatched = !state.mismatch && state.currentIndex >= state.traversalOrderP.length - 1;
      
      return {
        ...state,
        phase: 'done',
        result: allMatched ? 'same' : 'different',
        endTime: Date.now(),
      };
    }

    case 'RESTART': {
      const { nodes: nodesP, rootId: rootP } = buildTreeFromArray(state.seedP);
      const { nodes: nodesQ, rootId: rootQ } = buildTreeFromArray(state.seedQ);
      const { orderP, orderQ } = state.traversalMode === 'dfs'
        ? getSyncedDFSOrder(nodesP, rootP, nodesQ, rootQ)
        : getSyncedBFSOrder(nodesP, rootP, nodesQ, rootQ);
      
      return {
        ...state,
        nodesP,
        nodesQ,
        rootP,
        rootQ,
        traversalOrderP: orderP,
        traversalOrderQ: orderQ,
        currentIndex: -1,
        comparedNodes: new Set(),
        queueP: [],
        queueQ: [],
        mismatch: false,
        mismatchReason: null,
        mismatchNodeP: null,
        mismatchNodeQ: null,
        phase: 'select',
        result: null,
        score: 0,
        startTime: null,
        endTime: null,
      };
    }

    case 'NEW_TREES': {
      return initSameTree(action.seedP, action.seedQ);
    }

    default:
      return state;
  }
}

export function isFinished(state: SameTreeState): boolean {
  return state.phase === 'done';
}

export function getTimeElapsed(state: SameTreeState): number {
  if (!state.startTime) return 0;
  const endTime = state.endTime || Date.now();
  return Math.floor((endTime - state.startTime) / 1000);
}

export function calculateBonus(state: SameTreeState): number {
  const timeElapsed = getTimeElapsed(state);
  let bonus = 0;
  
  // Time bonus
  if (timeElapsed < 10) bonus += 20;
  else if (timeElapsed < 20) bonus += 10;
  else if (timeElapsed < 30) bonus += 5;
  
  return bonus;
}

export function getCurrentNodes(state: SameTreeState): { nodeP: string | null; nodeQ: string | null } {
  if (state.currentIndex < 0 || state.currentIndex >= state.traversalOrderP.length) {
    return { nodeP: null, nodeQ: null };
  }
  return {
    nodeP: state.traversalOrderP[state.currentIndex],
    nodeQ: state.traversalOrderQ[state.currentIndex],
  };
}

export function getTreeLevels(nodes: Map<string, TreeNode>, rootId: string | null): (string | null)[][] {
  if (!rootId) return [[null]];
  
  const levels: (string | null)[][] = [];
  let currentLevel: (string | null)[] = [rootId];
  
  while (currentLevel.some(id => id !== null)) {
    levels.push(currentLevel);
    const nextLevel: (string | null)[] = [];
    
    for (const nodeId of currentLevel) {
      if (nodeId) {
        const node = nodes.get(nodeId);
        if (node) {
          nextLevel.push(node.left);
          nextLevel.push(node.right);
        } else {
          nextLevel.push(null);
          nextLevel.push(null);
        }
      } else {
        nextLevel.push(null);
        nextLevel.push(null);
      }
    }
    
    currentLevel = nextLevel;
  }
  
  return levels;
}

// Generate random tree pairs with different scenarios
export function generateTreePair(): { seedP: (number | null)[]; seedQ: (number | null)[]; scenario: string } {
  const scenarios = ['identical', 'value_mismatch', 'structure_mismatch', 'one_empty'];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  const baseValues = [
    [1, 2, 3],
    [1, 2, 3, 4, 5],
    [4, 2, 7, 1, 3, 6, 9],
    [5, 3, 8],
    [1, null, 2],
    [3, 9, 20, null, null, 15, 7],
  ];
  
  const base = baseValues[Math.floor(Math.random() * baseValues.length)];
  
  switch (scenario) {
    case 'identical':
      return { seedP: [...base], seedQ: [...base], scenario };
    
    case 'value_mismatch': {
      const modified = [...base];
      const idx = Math.floor(Math.random() * modified.length);
      if (modified[idx] !== null) {
        modified[idx] = (modified[idx] as number) + 1;
      }
      return { seedP: [...base], seedQ: modified, scenario };
    }
    
    case 'structure_mismatch': {
      const modified = [...base];
      // Add or remove a node
      if (modified.length > 3 && Math.random() > 0.5) {
        modified[modified.length - 1] = null;
      } else {
        modified.push(99);
      }
      return { seedP: [...base], seedQ: modified, scenario };
    }
    
    case 'one_empty':
      return { seedP: [...base], seedQ: [], scenario };
    
    default:
      return { seedP: [...base], seedQ: [...base], scenario: 'identical' };
  }
}
