export function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <iframe
      src={url}
      title={title}
      className="h-[calc(100vh-14rem)] w-full rounded-lg border"
    />
  );
}
