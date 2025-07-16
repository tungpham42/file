import React, { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

const FileConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/.netlify/functions/convert-pdf", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <Form.Group>
        <Form.Label>Upload PDF</Form.Label>
        <Form.Control
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.files?.length) setFile(input.files[0]);
          }}
        />
      </Form.Group>

      <Button
        className="mt-3"
        onClick={handleConvert}
        disabled={!file || loading}
      >
        {loading ? <Spinner animation="border" size="sm" /> : "Convert to DOCX"}
      </Button>

      {downloadUrl && (
        <div className="mt-3">
          <a href={downloadUrl} download="converted.docx">
            <Button variant="success">Download DOCX</Button>
          </a>
        </div>
      )}
    </div>
  );
};

export default FileConverter;
