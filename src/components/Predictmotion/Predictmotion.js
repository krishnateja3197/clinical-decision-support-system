import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const messages = [
  "Analyzing text input...",
  "Extracting key symptoms...",
  "Predicting disease based on symptoms...",
  "Generating SHAP AI visualization...",
  "Finalizing results..."
];

export default function Predictionmotion() {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  let messageIndex = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentMessage(messages[messageIndex]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-1/2 bg-sky-950 text-white text-lg font-semibold">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </motion.div>
      <p className="mt-4">{currentMessage}</p>
    </div>
  );
}
