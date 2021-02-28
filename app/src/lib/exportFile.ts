export const exportFile = (content: any, fileName: string, contentType = 'text/plain') => {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(content, null, 2)], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
