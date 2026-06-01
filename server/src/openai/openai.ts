import OpenAI from "openai";
import { Get } from "../aws/s3-client";
import { GetSecret } from "../aws/secrets/secrets";

export const Chat = async (
  fileName: string,
  question: string,
): Promise<string> => {
  const transcriptionKey = "transcriptions/" + fileName;
  console.log(`reading transcription from s3: ${transcriptionKey}`);
  const content = await Get(transcriptionKey);

  const apiKey = await GetSecret("OPENAI_API_KEY");
  const openAIClient = new OpenAI({
    apiKey,
  });

  return new Promise((resolve, reject) => {
    openAIClient.chat.completions
      .create({
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant. Answer questions based on the following lecture transcript:\n\n${content}`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        model: "gpt-3.5-turbo",
      })
      .then((completion) => {
        if (completion.choices.length === 0) {
          console.log("[openai] no response from OpenAI");
          resolve("no response from OpenAI");
        } else {
          const messageContent = completion.choices[0]?.message?.content;
          if (typeof messageContent === "string") {
            console.log(`[openai] OpenAI response: ${messageContent}`);
            resolve(messageContent);
          } else {
            console.log("[openai] invalid content in response");
            reject(new Error("invalid content in response"));
          }
        }
      })
      .catch((error) => {
        console.error("[openai] Error during OpenAI call:", error);
        reject(new Error("Error during OpenAI call"));
      });
  });
};
