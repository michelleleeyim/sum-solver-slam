import { motion, AnimatePresence } from "framer-motion";
import { TreeNode, InvertTreeState, getTreeLevels, getCurrentNodeId } from "@/core/engine/invertBinaryTree";

interface InvertBinaryTreeBoardProps {
  state: InvertTreeState;
}

export function InvertBinaryTreeBoard({ state }: InvertBinaryTreeBoardProps) {
  const levels = getTreeLevels(state.nodes, state.rootId);
  const currentNodeId = getCurrentNodeId(state);
  const maxWidth = Math.pow(2, levels.length - 1) * 60;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Tree Visualization */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[320px] py-4" style={{ minWidth: Math.max(320, maxWidth) }}>
          <svg 
            className="w-full" 
            viewBox={`0 0 ${Math.max(400, maxWidth)} ${levels.length * 80 + 40}`}
            style={{ minHeight: levels.length * 80 + 40 }}
          >
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
                        animate={{ opacity: 0.5 }}
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
                        animate={{ opacity: 0.5 }}
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
                const isSwapped = state.swappedNodes.has(nodeId);
                const isInQueue = state.queue.includes(nodeId);
                
                let fillColor = "hsl(var(--muted))";
                let strokeColor = "hsl(var(--border))";
                
                if (isCurrent) {
                  fillColor = "hsl(var(--primary))";
                  strokeColor = "hsl(var(--primary))";
                } else if (isSwapped) {
                  fillColor = "hsl(142.1 76.2% 36.3%)"; // green
                  strokeColor = "hsl(142.1 76.2% 36.3%)";
                } else if (isInQueue) {
                  fillColor = "hsl(199.4 95.5% 53.8%)"; // cyan
                  strokeColor = "hsl(199.4 95.5% 53.8%)";
                }
                
                return (
                  <motion.g
                    key={nodeId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: levelIndex * 0.1 + nodeIndex * 0.05 }}
                  >
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
                      fill={isCurrent || isSwapped || isInQueue ? "white" : "hsl(var(--foreground))"}
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
                state.queue.map((nodeId, index) => {
                  const node = state.nodes.get(nodeId);
                  return (
                    <motion.div
                      key={nodeId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold
                        ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-cyan-500/20 text-cyan-400'}`}
                    >
                      {node?.value}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Info */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Swapped</span>
        </div>
        {state.traversalMode === 'bfs' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-500" />
            <span className="text-muted-foreground">In Queue</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-muted border-2 border-border" />
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
