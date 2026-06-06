export const metadata = {
  title: "隐私政策 · Mango Learning OS",
  description: "Mango Learning OS 隐私政策 — 数据所有权、存储方式、AI调用、用户权利",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="text-display font-serif mb-2">隐私政策</h1>
        <p className="text-sm text-fg-muted/60 mb-8">最后更新：2026年6月 · 第三自习室出品</p>

        <div className="prose prose-sm max-w-none space-y-6 text-[14px] leading-relaxed text-fg-muted/80">
          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">一、信息收集</h2>
            <p>Mango Learning OS 是一款 AI 学习工具。我们仅收集你主动提供的信息：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>注册时提供的邮箱地址（用于账号认证）</li>
              <li>你创建的学习内容（笔记、学习包、错题、闪卡等）</li>
              <li>你选择的学习偏好和身份设置</li>
            </ul>
            <p>我们不收集：位置信息、通讯录、相册、设备指纹、浏览历史或任何非学习相关的个人信息。</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">二、数据存储</h2>
            <p>你的数据存储方式由你选择：</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>本地存储模式</strong>：所有数据仅保存在你的浏览器中，不会上传到任何服务器。清除浏览器数据即删除全部内容。</li>
              <li><strong>云端存储模式</strong>：数据通过 Supabase 加密传输和存储。Supabase 使用行业标准的 AES-256 加密。</li>
            </ul>
            <p>你可以随时在「我的 → 隐私 → 数据存储」中切换模式。</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">三、AI 调用</h2>
            <p>当你使用 Mango Agent、学习包生成、心灵花园等功能时，相关内容会通过加密连接发送至 DeepSeek API 进行处理。</p>
            <ul className="list-disc list-inside space-y-1">
              <li>AI 调用仅用于当次内容生成，不会被用于模型训练</li>
              <li>我们不会将你的学习内容出售、分享或用于任何商业目的</li>
              <li>心灵花园的情感内容使用额外隐私保护，即使系统管理员也无法查看</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">四、用户权利</h2>
            <p>你拥有以下权利：</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>访问权</strong>：你可以查看你的所有学习数据</li>
              <li><strong>导出权</strong>：你可以导出学习包为 .docx / .md / HTML 格式</li>
              <li><strong>删除权</strong>：你可以在「我的 → 隐私 → 清除学习数据」中一键删除所有数据。删除操作不可撤销</li>
              <li><strong>知情权</strong>：你可以通过本页面了解我们如何处理你的数据</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">五、第三方服务</h2>
            <p>我们使用以下第三方服务，它们各有独立的隐私政策：</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong>（数据库与认证）：<a href="https://supabase.com/privacy" className="text-primary underline">隐私政策</a></li>
              <li><strong>DeepSeek</strong>（AI 模型）：<a href="https://platform.deepseek.com/privacy" className="text-primary underline">隐私政策</a></li>
              <li><strong>Vercel</strong>（托管平台）：<a href="https://vercel.com/legal/privacy-policy" className="text-primary underline">隐私政策</a></li>
              <li><strong>DiceBear</strong>（头像生成）：不收集个人信息</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">六、儿童隐私</h2>
            <p>Mango Learning OS 不面向 13 岁以下儿童。我们不会故意收集儿童的个人信息。如果你认为我们无意中收集了儿童信息，请联系我们立即删除。</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold text-fg mb-2">七、联系我们</h2>
            <div className="bg-bg-subtle rounded-xl p-4 space-y-1">
              <p>📧 邮箱：<strong>1211000567@qq.com</strong></p>
              <p>💬 微信：<strong>sillyfind2025 / tokentome222</strong></p>
              <p>🏢 出品方：<strong>第三自习室</strong></p>
            </div>
          </section>
        </div>

        <p className="text-[11px] text-fg-muted/30 mt-12 text-center">
          Mango Learning OS 内测版（V0.1）· 第三自习室出品 · 把焦虑变成准备
        </p>
      </div>
    </div>
  );
}
