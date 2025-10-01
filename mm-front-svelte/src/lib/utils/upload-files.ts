export async function uploadFiles(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/docu01dxu/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (res.ok) {
      uploadedUrls.push(data.secure_url);
    } else {
      console.error("Erro ao enviar para Cloudinary:", data);
      throw new Error(data.error?.message || "Erro no upload");
    }
  }

  return uploadedUrls;
}
