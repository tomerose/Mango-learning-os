/**
 * MangoOS V14.7 — File Reader
 * Promise-based FileReader wrapper. Fixes Agent file upload empty content bug.
 */
export interface ReadFileResult {
  name: string;
  type: string;
  size: number;
  text: string;
  error?: string;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_TYPES = ["text/plain", "text/markdown", "text/csv", "application/json", "text/html"];

export function isSupportedFile(file: File): boolean {
  // Check by extension too (some systems don't set MIME correctly)
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const supportedExts = ["txt", "md", "markdown", "csv", "json", "html"];
  return SUPPORTED_TYPES.includes(file.type) || supportedExts.includes(ext);
}

export function isLargeFile(file: File): boolean {
  return file.size > MAX_SIZE;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function readFileAsText(file: File): Promise<ReadFileResult> {
  return new Promise((resolve) => {
    // Validate
    if (!file || file.size === 0) {
      resolve({ name: file?.name ?? "unknown", type: file?.type ?? "", size: 0, text: "", error: "文件为空" });
      return;
    }

    if (isLargeFile(file)) {
      resolve({ name: file.name, type: file.type, size: file.size, text: "", error: `文件过大 (${formatFileSize(file.size)})，请上传小于 10 MB 的文件` });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      if (!text || text.trim().length === 0) {
        resolve({ name: file.name, type: file.type, size: file.size, text: "", error: "文件内容为空或无法读取" });
        return;
      }
      resolve({ name: file.name, type: file.type, size: file.size, text });
    };

    reader.onerror = () => {
      resolve({ name: file.name, type: file.type, size: file.size, text: "", error: `读取失败: ${reader.error?.message ?? "未知错误"}` });
    };

    // For unsupported binary types, try reading as text anyway with warning
    if (!isSupportedFile(file)) {
      reader.readAsText(file);
      // We still read it but the caller should check file.type
      return;
    }

    reader.readAsText(file);
  });
}

export async function readMultipleFiles(files: File[]): Promise<ReadFileResult[]> {
  const results = await Promise.all(files.map(f => readFileAsText(f)));
  return results;
}
