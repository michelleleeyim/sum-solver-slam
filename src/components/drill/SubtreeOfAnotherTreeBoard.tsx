import { motion, AnimatePresence } from "framer-motion";
import { 
  SubtreeState, 
  getTreeLevels, 
  getCurrentSearchNode, 
  getCurrentCompareNodes,
  getSubtreeNodes,
  TreeNode 
} from "@/core/engine/subtreeOfAnotherTree";
import { Search, GitCompare, Check, X } from "lucide-react";

interface SubtreeOfAnotherTreeBoardProps {
  state: SubtreeState;
}

interface TreeVisualizationProps {
  nodes: Map<string, TreeNode>;
  rootId: string | null;
  label: string;
  currentNodeId: string | null;
  visitedNodes: Set<string>;
  comparedNodes: Set<string>;
  candidateNodes: string[];
  matchedSubtreeNodes: Set<string>;
  isCompareMode: boolean;
  mismatchNodeId?: string | null;
  showAsSubRoot?: boolean;
}

function TreeVisualization({ 
  nodes, 
  rootId, 
  label, 
  currentNodeId, 
  visitedNodes,
  comparedNodes,
  candidateNodes,
  matchedSubtreeNodes,
  isCompareMode,
  mismatchNodeId,
  showAsSubRoot = false,
}: TreeVisualizationProps) {
  const levels = getTreeLevels(nodes, rootId);
  const maxLevelWidth = Math.pow(2, Math.max(levels.length - 1, 0));
  const width = Math.max(180, maxLevelWidth * 48);

  // Empty tree
  if (!rootId || nodes.size === 0) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-muted-foreground mb-2">{label}</span>
        <div className="flex items-center justify-center h-24 w-full bg-muted/20 rounded-xl border-2 border-dashed border-muted">
          <span className="text-muted-foreground text-sm">Empty (null)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-medium text-muted-foreground mb-2">{label}</span>
      <div className="relative overflow-x-auto">
        <svg 
          width={width} 
          height={levels.length * 56 + 16}
          viewBox={`0 0 ${width} ${levels.length * 56 + 16}`}
        >
          {/* Draw edges */}
          {levels.map((level, levelIndex) => {
            const levelWidth = Math.pow(2, levelIndex);
            const spacing = width / levelWidth;
            
            return level.map((nodeId, nodeIndex) => {
              if (!nodeId) return null;
              const node = nodes.get(nodeId);
              if (!node) return null;
              
              const x = spacing / 2 + nodeIndex * spacing;
              const y = levelIndex * 56 + 22;
              const childSpacing = spacing / 2;
              const childY = y + 56;
              
              return (
                <g key={`edges-${nodeId}`}>
                  {node.left && (
                    <line
                      x1={x}
                      y1={y + 14}
                      x2={x - childSpacing / 2}
                      y2={childY - 14}
                      stroke={matchedSubtreeNodes.has(nodeId) ? "hsl(142.1 76.2% 36.3%)" : "hsl(var(--muted-foreground))"}
                      strokeWidth={matchedSubtreeNodes.has(nodeId) ? 2 : 1.5}
                      opacity={matchedSubtreeNodes.has(nodeId) ? 0.8 : 0.4}
                    />
                  )}
                  {node.right && (
                    <line
                      x1={x}
                      y1={y + 14}
                      x2={x + childSpacing / 2}
                      y2={childY - 14}
                      stroke={matchedSubtreeNodes.has(nodeId) ? "hsl(142.1 76.2% 36.3%)" : "hsl(var(--muted-foreground))"}
                      strokeWidth={matchedSubtreeNodes.has(nodeId) ? 2 : 1.5}
                      opacity={matchedSubtreeNodes.has(nodeId) ? 0.8 : 0.4}
                    />
                  )}
                </g>
              );
            });
          })}
          
          {/* Draw nodes */}
          {levels.map((level, levelIndex) => {
            const levelWidth = Math.pow(2, levelIndex);
            const spacing = width / levelWidth;
            
            return level.map((nodeId, nodeIndex) => {
              const x = spacing / 2 + nodeIndex * spacing;
              const y = levelIndex * 56 + 22;
              
              // Handle null placeholder
              if (!nodeId) {
                return (
                  <g key={`null-${levelIndex}-${nodeIndex}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={12}
                      fill="transparent"
                      stroke="hsl(var(--muted))"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      opacity={0.5}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={8}
                      opacity={0.5}
                    >
                      ∅
                    </text>
                  </g>
                );
              }
              
              const node = nodes.get(nodeId);
              if (!node) return null;
              
              const isCurrent = nodeId === currentNodeId;
              const isVisited = visitedNodes.has(nodeId);
              const isCompared = comparedNodes.has(nodeId);
              const isCandidate = candidateNodes.includes(nodeId);
              const isMatched = matchedSubtreeNodes.has(nodeId);
              const isMismatch = nodeId === mismatchNodeId;
              
              let fillColor = "hsl(var(--muted))";
              let strokeColor = "hsl(var(--border))";
              
              if (isMismatch) {
                fillColor = "hsl(0 84.2% 60.2%)"; // red
                strokeColor = "hsl(0 84.2% 60.2%)";
              } else if (isMatched) {
                fillColor = "hsl(142.1 76.2% 36.3%)"; // green
                strokeColor = "hsl(142.1 76.2% 36.3%)";
              } else if (isCurrent) {
                fillColor = isCompareMode ? "hsl(280 70% 50%)" : "hsl(var(--primary))"; // purple for compare, blue for search
                strokeColor = isCompareMode ? "hsl(280 70% 50%)" : "hsl(var(--primary))";
              } else if (isCompared) {
                fillColor = "hsl(142.1 76.2% 36.3%)"; // green
                strokeColor = "hsl(142.1 76.2% 36.3%)";
              } else if (isVisited && !isCompareMode) {
                fillColor = "hsl(var(--muted-foreground))";
                strokeColor = "hsl(var(--muted-foreground))";
              } else if (isCandidate && !isCompareMode) {
                fillColor = "hsl(45 93% 47%)"; // gold
                strokeColor = "hsl(45 93% 47%)";
              }
              
              return (
                <motion.g
                  key={nodeId}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    x: isMismatch ? [0, -3, 3, -3, 3, 0] : 0,
                  }}
                  transition={{ 
                    scale: { delay: levelIndex * 0.05 },
                    x: { duration: 0.4, repeat: isMismatch ? 2 : 0 }
                  }}
                >
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isCurrent ? 3 : isCandidate && !isCompareMode ? 2.5 : 2}
                    animate={{
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: isCurrent ? Infinity : 0,
                      repeatType: "reverse",
                    }}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isCurrent || isCompared || isMatched || isMismatch || (isCandidate && !isCompareMode) || isVisited ? "white" : "hsl(var(--foreground))"}
                    fontSize={11}
                    fontWeight={600}
                  >
                    {node.value}
                  </text>
                </motion.g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
}

export function SubtreeOfAnotherTreeBoard({ state }: SubtreeOfAnotherTreeBoardProps) {
  const currentSearchNode = getCurrentSearchNode(state);
  const { nodeR, nodeS } = getCurrentCompareNodes(state);
  const isCompareMode = state.phase === 'compare';
  
  // Get matched subtree nodes for highlighting
  const matchedSubtreeNodes = state.found && state.matchedSubtreeRoot
    ? getSubtreeNodes(state.rootNodes, state.matchedSubtreeRoot)
    : new Set<string>();

  // Status display
  const getStatusDisplay = () => {
    if (state.phase === 'done') {
      if (state.found) {
        return { icon: <Check className="h-5 w-5" />, text: "Match Found!", color: "text-green-500", bg: "bg-green-500/10 border-green-500/30" };
      }
      return { icon: <X className="h-5 w-5" />, text: "No Match", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" };
    }
    if (state.phase === 'compare') {
      if (state.mismatch) {
        return { icon: <X className="h-5 w-5" />, text: "Mismatch!", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" };
      }
      return { icon: <GitCompare className="h-5 w-5" />, text: "Comparing...", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" };
    }
    return { icon: <Search className="h-5 w-5" />, text: "Searching...", color: "text-primary", bg: "bg-primary/10 border-primary/30" };
  };

  const status = getStatusDisplay();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status Indicator */}
      <motion.div 
        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 ${status.bg}`}
        animate={{
          scale: state.mismatch || state.found ? [1, 1.02, 1] : 1,
        }}
      >
        <span className={status.color}>{status.icon}</span>
        <span className={`font-medium ${status.color}`}>{status.text}</span>
      </motion.div>

      {/* Side-by-side trees */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 w-full">
        <TreeVisualization
          nodes={state.rootNodes}
          rootId={state.rootId}
          label="Root Tree"
          currentNodeId={isCompareMode ? nodeR : currentSearchNode}
          visitedNodes={state.visitedNodes}
          comparedNodes={state.comparedNodes}
          candidateNodes={state.candidateNodes}
          matchedSubtreeNodes={matchedSubtreeNodes}
          isCompareMode={isCompareMode}
          mismatchNodeId={state.mismatch ? nodeR : null}
        />
        
        <div className="hidden md:flex items-center self-center">
          <div className="w-px h-24 bg-border" />
          <span className="mx-2 text-muted-foreground text-xs">contains?</span>
          <div className="w-px h-24 bg-border" />
        </div>
        
        <div className="md:hidden w-full flex items-center justify-center">
          <div className="h-px w-12 bg-border" />
          <span className="mx-2 text-muted-foreground text-xs">contains?</span>
          <div className="h-px w-12 bg-border" />
        </div>
        
        <TreeVisualization
          nodes={state.subRootNodes}
          rootId={state.subRootId}
          label="SubRoot Tree"
          currentNodeId={isCompareMode ? nodeS : null}
          visitedNodes={new Set()}
          comparedNodes={isCompareMode ? new Set(
            state.compareOrderSub.slice(0, state.compareIndex).filter(Boolean) as string[]
          ) : new Set()}
          candidateNodes={[]}
          matchedSubtreeNodes={state.found ? new Set(
            Array.from(state.subRootNodes.keys())
          ) : new Set()}
          isCompareMode={isCompareMode}
          mismatchNodeId={state.mismatch ? nodeS : null}
          showAsSubRoot
        />
      </div>

      {/* Mismatch reason */}
      <AnimatePresence>
        {state.mismatch && state.mismatchReason && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <p className="text-sm text-red-400">{state.mismatchReason}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Search Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45 93% 47%)" }} />
          <span className="text-muted-foreground">Candidate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(280 70% 50%)" }} />
          <span className="text-muted-foreground">Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Matched</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Mismatch</span>
        </div>
      </div>

      {/* Progress */}
      {state.phase === 'search' && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Node {state.searchIndex + 1} / {state.searchOrder.length}
          </span>
        </div>
      )}
      {state.phase === 'compare' && !state.mismatch && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Comparison {state.compareIndex + 1} / {state.compareOrderRoot.length}
          </span>
        </div>
      )}
    </div>
  );
}
