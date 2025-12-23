export interface TreeNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
}

export interface DepthState {
  nodes: Map<string, TreeNode>;
  rootId: string;
  traversalMode: 'dfs' | 'bfs';
  traversalOrder: string[];
  currentIndex: number;
  visitedNodes: Set<string>;
  currentDepth: number;
  maxDepth: number;
  depthAtNode: Map<string, number>; // Track depth when each node was visited
  recursionStack: { nodeId: string; depth: number }[]; // For DFS visualization
  queue: { nodeId: string; depth: number }[]; // For BFS visualization
  currentLevelNodes: Set<string>; // For BFS level highlighting
  phase: 'select' | 'traversing' | 'done';
  score: number;
  startTime: number | null;
  endTime: number | null;
  seed: number[];
}

export type DepthAction =
  | { type: 'SET_TRAVERSAL_MODE'; mode: 'dfs' | 'bfs' }
  | { type: 'START' }
  | { type: 'VISIT_NEXT' }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
  | { type: 'NEW_TREE'; seed: number[] };

function generateNodeId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function buildTreeFromArray(values: (number | null)[]): { nodes: Map<string, TreeNode>; rootId: string } {
  if (values.length === 0 || values[0] === null) {
    return { nodes: new Map(), rootId: '' };
  }

  const nodes = new Map<string, TreeNode>();
  const ids: (string | null)[] = values.map(v => v !== null ? generateNodeId() : null);
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null || ids[i] === null) continue;
    
    const leftIndex = 2 * i + 1;
    const rightIndex = 2 * i + 2;
    
    nodes.set(ids[i]!, {
      id: ids[i]!,
      value: values[i]!,
      left: leftIndex < values.length && ids[leftIndex] !== null ? ids[leftIndex] : null,
      right: rightIndex < values.length && ids[rightIndex] !== null ? ids[rightIndex] : null,
    });
  }

  return { nodes, rootId: ids[0]! };
}

function getDFSOrderWithDepth(nodes: Map<string, TreeNode>, rootId: string): { order: string[]; depths: Map<string, number> } {
  const order: string[] = [];
  const depths = new Map<string, number>();
  
  function dfs(nodeId: string | null, depth: number) {
    if (!nodeId) return;
    order.push(nodeId);
    depths.set(nodeId, depth);
    const node = nodes.get(nodeId);
    if (node) {
      dfs(node.left, depth + 1);
      dfs(node.right, depth + 1);
    }
  }
  
  dfs(rootId, 1);
  return { order, depths };
}

function getBFSOrderWithDepth(nodes: Map<string, TreeNode>, rootId: string): { order: string[]; depths: Map<string, number> } {
  const order: string[] = [];
  const depths = new Map<string, number>();
  const queue: { nodeId: string; depth: number }[] = [{ nodeId: rootId, depth: 1 }];
  
  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    order.push(nodeId);
    depths.set(nodeId, depth);
    const node = nodes.get(nodeId);
    if (node) {
      if (node.left) queue.push({ nodeId: node.left, depth: depth + 1 });
      if (node.right) queue.push({ nodeId: node.right, depth: depth + 1 });
    }
  }
  
  return { order, depths };
}

export function initMaxDepthBinaryTree(seed: (number | null)[]): DepthState {
  const { nodes, rootId } = buildTreeFromArray(seed);
  const { order, depths } = getDFSOrderWithDepth(nodes, rootId);
  
  return {
    nodes,
    rootId,
    traversalMode: 'dfs',
    traversalOrder: order,
    currentIndex: -1,
    visitedNodes: new Set(),
    currentDepth: 0,
    maxDepth: 0,
    depthAtNode: depths,
    recursionStack: [],
    queue: [],
    currentLevelNodes: new Set(),
    phase: 'select',
    score: 0,
    startTime: null,
    endTime: null,
    seed: seed as number[],
  };
}

