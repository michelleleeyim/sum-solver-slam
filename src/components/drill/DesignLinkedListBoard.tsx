import { motion, AnimatePresence } from "framer-motion";
import { DesignLLState, getCurrentOperation, formatOperation } from "@/core/engine/designLinkedList";
import { Plus, Trash2, Search } from "lucide-react";

interface Props {
  state: DesignLLState;
  onSelectIndex: (index: number) => void;
  onSelectSlot: (index: number) => void;
}

export default function DesignLinkedListBoard({ state, onSelectIndex, onSelectSlot }: Props) {
  const { list, phase, selectedIndex, feedback } = state;
  const currentOp = getCurrentOperation(state);

  const isAddOperation = currentOp?.type === "addAtHead" || currentOp?.type === "addAtTail" || currentOp?.type === "addAtIndex";
  const isDeleteOperation = currentOp?.type === "deleteAtIndex";
  const isGetOperation = currentOp?.type === "get";

  const showInsertSlots = isAddOperation && currentOp?.type === "addAtIndex";

  return (
    <div className="space-y-6">
      {/* Current Operation Display */}
      {currentOp && phase === "operating" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30"
        >
          <div className="text-xs text-violet-400 mb-1 uppercase tracking-wide">
            Current Operation
          </div>
          <div className="text-xl font-mono font-bold text-violet-300">
            {formatOperation(currentOp)}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {currentOp.type === "get" && "Tap the node at the given index"}
            {currentOp.type === "addAtHead" && "The new node will be added at the beginning"}
            {currentOp.type === "addAtTail" && "The new node will be added at the end"}
            {currentOp.type === "addAtIndex" && "Tap where to insert the new node"}
            {currentOp.type === "deleteAtIndex" && "Tap the node to delete"}
          </div>
        </motion.div>
      )}

      {/* Linked List Visualization */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <span>Linked List</span>
          <span className="text-foreground/60">({list.length} nodes)</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-4 pt-2">
          {/* Head indicator / Insert at head slot */}
          {showInsertSlots && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSlot(0)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg border-2 border-dashed
                transition-all duration-200
                ${selectedIndex === 0 ? "border-violet-500 bg-violet-500/20" : "border-violet-500/40 bg-violet-500/10 hover:border-violet-500/60"}
              `}
            >
              <Plus className="w-4 h-4 text-violet-400" />
            </motion.button>
          )}

          {currentOp?.type === "addAtHead" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed border-emerald-500/50 bg-emerald-500/10"
            >
              <span className="font-mono font-bold text-emerald-400">{currentOp.val}</span>
            </motion.div>
          )}

          {(showInsertSlots || currentOp?.type === "addAtHead") && list.length > 0 && (
            <div className="mx-1 text-muted-foreground">→</div>
          )}

          {list.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <span className="font-mono text-sm">Empty list</span>
              <span>→</span>
              <span className="px-2 py-1 text-xs font-mono bg-muted/30 rounded">null</span>
            </div>
          ) : (
            list.map((value, idx) => (
              <div key={`${idx}-${value}`} className="flex items-center">
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectIndex(idx)}
                  disabled={phase !== "operating"}
                  className={`
                    relative flex flex-col items-center justify-center
                    w-14 h-14 rounded-lg border-2 font-mono transition-all duration-200
                    ${selectedIndex === idx ? "ring-2 ring-offset-2 ring-offset-background" : ""}
                    ${isDeleteOperation ? "hover:border-red-500 hover:bg-red-500/10" : ""}
                    ${isGetOperation ? "hover:border-blue-500 hover:bg-blue-500/10" : ""}
                    ${selectedIndex === idx && isDeleteOperation ? "border-red-500 bg-red-500/20 ring-red-500" : ""}
                    ${selectedIndex === idx && isGetOperation ? "border-blue-500 bg-blue-500/20 ring-blue-500" : ""}
                    ${selectedIndex !== idx ? "bg-muted/50 border-border" : ""}
                  `}
                >
                  <span className="text-lg font-bold">{value}</span>
                  <span className="text-[10px] text-muted-foreground">[{idx}]</span>

                  {/* Operation indicator icons */}
                  <AnimatePresence>
                    {selectedIndex === idx && isDeleteOperation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                    {selectedIndex === idx && isGetOperation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <Search className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Arrow and insert slot between nodes */}
                {idx < list.length - 1 && (
                  <>
                    {showInsertSlots ? (
                      <div className="flex items-center mx-1">
                        <span className="text-muted-foreground">→</span>
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSelectSlot(idx + 1)}
                          className={`
                            mx-1 flex items-center justify-center w-8 h-8 rounded border-2 border-dashed
                            transition-all duration-200
                            ${selectedIndex === idx + 1 ? "border-violet-500 bg-violet-500/20" : "border-violet-500/40 bg-violet-500/10 hover:border-violet-500/60"}
                          `}
                        >
                          <Plus className="w-3 h-3 text-violet-400" />
                        </motion.button>
                        <span className="text-muted-foreground">→</span>
                      </div>
                    ) : (
                      <div className="mx-2 text-muted-foreground">→</div>
                    )}
                  </>
                )}
              </div>
            ))
          )}

          {/* Insert at tail slot */}
          {showInsertSlots && list.length > 0 && (
            <>
              <div className="mx-1 text-muted-foreground">→</div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSlot(list.length)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg border-2 border-dashed
                  transition-all duration-200
                  ${selectedIndex === list.length ? "border-violet-500 bg-violet-500/20" : "border-violet-500/40 bg-violet-500/10 hover:border-violet-500/60"}
                `}
              >
                <Plus className="w-4 h-4 text-violet-400" />
              </motion.button>
            </>
          )}

          {/* Add at tail indicator */}
          {currentOp?.type === "addAtTail" && list.length > 0 && (
            <>
              <div className="mx-1 text-muted-foreground">→</div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-dashed border-emerald-500/50 bg-emerald-500/10"
              >
                <span className="font-mono font-bold text-emerald-400">{currentOp.val}</span>
              </motion.div>
            </>
          )}

          {/* Null terminator */}
          <div className="flex items-center">
            <div className="mx-2 text-muted-foreground">→</div>
            <div className="px-2 py-1 text-xs font-mono text-muted-foreground bg-muted/30 rounded">
              null
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Display */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              p-3 rounded-lg text-center font-medium
              ${feedback.type === "correct" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : ""}
              ${feedback.type === "wrong" ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
            `}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{state.currentOpIndex + 1} / {state.operations.length}</span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((state.currentOpIndex) / state.operations.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Phase indicators */}
      {phase === "ready" && (
        <div className="text-center py-4 text-muted-foreground">
          Tap <span className="font-semibold text-violet-400">Start</span> to begin
        </div>
      )}

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-lg font-semibold text-emerald-400">All Operations Complete!</div>
          <div className="text-sm text-muted-foreground mt-1">
            Final list: {list.length > 0 ? list.join(" → ") : "empty"} → null
          </div>
        </motion.div>
      )}
    </div>
  );
}
