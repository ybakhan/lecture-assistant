import { Chat } from "./openai";
import { Request, Response } from "express";
import { Save } from "../aws/s3-client";

export const HandlePostQuestion = async (req: Request, res: Response) => {
  try {
    const data: { tid: string; question: string } = req.body;

    console.log(`[question-handler] handling question transcriptionID: ${data.tid} message: ${data.question}`);

    Chat(data.tid, data.question)
      .then((result) => {
        // async write to S3
        const chatKey: string = "chats/" + data.tid;
        Save(chatKey, result)
          .then((_) => {
            console.log(`[question-handler] uploaded chat to s3: ${chatKey}`);
          });

        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ result });
      })
      .catch((error) => {
        res.setHeader("Content-Type", "text/plain");
        res.status(500).send(error);
        console.log(
          "[question-handler] open api returned an error response",
          error,
        );
      });
  } catch (error) {
    console.error(`[question-handler] Error handling post question`, error);
    res.setHeader("Content-Type", "text/plain");
    res.status(500).send(error);
  }
};