export function reducer(state: DepthState, action: DepthAction): DepthState {
  switch (action.type) {
    case 'SET_TRAVERSAL_MODE': {
      const { order, depths } = action.mode === 'dfs'
        ? getDFSOrderWithDepth(state.nodes, state.rootId)
        : getBFSOrderWithDepth(state.nodes, state.rootId);
      
      return {
        ...state,
        traversalMode: action.mode,
        traversalOrder: order,
        depthAtNode: depths,
      };
    }

    case 'START': {
      if (state.nodes.size === 0) {
        // Empty tree case
        return {
          ...state,
          phase: 'done',
          maxDepth: 0,
          startTime: Date.now(),
          endTime: Date.now(),
          score: 10, // Bonus for recognizing empty tree
        };
      }
      
      const firstNodeId = state.traversalOrder[0];
      const firstDepth = state.depthAtNode.get(firstNodeId) || 1;
      
      const initialQueue = state.traversalMode === 'bfs' 
        ? [{ nodeId: firstNodeId, depth: 1 }]
        : [];
      
      const initialStack = state.traversalMode === 'dfs'
        ? [{ nodeId: firstNodeId, depth: 1 }]
        : [];
        
      // For BFS, find all nodes at level 1
      const initialLevelNodes = new Set<string>();
      if (state.traversalMode === 'bfs') {
        initialLevelNodes.add(firstNodeId);
      }
      
      return {
        ...state,
        phase: 'traversing',
        currentIndex: 0,
        startTime: Date.now(),
        currentDepth: firstDepth,
        maxDepth: firstDepth,
        visitedNodes: new Set([firstNodeId]),
        recursionStack: initialStack,
        queue: initialQueue,
        currentLevelNodes: initialLevelNodes,
        score: 10, // Points for visiting first node
      };
    }

    case 'VISIT_NEXT': {
      if (state.phase !== 'traversing') return state;
      
      const nextIndex = state.currentIndex + 1;
      
      if (nextIndex >= state.traversalOrder.length) {
        // All nodes visited
        return {
          ...state,
          currentIndex: nextIndex,
          phase: 'done',
          endTime: Date.now(),
          currentDepth: 0,
          recursionStack: [],
          queue: [],
        };
      }
      
      const nextNodeId = state.traversalOrder[nextIndex];
      const nextDepth = state.depthAtNode.get(nextNodeId) || 1;
      
      const newVisited = new Set(state.visitedNodes);
      newVisited.add(nextNodeId);
      
      const newMaxDepth = Math.max(state.maxDepth, nextDepth);
      const depthIncreased = newMaxDepth > state.maxDepth;
      
      // Update recursion stack for DFS
      let newStack = [...state.recursionStack];
      if (state.traversalMode === 'dfs') {
        // Pop nodes that are at same or deeper level (backtracking)
        while (newStack.length > 0 && newStack[newStack.length - 1].depth >= nextDepth) {
          newStack.pop();
        }
        newStack.push({ nodeId: nextNodeId, depth: nextDepth });
      }
      
      // Update queue for BFS
      let newQueue = [...state.queue];
      let newCurrentLevelNodes = new Set(state.currentLevelNodes);
      
      if (state.traversalMode === 'bfs') {
        // Remove current from queue
        newQueue = newQueue.filter(item => item.nodeId !== state.traversalOrder[state.currentIndex]);
        
        // Add children to queue
        const currentNode = state.nodes.get(state.traversalOrder[state.currentIndex]);
        if (currentNode) {
          const currentDepthVal = state.depthAtNode.get(state.traversalOrder[state.currentIndex]) || 1;
          if (currentNode.left) {
            newQueue.push({ nodeId: currentNode.left, depth: currentDepthVal + 1 });
          }
          if (currentNode.right) {
            newQueue.push({ nodeId: currentNode.right, depth: currentDepthVal + 1 });
          }
        }
        
        // Check if we moved to a new level
        const prevDepth = state.depthAtNode.get(state.traversalOrder[state.currentIndex]) || 1;
        if (nextDepth > prevDepth) {
          // New level - update current level nodes
          newCurrentLevelNodes = new Set(
            state.traversalOrder
              .filter(id => state.depthAtNode.get(id) === nextDepth)
          );
        }
      }
      
      // Calculate score
      let scoreIncrease = 10; // Base points per node
      if (depthIncreased) {
        scoreIncrease += 5; // Bonus for reaching new max depth
      }
      
      return {
        ...state,
        currentIndex: nextIndex,
        currentDepth: nextDepth,
        maxDepth: newMaxDepth,
        visitedNodes: newVisited,
        recursionStack: newStack,
        queue: newQueue,
        currentLevelNodes: newCurrentLevelNodes,
        score: state.score + scoreIncrease,
      };
    }

    case 'FINISH': {
      if (state.phase !== 'traversing') return state;
      return {
        ...state,
        phase: 'done',
        endTime: Date.now(),
      };
    }

    case 'RESTART': {
      const { nodes, rootId } = buildTreeFromArray(state.seed);
      const { order, depths } = state.traversalMode === 'dfs'
        ? getDFSOrderWithDepth(nodes, rootId)
        : getBFSOrderWithDepth(nodes, rootId);
      
      return {
        ...state,
        nodes,
        rootId,
        traversalOrder: order,
        depthAtNode: depths,
        currentIndex: -1,
        visitedNodes: new Set(),
        currentDepth: 0,
        maxDepth: 0,
        recursionStack: [],
        queue: [],
        currentLevelNodes: new Set(),
        phase: 'select',
        score: 0,
        startTime: null,
        endTime: null,
      };
    }

    case 'NEW_TREE': {
      return initMaxDepthBinaryTree(action.seed);
    }

    default:
      return state;
  }
}

