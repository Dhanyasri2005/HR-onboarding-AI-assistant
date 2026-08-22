# HR Onboarding AI Employee

## Project Overview

The HR Onboarding AI Employee is a conversational web application designed to help new employees complete their onboarding process.

The application allows employees to ask questions about company policies, benefits, IT setup, and onboarding procedures. The assistant provides answers based on the provided onboarding documents rather than relying on unsupported information.

The application also supports onboarding task management. Users can create tasks conversationally, check the status of existing tasks, and continue a conversation naturally using previous messages as context.

The project uses mock onboarding data and documents, so no real employee or customer information is required.

## Purpose of the Project

The main purpose of this project is to demonstrate how an AI-powered HR onboarding assistant can combine:

- Document-based information retrieval
- Conversational AI
- Multi-turn conversation handling
- Task creation and tracking
- PDF document processing
- REST API development
- A web-based chat interface

The system is designed to behave like an HR onboarding employee rather than simply acting as a document search system.

## Main Features

### Conversational Onboarding Assistant

Employees can ask natural-language questions about onboarding.

For example:

- What benefits are available?
- What is required for IT setup?
- What is the onboarding process?
- Can you explain this policy?

The assistant uses the available onboarding documents to provide relevant answers.

### Document-Grounded Answers

The application contains onboarding PDF documents such as:

- Benefits information
- IT policy
- Onboarding FAQ

The PDFs are processed by the backend and divided into smaller text chunks.

When a user asks a question, the application searches the relevant document content and provides the matching information to the AI model.

If the required information is not available in the provided documents, the assistant is instructed not to invent an answer.

### Conversational Task Management

Users can create onboarding tasks through natural language.

For example:

> Create a task to complete the IT setup.

The application creates the task and stores information such as:

- Task ID
- Task title
- Current status
- Creation time

The available task statuses are:

- Pending
- In Progress
- Completed

Users can also ask about their tasks conversationally.

For example:

> What is the status of my IT setup task?

The system checks the current task information and returns the actual status.

### Multi-Turn Conversation

The application maintains conversation history between messages.

This allows the assistant to understand references such as:

- "it"
- "that"
- "this task"
- "the previous one"
- "my task"

For example:

> User: What benefits are available?

> Assistant: The available benefits are ...

> User: What about that?

The previous conversation is provided to the AI model so that the assistant can understand the reference.

### Task Storage

For this project, onboarding tasks are stored using a JSON file rather than a production database.

This keeps the implementation simple and suitable for the assessment's mock-data requirement.

The task API supports:

- Getting tasks
- Creating tasks
- Updating task status

### PDF Processing

The backend reads the onboarding PDF files from the server documents directory.

The PDF text is cleaned, divided into chunks, and stored in memory for document searching.

A simple keyword-based relevance score is used to identify relevant document chunks before sending the context to the AI model.

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

React and Vite are used to build a responsive conversational interface and provide a fast frontend development and build workflow.

### Backend

- Node.js
- Express.js
- REST APIs

Express is used to create the backend APIs for chat, documents, tasks, and health checking.

### AI

- Google Gemini
- `@google/genai`

Gemini is used to generate conversational responses using:

- Relevant onboarding document content
- Current task information
- Previous conversation history
- The user's latest message

The AI is instructed to remain grounded in the supplied information and avoid inventing company policies or task information.

### Document Processing

- `pdf-parse`

The PDF parser is used to extract text from the onboarding documents.

### Other Technologies

- CORS
- dotenv
- JSON-based task storage
- GitHub
- Vercel

## Architecture

The application is divided into two main parts:

### Client

The React client provides the user interface for:

- Chatting with the onboarding assistant
- Viewing onboarding tasks
- Creating tasks
- Updating task status
- Viewing conversational responses

### Server

The Express server provides APIs for:

- `/api/chat`
- `/api/tasks`
- `/api/documents`
- `/api/health`

The server processes the onboarding documents, manages tasks, and communicates with Gemini.

## Application Flow

When a user asks an onboarding question:

1. The client sends the user's message and conversation history to the server.
2. The server checks whether the request is related to task creation or task status.
3. If it is a task request, the task system handles it using the current task data.
4. Otherwise, the server searches the onboarding document content.
5. Relevant document content is selected as context.
6. Current task information and conversation history are also prepared.
7. The information is sent to Gemini.
8. Gemini generates a concise conversational response.
9. The server sends the response and relevant document sources back to the client.
10. The client displays the response in the chat interface.

## Conversational Design

The assistant is designed with several conversational rules.

It:

- Uses the provided onboarding documents for policy-related answers.
- Uses the current task information for task-related questions.
- Maintains previous conversation context.
- Understands conversational references.
- Does not claim that a task was created unless the task system actually creates it.
- Avoids repeatedly displaying all available policies.
- Gives concise and conversational responses.
- States when information cannot be found in the provided onboarding documentation.

## Task Management

Tasks are stored in:

```text
Server/data/tasks.json
