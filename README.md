# LECTURE NOTES SMART ASSISTANT

> Real-time lecture transcription and AI-powered Q&A — record a live lecture, get an instant transcript, and chat with an AI about the content.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![AWS Transcribe](https://img.shields.io/badge/AWS-Transcribe-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/transcribe/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991?logo=openai&logoColor=white)](https://platform.openai.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

**Lecture Notes Smart Assistant** streams microphone audio from the browser to **AWS Transcribe** for real-time speech-to-text, then lets you ask questions about the transcript using **OpenAI GPT**. The live transcript appears word-by-word as you speak, and the AI chat has full context of everything said in the lecture.

```
Browser mic → WebSocket → Node/Express → AWS Transcribe → live transcript
                                       ↓
                              OpenAI GPT Q&A chat
```

## Features

- **Real-time transcription** — live captions stream to the screen as you speak via AWS Transcribe Streaming
- **AI chat** — ask anything about the recorded lecture; GPT answers with full transcript context
- **Server-vended credentials** — the server obtains short-lived AWS tokens via STS and serves them to the client; no secrets in the browser bundle
- **Transcript persistence** — completed transcripts and chat history are stored in S3; local files are cleaned up automatically
- **WebSocket pipeline** — low-latency audio streaming directly from browser to cloud
- **Docker-ready server** — single-file production bundle in a minimal Alpine image

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript, Parcel |
| Backend | Node.js 20, TypeScript, Express, ws (WebSocket) |
| Speech-to-text | AWS Transcribe Streaming |
| AI chat | OpenAI GPT-3.5-turbo |
| Cloud infra | AWS S3, AWS Secrets Manager, AWS STS |
| Container | Docker (Alpine) |
| Build | esbuild, ESLint, Prettier |

## Prerequisites

- Node.js 20+
- AWS account with Transcribe, S3, Secrets Manager, and STS access
- OpenAI API key stored in AWS Secrets Manager under the key `OPENAI_API_KEY`

## Getting Started

### 1. Server

```bash
cd server
yarn install
yarn bundle:prod
node ./dist/index.js
```

The server starts on **port 8080**.

The server resolves credentials from the environment (IAM role, instance profile, or environment variables). Configure the following:

| Variable | Description |
|---|---|
| `AWS_REGION` | AWS region (e.g. `us-east-2`) |
| `TRANSCRIBE_ROLE_ARN` | ARN of the IAM role the server assumes to vend client credentials |
| `AWS_ACCESS_KEY_ID` | AWS credentials (not needed when using an IAM role) |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials (not needed when using an IAM role) |

The OpenAI API key is fetched automatically from AWS Secrets Manager at runtime — no environment variable needed.

### 2. Client

Copy the example env file and set the server host:

```bash
cd client
cp .env.example .env
# edit .env and set PARCEL_PUBLIC_SERVICE_HOST if not running locally
npm install
npm start
```

Open [http://localhost:1234](http://localhost:1234) and allow microphone access when prompted.

### Docker (server only)

```bash
cd server
yarn bundle:prod
docker build -t lecture-notes-sa .
docker run -p 8080:8080 lecture-notes-sa
```

## Usage

1. Click **Start Recording** — the client fetches short-lived AWS credentials from the server, then begins streaming your mic to AWS Transcribe
2. Speak; the live transcript appears on screen in real time
3. Click **Stop Recording** — the transcript is uploaded to S3 and the local copy is cleaned up
4. Type a question in the chat box and press **Send** or **Enter**
5. GPT answers based on the full lecture transcript, read from S3

## Project Structure

```
.
├── client/                      # Browser frontend (Parcel, vanilla JS)
│   ├── .env.example             # Environment variable template
│   └── src/
│       ├── app.js               # Main UI logic and event handling
│       ├── config.js            # Host/port config (reads from env)
│       ├── microphone.js        # Microphone capture
│       ├── transcribe-client.js # AWS Transcribe Streaming client
│       ├── socket.js            # WebSocket connection to server
│       └── question.js          # OpenAI Q&A API calls
└── server/                      # Node.js backend (TypeScript, Express)
    └── src/
        ├── index.ts             # Express + WebSocket server entry point
        ├── aws/
        │   ├── s3-client.ts     # S3 read/write helpers
        │   ├── sts-client.ts    # STS credential vending
        │   └── secrets/         # Secrets Manager client with cache
        ├── openai/              # GPT chat handler
        └── transcribe/          # WebSocket transcription handler
```

## License

MIT — see [LICENSE](LICENSE).