export function isFinished(state: DepthState): boolean {
  return state.phase === 'done';
}

export function getTimeElapsed(state: DepthState): number {
  if (!state.startTime) return 0;
  const endTime = state.endTime || Date.now();
  return Math.floor((endTime - state.startTime) / 1000);
}

export function calculateBonus(state: DepthState): number {
  const timeElapsed = getTimeElapsed(state);
  let bonus = 0;
  
  // Time bonus
  if (timeElapsed < 10) bonus += 30;
  else if (timeElapsed < 20) bonus += 20;
  else if (timeElapsed < 30) bonus += 10;
  
  // Perfect traversal bonus
  if (state.visitedNodes.size === state.nodes.size) {
    bonus += 20;
  }
  
  // Correctly identified max depth
  bonus += 10;
  
  return bonus;
}

export function getCurrentNodeId(state: DepthState): string | null {
  if (state.currentIndex < 0 || state.currentIndex >= state.traversalOrder.length) {
    return null;
  }
  return state.traversalOrder[state.currentIndex];
}

export function getTreeLevels(nodes: Map<string, TreeNode>, rootId: string): string[][] {
  if (!rootId || nodes.size === 0) return [];
  
  const levels: string[][] = [];
  let currentLevel = [rootId];
  
  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    const nextLevel: string[] = [];
    
    for (const nodeId of currentLevel) {
      const node = nodes.get(nodeId);
      if (node) {
        if (node.left) nextLevel.push(node.left);
        if (node.right) nextLevel.push(node.right);
      }
    }
    
    currentLevel = nextLevel;
  }
  
  return levels;
}

export function getActualMaxDepth(nodes: Map<string, TreeNode>, rootId: string): number {
  if (!rootId || nodes.size === 0) return 0;
  
  function dfs(nodeId: string | null): number {
    if (!nodeId) return 0;
    const node = nodes.get(nodeId);
    if (!node) return 0;
    return 1 + Math.max(dfs(node.left), dfs(node.right));
  }
  
  return dfs(rootId);
}

export function isLeafNode(nodes: Map<string, TreeNode>, nodeId: string): boolean {
  const node = nodes.get(nodeId);
  return node ? node.left === null && node.right === null : false;
}
