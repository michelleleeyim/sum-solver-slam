import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface StringBoardProps {
  s: string;
  L: number;
  R: number;
  lastAction?: "SKIP_LEFT" | "SKIP_RIGHT" | "COMPARE";
  compareResult?: "match" | "mismatch" | null;
}

const isAlnum = (ch: string) => /[0-9A-Za-z]/.test(ch);

export function StringBoard({ s, L, R, lastAction, compareResult }: StringBoardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* String display */}
      <div className="flex flex-wrap justify-center gap-1 mb-6 px-2">
        {s.split("").map((char, idx) => {
          const isLeft = idx === L;
          const isRight = idx === R;
          const isAlnumChar = isAlnum(char);
          const isActive = isLeft || isRight;
          
          let bgColor = "bg-card";
          let textColor = "text-foreground";
          let borderColor = "border-border";
          
          if (!isAlnumChar) {
            textColor = "text-muted-foreground opacity-40";
            borderColor = "border-muted";
          }
          
          if (isActive && compareResult === "match") {
            bgColor = "bg-green-500/20";
            borderColor = "border-green-500";
          } else if (isActive && compareResult === "mismatch") {
            bgColor = "bg-destructive/20";
            borderColor = "border-destructive";
          } else if (isLeft) {
            bgColor = "bg-blue-500/10";
            borderColor = "border-blue-500";
          } else if (isRight) {
            bgColor = "bg-pink-500/10";
            borderColor = "border-pink-500";
          }
          
          return (
            <motion.div
              key={idx}
              className={`
                relative flex items-center justify-center
                min-w-[32px] h-12 px-2 rounded-lg border-2
                ${bgColor} ${borderColor}
                transition-all duration-200
              `}
              animate={
                compareResult === "mismatch" && isActive
                  ? { x: [-2, 2, -2, 2, 0] }
                  : compareResult === "match" && isActive
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              <span className={`text-lg font-mono ${textColor}`}>
                {char === " " ? "·" : char}
              </span>
              
              {/* Pointer indicators */}
              {isLeft && (
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <ChevronDown className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-bold text-blue-500">L</span>
                </motion.div>
              )}
              
              {isRight && (
                <motion.div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <ChevronDown className="h-5 w-5 text-pink-500 rotate-180" />
                  <span className="text-xs font-bold text-pink-500">R</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
