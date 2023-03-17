import type { Request, Response } from "express";
import openai from "./_openai";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGIN || "*"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!req.body?.prompt) {
    return res.status(400).json({ error: 'Missing parameter "prompt"' });
  }

  try {
    const { data } = await openai.createCompletion({
      model: "text-curie-001",
      n: 1,
      max_tokens: 300,
      temperature: 0.5,
      stop: ".",
      prompt: req.body.prompt,
      best_of: 4,
    });

    return res.status(200).json({ suggestion: data.choices[0]?.text || null });
  } catch (error) {
    console.error(error);

    return res
      .status(error?.response?.status || 500)
      .json({ error: error.message });
  }
}
