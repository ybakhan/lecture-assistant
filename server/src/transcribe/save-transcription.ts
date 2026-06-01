import { promises as fs } from "fs";
import { Save } from "../aws/s3-client";

export const SaveTranscription = async (fileName: string, filePath: string) => {
  fs.readFile(filePath, "utf8")
    .then((transcription) => {
      console.log(
        `[save-transcription] uploading transcription to s3. transcription: ${fileName}`,
      );

      const transcriptionKey: string = "transcriptions/" + fileName;
      Save(transcriptionKey, transcription).then((_) => {
        console.log(
          `[save-transcription] uploaded transcription to s3: ${transcriptionKey}`,
        );
        return fs.rm(filePath);
      }).then(() => {
        console.log(`[save-transcription] deleted local file: ${filePath}`);
      });
    })
    .catch((err) => {
      console.error(
        `[save-transcription] failed to read transcription. transcription: ${fileName}`,
        err,
      );
    });
};
