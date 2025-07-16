import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
import FormData from "form-data";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const boundary = event.headers["content-type"]?.split("boundary=")[1];
  if (!boundary) {
    return { statusCode: 400, body: "Missing boundary" };
  }

  const form = new FormData();
  const buffer = Buffer.from(event.body as string, "base64");

  form.append("file", buffer, {
    filename: "input.pdf",
    contentType: "application/pdf",
  });

  try {
    const cloudmersiveApiKey = process.env.CLOUDMERSIVE_API_KEY;
    const response = await fetch(
      "https://api.cloudmersive.com/convert/pdf/to/docx",
      {
        method: "POST",
        headers: {
          Apikey: cloudmersiveApiKey || "",
          ...form.getHeaders(),
        },
        body: form as any,
      }
    );

    const converted = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="converted.docx"',
      },
      body: converted.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: `Conversion error: ${err}` };
  }
};
