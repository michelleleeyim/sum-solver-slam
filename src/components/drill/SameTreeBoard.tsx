import { motion, AnimatePresence } from "framer-motion";
import { SameTreeState, getTreeLevels, getCurrentNodes, TreeNode } from "@/core/engine/sameTree";
import { Check, X } from "lucide-react";

interface SameTreeBoardProps {
  state: SameTreeState;
}

interface TreeVisualizationProps {
  nodes: Map<string, TreeNode>;
  rootId: string | null;
  label: string;
  currentNodeId: string | null;
  comparedNodes: Set<string>;
  mismatchNodeId: string | null;
  isMismatch: boolean;
  queue: string[];
  showQueue: boolean;
}

function TreeVisualization({ 
  nodes, 
  rootId, 
  label, 
  currentNodeId, 
  comparedNodes,
  mismatchNodeId,
  isMismatch,
  queue,
  showQueue
}: TreeVisualizationProps) {
  const levels = getTreeLevels(nodes, rootId);
  const maxLevelWidth = Math.pow(2, Math.max(levels.length - 1, 0));
  const width = Math.max(200, maxLevelWidth * 50);

  // Empty tree
  if (!rootId || nodes.size === 0) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-muted-foreground mb-2">{label}</span>
        <div className="flex items-center justify-center h-32 w-full bg-muted/20 rounded-xl border-2 border-dashed border-muted">
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
          height={levels.length * 60 + 20}
          viewBox={`0 0 ${width} ${levels.length * 60 + 20}`}
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
              const y = levelIndex * 60 + 25;
              const childSpacing = spacing / 2;
              const childY = y + 60;
              
              return (
                <g key={`edges-${nodeId}`}>
                  {node.left && (
                    <line
                      x1={x}
                      y1={y + 15}
                      x2={x - childSpacing / 2}
                      y2={childY - 15}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1.5}
                      opacity={0.4}
                    />
                  )}
                  {node.right && (
                    <line
                      x1={x}
                      y1={y + 15}
                      x2={x + childSpacing / 2}
                      y2={childY - 15}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1.5}
                      opacity={0.4}
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
              const y = levelIndex * 60 + 25;
              
              // Handle null placeholder
              if (!nodeId) {
                return (
                  <g key={`null-${levelIndex}-${nodeIndex}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={14}
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
              const isCompared = comparedNodes.has(nodeId);
              const isMismatchNode = nodeId === mismatchNodeId;
              const isInQueue = queue.includes(nodeId);
              
              let fillColor = "hsl(var(--muted))";
              let strokeColor = "hsl(var(--border))";
              
              if (isMismatchNode) {
                fillColor = "hsl(0 84.2% 60.2%)"; // red
                strokeColor = "hsl(0 84.2% 60.2%)";
              } else if (isCurrent) {
                fillColor = "hsl(var(--primary))";
                strokeColor = "hsl(var(--primary))";
              } else if (isCompared) {
                fillColor = "hsl(142.1 76.2% 36.3%)"; // green
                strokeColor = "hsl(142.1 76.2% 36.3%)";
              } else if (isInQueue) {
                fillColor = "hsl(280 70% 50%)"; // purple
                strokeColor = "hsl(280 70% 50%)";
              }
              
              return (
                <motion.g
                  key={nodeId}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    x: isMismatchNode ? [0, -3, 3, -3, 3, 0] : 0,
                  }}
                  transition={{ 
                    scale: { delay: levelIndex * 0.05 },
                    x: { duration: 0.4, repeat: isMismatchNode ? 2 : 0 }
                  }}
                >
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isCurrent ? 3 : 2}
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
                    fill={isCurrent || isCompared || isMismatchNode || isInQueue ? "white" : "hsl(var(--foreground))"}
                    fontSize={12}
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
      
      {/* BFS Queue */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 flex flex-col items-center"
          >
            <span className="text-xs text-muted-foreground mb-1">Queue</span>
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded min-h-[28px] min-w-[60px] justify-center">
              {queue.length === 0 ? (
                <span className="text-xs text-muted-foreground">Empty</span>
              ) : (
                queue.slice(0, 4).map((id, idx) => {
                  const node = nodes.get(id);
                  return (
                    <motion.span
                      key={id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center font-mono
                        ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-purple-500/20 text-purple-400'}`}
                    >
                      {node?.value}
                    </motion.span>
                  );
                })
              )}
              {queue.length > 4 && (
                <span className="text-xs text-muted-foreground">+{queue.length - 4}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SameTreeBoard({ state }: SameTreeBoardProps) {
  const { nodeP, nodeQ } = getCurrentNodes(state);
  const showQueue = state.traversalMode === 'bfs' && state.phase === 'traversing';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Match Status Indicator */}
      <motion.div 
        className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${
          state.mismatch 
            ? 'bg-red-500/10 border-red-500/30' 
            : state.result === 'same'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-muted/30 border-border'
        }`}
        animate={{
          scale: state.mismatch ? [1, 1.02, 1] : 1,
        }}
      >
        {state.mismatch ? (
          <>
            <X className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-500">Mismatch Found!</span>
          </>
        ) : state.result === 'same' ? (
          <>
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-500">Trees are Identical!</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium text-muted-foreground">Comparing...</span>
          </>
        )}
      </motion.div>

      {/* Side-by-side trees */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 w-full">
        <TreeVisualization
          nodes={state.nodesP}
          rootId={state.rootP}
          label="Tree P"
          currentNodeId={nodeP}
          comparedNodes={state.comparedNodes}
          mismatchNodeId={state.mismatchNodeP}
          isMismatch={state.mismatch}
          queue={state.queueP}
          showQueue={showQueue}
        />
        
        <div className="hidden md:flex items-center self-center">
          <div className="w-px h-32 bg-border" />
          <span className="mx-2 text-muted-foreground text-sm">vs</span>
          <div className="w-px h-32 bg-border" />
        </div>
        
        <div className="md:hidden w-full flex items-center justify-center">
          <div className="h-px w-16 bg-border" />
          <span className="mx-2 text-muted-foreground text-sm">vs</span>
          <div className="h-px w-16 bg-border" />
        </div>
        
        <TreeVisualization
          nodes={state.nodesQ}
          rootId={state.rootQ}
          label="Tree Q"
          currentNodeId={nodeQ}
          comparedNodes={state.comparedNodes}
          mismatchNodeId={state.mismatchNodeQ}
          isMismatch={state.mismatch}
          queue={state.queueQ}
          showQueue={showQueue}
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
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Matched</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Mismatch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-dashed border-muted" />
          <span className="text-muted-foreground">Null</span>
        </div>
      </div>

      {/* Progress */}
      {state.phase === 'traversing' && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Comparison {state.currentIndex + 1} / {state.traversalOrderP.length}
          </span>
        </div>
      )}
    </div>
  );
}
