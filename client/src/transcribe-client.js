import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from "@aws-sdk/client-transcribe-streaming";
import { SAMPLE_RATE, SERVICE_HOST, PORT } from "./config";
import { getAudioStream } from './microphone';
import { sendMessage } from "./socket";

const REGION = "us-east-2";
const language = "en-US";

export const createTranscribeClient = async () => {
  const response = await fetch(`http://${SERVICE_HOST}:${PORT}/credentials`);
  if (!response.ok) {
    throw new Error("Failed to obtain credentials from server");
  }
  const { accessKeyId, secretAccessKey, sessionToken } = await response.json();
  console.log("Obtained AWS credentials from server");

  return new TranscribeStreamingClient({
    region: REGION,
    credentials: { accessKeyId, secretAccessKey, sessionToken },
  });
};

export const startStreaming = async (transcribeClient, callback, microphoneStream, socket) => {
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: language,
      MediaEncoding: "pcm",
      MediaSampleRateHertz: SAMPLE_RATE,
      AudioStream: getAudioStream(microphoneStream),
    });

    const data = await transcribeClient.send(command);
    for await (const event of data.TranscriptResultStream) {
      const results = event.TranscriptEvent.Transcript.Results;
      if (results.length && !results[0]?.IsPartial) {
        const newTranscript = results[0].Alternatives[0].Transcript;
        if (socket && socket.readyState === WebSocket.OPEN) {
            sendMessage(socket, newTranscript);
        } else {
            console.log("WebSocket is not open");
        }
        callback(newTranscript + " ");
      }
    }
};