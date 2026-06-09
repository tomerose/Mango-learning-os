"use client";

/**
 * MangoOS V14.8.1 — Mango用户书 (Farewell Letter)
 *
 * 内测版封存告别信。显示在主页面，告知用户：
 * 1. 感谢这段时间的陪伴
 * 2. 内测版即将封存
 * 3. 学习阶段结束后会有更好的产品
 * 4. 人生是多面的，要坚持自己
 *
 * 7天后自动隐藏。用户可手动关闭。
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, BookOpen, Compass } from "lucide-react";

const LETTER_SEEN_KEY = "mango-farewell-v14-seen";

function hasBeenSeen(): boolean {
  if (typeof window === "undefined") return true;
  const ts = localStorage.getItem(LETTER_SEEN_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < 30 * 24 * 60 * 60 * 1000; // 30 days
}

function markSeen() {
  if (typeof window !== "undefined") {
    localStorage.setItem(LETTER_SEEN_KEY, String(Date.now()));
  }
}

export function MangoFarewellLetter() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!hasBeenSeen()) {
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setVisible(false);
    markSeen();
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          />

          {/* Letter card */}
          <motion.div
            className="fixed inset-x-4 top-[10%] z-[61] mx-auto max-w-lg overflow-hidden rounded-2xl bg-surface shadow-2xl md:inset-x-auto md:w-full"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header gradient */}
            <div className="relative bg-gradient-to-br from-amber-100 via-primary/10 to-amber-50 px-6 py-8">
              <button
                onClick={close}
                className="absolute right-4 top-4 rounded-full p-1.5 text-foreground/30 hover:text-foreground/60 hover:bg-black/5 transition-all"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20">
                  <Heart className="size-5 text-primary" fill="currentColor" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
                  第三自习室 · 致用户书
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-foreground">
                嘿，谢谢你。
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                在过去的一段时间里，你打开了 MangoOS，也许生成过一份复习讲义，
                也许只是看了看。无论如何，你的每一次点击都让这个内测版有了意义。
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">MangoOS 内测版 V0.1 即将封存。</strong>
                在过去几周里，从一个想法变成了 101 个页面、26 张数据库表、
                11 个数据源、一个完整的 AI Agent 系统。它不完美，但它是真实的。
              </p>

              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-amber-200/40">
                <p className="text-xs leading-relaxed text-foreground/80">
                  这一个多月里，<strong className="text-foreground">一千多人选择了注册 MangoOS</strong>，
                  我们收集到了<strong className="text-foreground">超过 60 条建议和鼓励</strong>。
                  我的 QQ 邮箱每天都在响 — 有人说"期末复习讲义帮了大忙"，
                  有人说"Mind Garden 陪她度过了最难的一周"，有人说"这个项目让他也想学编程"。
                  服务器用量一次次超标，我一边手忙脚乱地扩容，一边忍不住笑。
                  <strong className="text-foreground">这真的是一次很特殊的旅程。</strong>
                  谢谢你们让一个学生的业余项目变得如此真实。
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-bg-subtle p-4">
                <BookOpen className="size-5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">接下来</p>
                  <p className="text-xs mt-0.5">
                    创始人要回到学习中去了 — 期末、英语、数学、金融。
                    学习阶段结束后，会有更好的产品回来。
                    不是一个功能堆砌的工具，而是一个真正理解学生的 AI 学习系统。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-bg-subtle p-4">
                <Compass className="size-5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">人生是多面的</p>
                  <p className="text-xs mt-0.5">
                    考试不是全部。绩点不是全部。AI 不是全部。
                    你看过的书、遇见的人、熬过的夜、坚持过的自己 —
                    这些才是真正塑造你的东西。
                    不要被别人定义的成功限制了想象力。
                    <strong className="text-foreground">坚持自己。</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/60">
                MangoOS 会回来的。在这之前，好好学习，好好生活。
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-6 py-4 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/50">
                2026.06.09 · 第三自习室出品
              </span>
              <button
                onClick={close}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-on hover:bg-primary-hover transition-colors"
              >
                我知道了
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
