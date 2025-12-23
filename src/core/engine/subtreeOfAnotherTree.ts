export interface TreeNode {
  id: string;
  value: number | null;
  left: string | null;
  right: string | null;
}

export interface SubtreeState {
  rootNodes: Map<string, TreeNode>;
  subRootNodes: Map<string, TreeNode>;
  rootId: string | null;
  subRootId: string | null;
  phase: 'select' | 'search' | 'compare' | 'done';
  searchIndex: number;
  searchOrder: string[];
  candidateNodeId: string | null;
  compareIndex: number;
  compareOrderRoot: (string | null)[];
  compareOrderSub: (string | null)[];
  visitedNodes: Set<string>;
  comparedNodes: Set<string>;
  candidateNodes: string[];
  mismatch: boolean;
  mismatchReason: string | null;
  found: boolean;
  matchedSubtreeRoot: string | null;
  score: number;
  startTime: number | null;
  endTime: number | null;
  seedRoot: (number | null)[];
  seedSubRoot: (number | null)[];
}

export type SubtreeAction =
  | { type: 'START' }
  | { type: 'VISIT_NEXT_NODE' }
  | { type: 'START_COMPARISON' }
  | { type: 'COMPARE_NEXT' }
  | { type: 'SKIP_COMPARISON' }
  | { type: 'RETURN_TO_SEARCH' }
  | { type: 'RESTART' }
  | { type: 'NEW_TREES'; seedRoot: (number | null)[]; seedSubRoot: (number | null)[] };

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

function getDFSOrder(nodes: Map<string, TreeNode>, rootId: string | null): string[] {
  const order: string[] = [];
  
  function dfs(nodeId: string | null) {
    if (!nodeId) return;
    order.push(nodeId);
    const node = nodes.get(nodeId);
    if (node) {
      dfs(node.left);
      dfs(node.right);
    }
  }
  
  dfs(rootId);
  return order;
}

// Get synced DFS order for comparison (includes nulls)
function getSyncedDFSOrder(
  nodesRoot: Map<string, TreeNode>, 
  rootId: string | null,
  nodesSub: Map<string, TreeNode>,
  subId: string | null
): { orderRoot: (string | null)[]; orderSub: (string | null)[] } {
  const orderRoot: (string | null)[] = [];
  const orderSub: (string | null)[] = [];
  
  function dfs(nodeR: string | null, nodeS: string | null) {
    orderRoot.push(nodeR);
    orderSub.push(nodeS);
    
    const rNode = nodeR ? nodesRoot.get(nodeR) : null;
    const sNode = nodeS ? nodesSub.get(nodeS) : null;
    
    const hasLeftR = rNode?.left !== undefined;
    const hasLeftS = sNode?.left !== undefined;
    const hasRightR = rNode?.right !== undefined;
    const hasRightS = sNode?.right !== undefined;
    
    if (hasLeftR || hasLeftS) {
      dfs(rNode?.left ?? null, sNode?.left ?? null);
    }
    if (hasRightR || hasRightS) {
      dfs(rNode?.right ?? null, sNode?.right ?? null);
    }
  }
  
  dfs(rootId, subId);
  return { orderRoot, orderSub };
}

function findCandidateNodes(
  rootNodes: Map<string, TreeNode>, 
  subRootNodes: Map<string, TreeNode>,
  subRootId: string | null,
  searchOrder: string[]
): string[] {
  if (!subRootId) return [];
  const subRootNode = subRootNodes.get(subRootId);
  if (!subRootNode) return [];
  
  const targetValue = subRootNode.value;
  return searchOrder.filter(nodeId => {
    const node = rootNodes.get(nodeId);
    return node && node.value === targetValue;
  });
}

export function initSubtree(seedRoot: (number | null)[], seedSubRoot: (number | null)[]): SubtreeState {
  const { nodes: rootNodes, rootId } = buildTreeFromArray(seedRoot);
  const { nodes: subRootNodes, rootId: subRootId } = buildTreeFromArray(seedSubRoot);
  const searchOrder = getDFSOrder(rootNodes, rootId);
  const candidateNodes = findCandidateNodes(rootNodes, subRootNodes, subRootId, searchOrder);
  
  return {
    rootNodes,
    subRootNodes,
    rootId,
    subRootId,
    phase: 'select',
    searchIndex: -1,
    searchOrder,
    candidateNodeId: null,
    compareIndex: -1,
    compareOrderRoot: [],
    compareOrderSub: [],
    visitedNodes: new Set(),
    comparedNodes: new Set(),
    candidateNodes,
    mismatch: false,
    mismatchReason: null,
    found: false,
    matchedSubtreeRoot: null,
    score: 0,
    startTime: null,
    endTime: null,
    seedRoot,
    seedSubRoot,
  };
}

