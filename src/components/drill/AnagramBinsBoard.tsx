import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, AlertCircle } from "lucide-react";
import { GAState, GABin, GAItem, formatSignature } from "@/core/engine/groupAnagrams";

interface AnagramBinsBoardProps {
  state: GAState;
  selectedWord: string | null;
  onSelectWord: (wordId: string | null) => void;
  onAssign: (wordId: string, binId: string) => void;
  onCreateBin: () => void;
  feedback: { wordId: string; binId: string; ok: boolean } | null;
}

export function AnagramBinsBoard({
  state,
  selectedWord,
  onSelectWord,
  onAssign,
  onCreateBin,
  feedback
}: AnagramBinsBoardProps) {
  const handleWordClick = (wordId: string) => {
    if (selectedWord === wordId) {
      onSelectWord(null);
    } else {
      onSelectWord(wordId);
    }
  };

  const handleBinClick = (binId: string) => {
    if (selectedWord) {
      onAssign(selectedWord, binId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Word Tray */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Words to Group
        </h3>
        <div className="flex flex-wrap gap-2 min-h-[80px] p-4 bg-card/50 rounded-lg border border-border">
          <AnimatePresence mode="popLayout">
            {state.items.map((item) => (
              <WordCard
                key={item.id}
                item={item}
                isSelected={selectedWord === item.id}
                onClick={() => handleWordClick(item.id)}
                feedback={feedback?.wordId === item.id ? feedback : null}
              />
            ))}
          </AnimatePresence>
          {state.items.length === 0 && (
            <div className="w-full text-center text-muted-foreground text-sm py-4">
              All words grouped! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Bins Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Anagram Groups
          </h3>
          <button
            onClick={onCreateBin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Bin
          </button>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {state.bins.map((bin) => (
              <BinCard
                key={bin.id}
                bin={bin}
                mode={state.mode}
                showKey={state.showKeys}
                isSelectable={!!selectedWord}
                onClick={() => handleBinClick(bin.id)}
                feedback={feedback?.binId === bin.id ? feedback : null}
              />
            ))}
          </AnimatePresence>
          
          {state.bins.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground text-sm py-8 border border-dashed border-border rounded-lg">
              Create a bin to start grouping anagrams
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WordCard({ 
  item, 
  isSelected, 
  onClick,
  feedback 
}: { 
  item: GAItem; 
  isSelected: boolean; 
  onClick: () => void;
  feedback: { ok: boolean } | null;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isSelected ? 1.05 : 1,
        y: isSelected ? -4 : 0
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative px-4 py-2.5 rounded-lg font-medium text-sm
        transition-all duration-200
        ${isSelected 
          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/50" 
          : "bg-card hover:bg-accent text-foreground border border-border"
        }
        ${feedback && !feedback.ok ? "animate-shake" : ""}
      `}
    >
      {item.word}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          {feedback.ok ? (
            <Check className="h-5 w-5 text-green-500 bg-background rounded-full p-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive bg-background rounded-full p-0.5" />
          )}
        </motion.div>
      )}
    </motion.button>
  );
}

function BinCard({ 
  bin, 
  mode,
  showKey,
  isSelectable,
  onClick,
  feedback 
}: { 
  bin: GABin; 
  mode: "count" | "sort";
  showKey: boolean;
  isSelectable: boolean;
  onClick: () => void;
  feedback: { ok: boolean } | null;
}) {
  const isEmpty = bin.items.length === 0;
  
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={isSelectable ? { scale: 1.02 } : {}}
      whileTap={isSelectable ? { scale: 0.98 } : {}}
      onClick={isSelectable ? onClick : undefined}
      disabled={!isSelectable}
      className={`
        relative p-4 rounded-lg border-2 text-left
        transition-all duration-200 min-h-[120px]
        ${isSelectable 
          ? "border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer" 
          : "border-border bg-card"
        }
        ${isEmpty ? "bg-card/50" : "bg-card"}
        ${feedback && !feedback.ok ? "animate-shake border-destructive" : ""}
      `}
    >
      <div className="space-y-2">
        {isEmpty ? (
          <div className="text-muted-foreground text-sm font-medium">
            Empty Bin
          </div>
        ) : (
          <>
            {showKey && bin.key && (
              <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {formatSignature(bin.key, mode)}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {bin.items.map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2.5 py-1 bg-primary/10 text-primary rounded text-sm font-medium"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </>
        )}
      </div>
      
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          {feedback.ok ? (
            <Check className="h-6 w-6 text-green-500 bg-background rounded-full p-1" />
          ) : (
            <AlertCircle className="h-6 w-6 text-destructive bg-background rounded-full p-1" />
          )}
        </motion.div>
      )}
    </motion.button>
  );
}
