import type { Request, Response } from "express";
import openai from "./_openai";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { data } = await openai.createCompletion({
      model: "davinci",
      n: 1,
      max_tokens: 256,
      temperature: 0.7,
      stop: ".",
      prompt: req.body.prompt,
      best_of: 3,
    });

    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(error?.response?.status || 500)
      .json({ error: error.message });
  }
}
