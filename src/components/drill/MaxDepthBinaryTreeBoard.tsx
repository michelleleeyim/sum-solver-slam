import { motion, AnimatePresence } from "framer-motion";
import { DepthState, getTreeLevels, getCurrentNodeId, isLeafNode } from "@/core/engine/maxDepthBinaryTree";

interface MaxDepthBinaryTreeBoardProps {
  state: DepthState;
}

export function MaxDepthBinaryTreeBoard({ state }: MaxDepthBinaryTreeBoardProps) {
  const levels = getTreeLevels(state.nodes, state.rootId);
  const currentNodeId = getCurrentNodeId(state);
  const maxWidth = Math.max(400, Math.pow(2, levels.length - 1) * 70);

  // Empty tree case
  if (state.nodes.size === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center h-48 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">Empty Tree</p>
            <p className="text-sm text-muted-foreground">Maximum Depth = 0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Max Depth Counter */}
      <motion.div 
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30"
        animate={{
          scale: state.phase === 'traversing' && state.maxDepth > 0 ? [1, 1.02, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Depth</p>
          <motion.p 
            className="text-3xl font-bold text-foreground"
            key={state.currentDepth}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {state.currentDepth}
          </motion.p>
        </div>
        <div className="w-px h-12 bg-border" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Depth</p>
          <motion.p 
            className="text-4xl font-bold text-green-500"
            key={state.maxDepth}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {state.maxDepth}
          </motion.p>
        </div>
      </motion.div>

      {/* Tree Visualization with Level Labels */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[320px] py-4" style={{ minWidth: Math.max(320, maxWidth + 60) }}>
          <svg 
            className="w-full" 
            viewBox={`-30 0 ${maxWidth + 60} ${levels.length * 80 + 40}`}
            style={{ minHeight: levels.length * 80 + 40 }}
          >
            {/* Level background bands */}
            {levels.map((_, levelIndex) => {
              const y = levelIndex * 80 + 10;
              const isCurrentLevel = state.phase === 'traversing' && 
                currentNodeId && 
                state.depthAtNode.get(currentNodeId) === levelIndex + 1;
              
              return (
                <motion.rect
                  key={`level-bg-${levelIndex}`}
                  x={-30}
                  y={y}
                  width={maxWidth + 60}
                  height={70}
                  fill={isCurrentLevel ? "hsl(var(--primary) / 0.05)" : "transparent"}
                  rx={8}
                  animate={{
                    fill: isCurrentLevel ? "hsl(var(--primary) / 0.08)" : "transparent",
                  }}
                />
              );
            })}

            {/* Level labels */}
            {levels.map((_, levelIndex) => (
              <text
                key={`level-label-${levelIndex}`}
                x={-20}
                y={levelIndex * 80 + 45}
                textAnchor="start"
                fill="hsl(var(--muted-foreground))"
                fontSize={11}
                fontWeight={500}
              >
                L{levelIndex + 1}
              </text>
            ))}

            {/* Draw edges first */}
            {levels.map((level, levelIndex) => {
              const levelWidth = Math.pow(2, levelIndex);
              const spacing = maxWidth / levelWidth;
              
              return level.map((nodeId, nodeIndex) => {
                const node = state.nodes.get(nodeId);
                if (!node) return null;
                
                const x = spacing / 2 + nodeIndex * spacing;
                const y = levelIndex * 80 + 40;
                
                const childSpacing = spacing / 2;
                const childY = y + 80;
                
                return (
                  <g key={`edges-${nodeId}`}>
                    {node.left && (
                      <motion.line
                        x1={x}
                        y1={y + 20}
                        x2={x - childSpacing / 2}
                        y2={childY - 20}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {node.right && (
                      <motion.line
                        x1={x}
                        y1={y + 20}
                        x2={x + childSpacing / 2}
                        y2={childY - 20}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </g>
                );
              });
            })}
            
            {/* Draw nodes */}
            {levels.map((level, levelIndex) => {
              const levelWidth = Math.pow(2, levelIndex);
              const spacing = maxWidth / levelWidth;
              
              return level.map((nodeId, nodeIndex) => {
                const node = state.nodes.get(nodeId);
                if (!node) return null;
                
                const x = spacing / 2 + nodeIndex * spacing;
                const y = levelIndex * 80 + 40;
                
                const isCurrent = nodeId === currentNodeId;
                const isVisited = state.visitedNodes.has(nodeId);
                const isLeaf = isLeafNode(state.nodes, nodeId);
                const nodeDepth = state.depthAtNode.get(nodeId) || 0;
                const isDeepestVisited = nodeDepth === state.maxDepth && isVisited;
                const isInQueue = state.queue.some(q => q.nodeId === nodeId);
                
                let fillColor = "hsl(var(--muted))";
                let strokeColor = "hsl(var(--border))";
                
                if (isCurrent) {
                  fillColor = "hsl(var(--primary))";
                  strokeColor = "hsl(var(--primary))";
                } else if (isDeepestVisited) {
                  fillColor = "hsl(142.1 76.2% 36.3%)"; // green for deepest
                  strokeColor = "hsl(142.1 76.2% 36.3%)";
                } else if (isVisited) {
                  fillColor = "hsl(199.4 95.5% 53.8%)"; // cyan for visited
                  strokeColor = "hsl(199.4 95.5% 53.8%)";
                } else if (isInQueue) {
                  fillColor = "hsl(280 70% 50%)"; // purple for in queue
                  strokeColor = "hsl(280 70% 50%)";
                }
                
                return (
                  <motion.g
                    key={nodeId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: levelIndex * 0.1 + nodeIndex * 0.05 }}
                  >
                    {/* Leaf indicator */}
                    {isLeaf && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={28}
                        fill="none"
                        stroke="hsl(142.1 76.2% 36.3% / 0.3)"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                    
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={22}
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
                      fill={isCurrent || isVisited || isInQueue ? "white" : "hsl(var(--foreground))"}
                      fontSize={14}
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

      {/* DFS Recursion Stack Visualization */}
      <AnimatePresence>
        {state.traversalMode === 'dfs' && state.phase === 'traversing' && state.recursionStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm font-medium text-muted-foreground">Recursion Stack (depth)</span>
            <div className="flex flex-col-reverse items-center gap-1">
              {state.recursionStack.map((item, index) => {
                const node = state.nodes.get(item.nodeId);
                const isTop = index === state.recursionStack.length - 1;
                return (
                  <motion.div
                    key={`stack-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm
                      ${isTop ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
                  >
                    <span className="font-bold">{node?.value}</span>
                    <span className="text-xs opacity-70">d={item.depth}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BFS Queue Visualization */}
      <AnimatePresence>
        {state.traversalMode === 'bfs' && state.phase === 'traversing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm font-medium text-muted-foreground">Queue (FIFO)</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg min-h-[48px]">
              {state.queue.length === 0 ? (
                <span className="text-muted-foreground text-sm">Empty</span>
              ) : (
                state.queue.map((item, index) => {
                  const node = state.nodes.get(item.nodeId);
                  return (
                    <motion.div
                      key={`queue-${item.nodeId}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex flex-col items-center px-3 py-1 rounded-lg
                        ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-purple-500/20 text-purple-400'}`}
                    >
                      <span className="font-mono font-bold">{node?.value}</span>
                      <span className="text-[10px] opacity-70">d={item.depth}</span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500" />
          <span className="text-muted-foreground">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Deepest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-green-500/50 border-dashed" />
          <span className="text-muted-foreground">Leaf</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-muted border border-border" />
          <span className="text-muted-foreground">Unvisited</span>
        </div>
      </div>

      {/* Progress */}
      {state.phase === 'traversing' && (
        <div className="text-center">
          <span className="text-muted-foreground">
            Node {Math.min(state.currentIndex + 1, state.traversalOrder.length)} / {state.traversalOrder.length}
          </span>
        </div>
      )}
    </div>
  );
}
