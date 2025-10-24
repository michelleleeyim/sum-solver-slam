import { motion } from "framer-motion";
import { EDState } from "@/core/engine/encodeDecode";

interface EncodeDecodeBoardProps {
  state: EDState;
}

export function EncodeDecodeBoard({ state }: EncodeDecodeBoardProps) {
  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-4">
        <motion.div
          className={`px-4 py-2 rounded-lg font-semibold ${
            state.phase === "encode"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          animate={{ scale: state.phase === "encode" ? 1.05 : 1 }}
        >
          Encoding
        </motion.div>
        <div className="text-muted-foreground">→</div>
        <motion.div
          className={`px-4 py-2 rounded-lg font-semibold ${
            state.phase === "decode"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          animate={{ scale: state.phase === "decode" ? 1.05 : 1 }}
        >
          Decoding
        </motion.div>
      </div>

      {/* Encoding Phase */}
      {state.phase === "encode" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center text-sm text-muted-foreground font-semibold">
            Original Words
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {state.words.map((word, idx) => (
              <motion.div
                key={idx}
                className={`px-6 py-3 rounded-lg font-mono text-lg font-bold ${
                  idx < state.encodeIdx
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : idx === state.encodeIdx
                    ? "bg-accent text-accent-foreground border-2 border-accent animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
                animate={{
                  scale: idx === state.encodeIdx ? 1.1 : 1,
                }}
              >
                {word}
              </motion.div>
            ))}
          </div>

          {state.encoded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-card border-2 border-primary rounded-lg"
            >
              <div className="text-sm text-muted-foreground font-semibold mb-2">
                Encoded String:
              </div>
              <div className="font-mono text-lg font-bold text-primary break-all">
                {state.encoded}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Decoding Phase */}
      {state.phase === "decode" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center text-sm text-muted-foreground font-semibold">
            Encoded String
          </div>
          <div className="p-4 bg-card border-2 border-primary rounded-lg">
            <div className="font-mono text-lg font-bold break-all">
              {state.encoded.split("").map((char, idx) => (
                <span
                  key={idx}
                  className={
                    idx < state.decodePos
                      ? "text-primary/40"
                      : idx === state.decodePos
                      ? "text-accent bg-accent/20 px-1"
                      : "text-foreground"
                  }
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {state.decoded.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <div className="text-sm text-muted-foreground font-semibold mb-2 text-center">
                Decoded Words:
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {state.decoded.map((word, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-6 py-3 rounded-lg font-mono text-lg font-bold bg-primary text-primary-foreground border-2 border-primary"
                  >
                    {word}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Done Phase */}
      {state.phase === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-xl font-bold text-primary">
              Encoding & Decoding Complete!
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-sm text-muted-foreground mb-2">Original</div>
              <div className="space-y-1">
                {state.words.map((word, idx) => (
                  <div key={idx} className="font-mono text-sm">
                    {word}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-sm text-muted-foreground mb-2">Decoded</div>
              <div className="space-y-1">
                {state.decoded.map((word, idx) => (
                  <div key={idx} className="font-mono text-sm text-primary">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
