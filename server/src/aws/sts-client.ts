import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

const ROLE_ARN = process.env.TRANSCRIBE_ROLE_ARN ?? "";
const stsClient = new STSClient({});

export type TemporaryCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

export const AssumeTranscribeRole = async (): Promise<TemporaryCredentials> => {
  const response = await stsClient.send(
    new AssumeRoleCommand({
      RoleArn: ROLE_ARN,
      RoleSessionName: `lecture-notes-${Date.now()}`,
      DurationSeconds: 900,
    }),
  );

  if (!response.Credentials) {
    throw new Error("[sts-client] No credentials returned from STS");
  }

  return {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken!,
  };
};
