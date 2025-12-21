export interface TreeNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
}

export interface InvertTreeState {
  nodes: Map<string, TreeNode>;
  rootId: string;
  traversalMode: 'dfs' | 'bfs';
  traversalOrder: string[];
  currentIndex: number;
  swappedNodes: Set<string>;
  queue: string[]; // For BFS visualization
  phase: 'select' | 'traversing' | 'done';
  score: number;
  startTime: number | null;
  endTime: number | null;
  seed: number[];
}

export type InvertTreeAction =
  | { type: 'SET_TRAVERSAL_MODE'; mode: 'dfs' | 'bfs' }
  | { type: 'START' }
  | { type: 'SWAP_CHILDREN' }
  | { type: 'NEXT_NODE' }
  | { type: 'RESTART' }
  | { type: 'NEW_TREE'; seed: number[] };

function generateNodeId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function buildTreeFromArray(values: number[]): { nodes: Map<string, TreeNode>; rootId: string } {
  if (values.length === 0) {
    return { nodes: new Map(), rootId: '' };
  }

  const nodes = new Map<string, TreeNode>();
  const ids: string[] = values.map(() => generateNodeId());
  
  for (let i = 0; i < values.length; i++) {
    const leftIndex = 2 * i + 1;
    const rightIndex = 2 * i + 2;
    
    nodes.set(ids[i], {
      id: ids[i],
      value: values[i],
      left: leftIndex < values.length ? ids[leftIndex] : null,
      right: rightIndex < values.length ? ids[rightIndex] : null,
    });
  }

  return { nodes, rootId: ids[0] };
}

function getDFSOrder(nodes: Map<string, TreeNode>, rootId: string): string[] {
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

function getBFSOrder(nodes: Map<string, TreeNode>, rootId: string): string[] {
  const order: string[] = [];
  const queue: string[] = [rootId];
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);
    const node = nodes.get(nodeId);
    if (node) {
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return order;
}

export function initInvertBinaryTree(seed: number[]): InvertTreeState {
  const { nodes, rootId } = buildTreeFromArray(seed);
  
  return {
    nodes,
    rootId,
    traversalMode: 'dfs',
    traversalOrder: getDFSOrder(nodes, rootId),
    currentIndex: -1,
    swappedNodes: new Set(),
    queue: [],
    phase: 'select',
    score: 0,
    startTime: null,
    endTime: null,
    seed,
  };
}

export function reducer(state: InvertTreeState, action: InvertTreeAction): InvertTreeState {
  switch (action.type) {
    case 'SET_TRAVERSAL_MODE': {
      const traversalOrder = action.mode === 'dfs'
        ? getDFSOrder(state.nodes, state.rootId)
        : getBFSOrder(state.nodes, state.rootId);
      
      return {
        ...state,
        traversalMode: action.mode,
        traversalOrder,
      };
    }

    case 'START': {
      const queue = state.traversalMode === 'bfs' ? [state.rootId] : [];
      return {
        ...state,
        phase: 'traversing',
        currentIndex: 0,
        startTime: Date.now(),
        queue,
      };
    }

    case 'SWAP_CHILDREN': {
      if (state.phase !== 'traversing' || state.currentIndex < 0) return state;
      
      const currentNodeId = state.traversalOrder[state.currentIndex];
      if (state.swappedNodes.has(currentNodeId)) return state;
      
      const currentNode = state.nodes.get(currentNodeId);
      if (!currentNode) return state;

      const newNodes = new Map(state.nodes);
      newNodes.set(currentNodeId, {
        ...currentNode,
        left: currentNode.right,
        right: currentNode.left,
      });

      const newSwapped = new Set(state.swappedNodes);
      newSwapped.add(currentNodeId);

      return {
        ...state,
        nodes: newNodes,
        swappedNodes: newSwapped,
        score: state.score + 10,
      };
    }

    case 'NEXT_NODE': {
      if (state.phase !== 'traversing') return state;
      
      const currentNodeId = state.traversalOrder[state.currentIndex];
      if (!state.swappedNodes.has(currentNodeId)) return state;

      const nextIndex = state.currentIndex + 1;
      
      // Update queue for BFS visualization
      let newQueue = [...state.queue];
      if (state.traversalMode === 'bfs') {
        // Remove current from queue
        newQueue = newQueue.filter(id => id !== currentNodeId);
        // Add children to queue
        const currentNode = state.nodes.get(currentNodeId);
        if (currentNode) {
          if (currentNode.left) newQueue.push(currentNode.left);
          if (currentNode.right) newQueue.push(currentNode.right);
        }
      }

      if (nextIndex >= state.traversalOrder.length) {
        return {
          ...state,
          currentIndex: nextIndex,
          phase: 'done',
          endTime: Date.now(),
          queue: [],
        };
      }

      return {
        ...state,
        currentIndex: nextIndex,
        queue: newQueue,
      };
    }

    case 'RESTART': {
      const { nodes, rootId } = buildTreeFromArray(state.seed);
      const traversalOrder = state.traversalMode === 'dfs'
        ? getDFSOrder(nodes, rootId)
        : getBFSOrder(nodes, rootId);
      
      return {
        ...state,
        nodes,
        rootId,
        traversalOrder,
        currentIndex: -1,
        swappedNodes: new Set(),
        queue: [],
        phase: 'select',
        score: 0,
        startTime: null,
        endTime: null,
      };
    }

    case 'NEW_TREE': {
      return initInvertBinaryTree(action.seed);
    }

    default:
      return state;
  }
}

export function isFinished(state: InvertTreeState): boolean {
  return state.phase === 'done';
}

export function getTimeElapsed(state: InvertTreeState): number {
  if (!state.startTime) return 0;
  const endTime = state.endTime || Date.now();
  return Math.floor((endTime - state.startTime) / 1000);
}

export function calculateBonus(state: InvertTreeState): number {
  const timeElapsed = getTimeElapsed(state);
  let bonus = 0;
  
  // Time bonus
  if (timeElapsed < 15) bonus += 30;
  else if (timeElapsed < 30) bonus += 20;
  else if (timeElapsed < 45) bonus += 10;
  
  // Perfect run bonus
  if (state.swappedNodes.size === state.traversalOrder.length) {
    bonus += 20;
  }
  
  return bonus;
}

export function getCurrentNodeId(state: InvertTreeState): string | null {
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
