"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   PWA Install Prompt — App-like installation banner
   ═══════════════════════════════════════════════════════════════ */

export function PWAInstallPrompt() {
  const [show, setShow] = React.useState(false);
  const [deferred, setDeferred] = React.useState<any>(null);

  React.useEffect(() => {
    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShow(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    deferred.prompt();
    const result = await deferred.userChoice;
    if (result.outcome === "accepted") setShow(false);
    setDeferred(null);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-20 left-4 right-4 z-[160] card-floating p-4 flex items-center gap-4 max-w-sm mx-auto"
        >
          <div className="size-10 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
            <Download className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-small font-medium">安装 Mango</p>
            <p className="text-caption mt-0.5">添加到主屏幕，获得原生 App 体验</p>
          </div>
          <button onClick={handleInstall}
            className="shrink-0 rounded-xl bg-primary text-primary-on px-4 py-2 text-xs font-medium">
            安装
          </button>
          <button onClick={() => setShow(false)} className="shrink-0 size-8 flex items-center justify-center">
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