export function reducer(state: SubtreeState, action: SubtreeAction): SubtreeState {
  switch (action.type) {
    case 'START': {
      // Handle edge cases
      if (!state.subRootId) {
        // Empty subRoot - always true
        return {
          ...state,
          phase: 'done',
          found: true,
          score: 10,
          startTime: Date.now(),
          endTime: Date.now(),
        };
      }
      
      if (!state.rootId) {
        // Empty root, non-empty subRoot - false
        return {
          ...state,
          phase: 'done',
          found: false,
          score: 0,
          startTime: Date.now(),
          endTime: Date.now(),
        };
      }
      
      return {
        ...state,
        phase: 'search',
        searchIndex: 0,
        startTime: Date.now(),
        score: 0,
        visitedNodes: new Set([state.searchOrder[0]]),
      };
    }

    case 'VISIT_NEXT_NODE': {
      if (state.phase !== 'search') return state;
      
      const nextIndex = state.searchIndex + 1;
      
      if (nextIndex >= state.searchOrder.length) {
        // Search exhausted - no match found
        return {
          ...state,
          phase: 'done',
          found: false,
          endTime: Date.now(),
        };
      }
      
      const newVisited = new Set(state.visitedNodes);
      newVisited.add(state.searchOrder[nextIndex]);
      
      return {
        ...state,
        searchIndex: nextIndex,
        visitedNodes: newVisited,
        score: state.score + 1,
      };
    }

    case 'START_COMPARISON': {
      if (state.phase !== 'search') return state;
      
      const currentNodeId = state.searchOrder[state.searchIndex];
      const { orderRoot, orderSub } = getSyncedDFSOrder(
        state.rootNodes,
        currentNodeId,
        state.subRootNodes,
        state.subRootId
      );
      
      return {
        ...state,
        phase: 'compare',
        candidateNodeId: currentNodeId,
        compareIndex: 0,
        compareOrderRoot: orderRoot,
        compareOrderSub: orderSub,
        comparedNodes: new Set(),
        mismatch: false,
        mismatchReason: null,
      };
    }

    case 'COMPARE_NEXT': {
      if (state.phase !== 'compare') return state;
      
      const nodeR = state.compareOrderRoot[state.compareIndex];
      const nodeS = state.compareOrderSub[state.compareIndex];
      
      let match = true;
      let reason: string | null = null;
      
      if (nodeR === null && nodeS === null) {
        // Both null - continue
        match = true;
      } else if (nodeR === null || nodeS === null) {
        // Structure mismatch
        match = false;
        reason = 'Structure mismatch: one node is null, the other is not';
      } else {
        const rNode = state.rootNodes.get(nodeR);
        const sNode = state.subRootNodes.get(nodeS);
        
        if (rNode && sNode && rNode.value === sNode.value) {
          match = true;
        } else {
          match = false;
          reason = `Value mismatch: ${rNode?.value} ≠ ${sNode?.value}`;
        }
      }
      
      const newCompared = new Set(state.comparedNodes);
      if (nodeR) newCompared.add(nodeR);
      
      if (!match) {
        // Mismatch - return to search
        return {
          ...state,
          compareIndex: state.compareIndex,
          comparedNodes: newCompared,
          mismatch: true,
          mismatchReason: reason,
          score: state.score + 2,
        };
      }
      
      const nextIndex = state.compareIndex + 1;
      const isDone = nextIndex >= state.compareOrderRoot.length;
      
      if (isDone) {
        // Full match found!
        return {
          ...state,
          compareIndex: nextIndex,
          comparedNodes: newCompared,
          phase: 'done',
          found: true,
          matchedSubtreeRoot: state.candidateNodeId,
          endTime: Date.now(),
          score: state.score + 2 + 3, // +2 for comparison, +3 bonus for match
        };
      }
      
      return {
        ...state,
        compareIndex: nextIndex,
        comparedNodes: newCompared,
        score: state.score + 2,
      };
    }

    case 'SKIP_COMPARISON': {
      if (state.phase !== 'search') return state;
      
      const nextIndex = state.searchIndex + 1;
      
      if (nextIndex >= state.searchOrder.length) {
        return {
          ...state,
          phase: 'done',
          found: false,
          endTime: Date.now(),
        };
      }
      
      const newVisited = new Set(state.visitedNodes);
      newVisited.add(state.searchOrder[nextIndex]);
      
      return {
        ...state,
        searchIndex: nextIndex,
        visitedNodes: newVisited,
        score: state.score + 1,
      };
    }

    case 'RETURN_TO_SEARCH': {
      if (state.phase !== 'compare') return state;
      
      const nextSearchIndex = state.searchIndex + 1;
      
      if (nextSearchIndex >= state.searchOrder.length) {
        return {
          ...state,
          phase: 'done',
          found: false,
          endTime: Date.now(),
        };
      }
      
      const newVisited = new Set(state.visitedNodes);
      newVisited.add(state.searchOrder[nextSearchIndex]);
      
      return {
        ...state,
        phase: 'search',
        searchIndex: nextSearchIndex,
        candidateNodeId: null,
        compareIndex: -1,
        compareOrderRoot: [],
        compareOrderSub: [],
        comparedNodes: new Set(),
        mismatch: false,
        mismatchReason: null,
        visitedNodes: newVisited,
      };
    }

    case 'RESTART': {
      return initSubtree(state.seedRoot, state.seedSubRoot);
    }

    case 'NEW_TREES': {
      return initSubtree(action.seedRoot, action.seedSubRoot);
    }

    default:
      return state;
  }
}

