import type { Request, Response } from "express";
import openai from "./_openai";

function normalizeSuggestion(suggestion?: string) {
  if (!suggestion) {
    return null;
  }

  return suggestion.replace(/^(\n)+/i, "").replace(/(\n)+/i, "\n");
}

function findNonOverlappingParts(prompt: string, suggestion: string) {
  const wordsPrompt = prompt.trim().split(" ");
  const wordsSuggestion = suggestion.trim().split(" ");

  let overlapIndex = -1;
  for (let i = wordsPrompt.length - 1; i >= 0; i--) {
    let match = true;
    for (let j = 0; j < wordsPrompt.length - i; j++) {
      if (wordsPrompt[i + j] !== wordsSuggestion[j]) {
        match = false;
        break;
      }
    }

    if (match) {
      overlapIndex = i;
      break;
    }
  }

  if (overlapIndex >= 0) {
    return wordsSuggestion.slice(wordsPrompt.length - overlapIndex).join(" ");
  }

  return suggestion;
}

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGIN || "*"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");

  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!req.body?.prompt) {
    return res.status(400).json({ error: 'Missing parameter "prompt"' });
  }

  if (Number.isNaN(req.body.temperature)) {
    return res.status(400).json({ error: 'Invalid parameter "temperature"' });
  }

  try {
    const { data } = await openai.createCompletion({
      model: "text-curie-001",
      n: 1,
      max_tokens: 300,
      temperature: req.body.temperature || 0.5,
      frequency_penalty: 1.0,
      stop: ".",
      prompt: req.body.prompt,
      best_of: 3,
    });

    const normalizedSuggestion = normalizeSuggestion(data.choices[0]?.text);
    const nonOverlappingSuggestion = findNonOverlappingParts(
      req.body.prompt,
      normalizedSuggestion
    );

    console.log("Suggestion:", nonOverlappingSuggestion);
    return res.status(200).json({ suggestion: nonOverlappingSuggestion });
  } catch (error) {
    console.error(error);

    return res
      .status(error?.response?.status || 500)
      .json({ error: error.message });
  }
}