export function isFinished(state: SubtreeState): boolean {
  return state.phase === 'done';
}

export function getTimeElapsed(state: SubtreeState): number {
  if (!state.startTime) return 0;
  const endTime = state.endTime || Date.now();
  return Math.floor((endTime - state.startTime) / 1000);
}

export function calculateBonus(state: SubtreeState): number {
  const timeElapsed = getTimeElapsed(state);
  let bonus = 0;
  
  // Time bonus
  if (timeElapsed < 15) bonus += 20;
  else if (timeElapsed < 30) bonus += 10;
  else if (timeElapsed < 45) bonus += 5;
  
  // Early match bonus
  if (state.found && state.searchIndex < state.searchOrder.length / 2) {
    bonus += 3;
  }
  
  return bonus;
}

export function getCurrentSearchNode(state: SubtreeState): string | null {
  if (state.searchIndex < 0 || state.searchIndex >= state.searchOrder.length) {
    return null;
  }
  return state.searchOrder[state.searchIndex];
}

export function getCurrentCompareNodes(state: SubtreeState): { nodeR: string | null; nodeS: string | null } {
  if (state.compareIndex < 0 || state.compareIndex >= state.compareOrderRoot.length) {
    return { nodeR: null, nodeS: null };
  }
  return {
    nodeR: state.compareOrderRoot[state.compareIndex],
    nodeS: state.compareOrderSub[state.compareIndex],
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

// Get all nodes in a subtree starting from given node
export function getSubtreeNodes(nodes: Map<string, TreeNode>, startId: string | null): Set<string> {
  const result = new Set<string>();
  
  function dfs(nodeId: string | null) {
    if (!nodeId) return;
    result.add(nodeId);
    const node = nodes.get(nodeId);
    if (node) {
      dfs(node.left);
      dfs(node.right);
    }
  }
  
  dfs(startId);
  return result;
}

// Generate random tree pairs with different scenarios
export function generateTreePair(): { seedRoot: (number | null)[]; seedSubRoot: (number | null)[]; scenario: string } {
  const scenarios = ['subtree_exists', 'no_match', 'value_match_structure_different', 'multiple_candidates'];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  switch (scenario) {
    case 'subtree_exists': {
      // Create a main tree and pick a subtree from it
      const roots = [
        [3, 4, 5, 1, 2],
        [1, 2, 3, 4, 5, 6, 7],
        [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1],
      ];
      const root = roots[Math.floor(Math.random() * roots.length)];
      
      // Pick a subtree
      const subs = [
        [4, 1, 2],
        [2, 4, 5],
        [4, 11, null, 7, 2],
      ];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      
      return { seedRoot: root, seedSubRoot: sub, scenario };
    }
    
    case 'no_match': {
      return { 
        seedRoot: [3, 4, 5, 1, 2], 
        seedSubRoot: [4, 1, 3], 
        scenario 
      };
    }
    
    case 'value_match_structure_different': {
      return { 
        seedRoot: [3, 4, 5, 1, 2, null, null, null, null, 0], 
        seedSubRoot: [4, 1, 2], 
        scenario 
      };
    }
    
    case 'multiple_candidates': {
      return { 
        seedRoot: [1, 1, 1, 1, 1, 1, 1], 
        seedSubRoot: [1, 1, 1], 
        scenario 
      };
    }
    
    default:
      return { seedRoot: [3, 4, 5, 1, 2], seedSubRoot: [4, 1, 2], scenario: 'subtree_exists' };
  }
}
