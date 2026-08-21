# HR Onboarding AI Employee

## Project Purpose

The purpose of this project is to build an AI-powered HR onboarding assistant that helps new employees during their onboarding process. The application allows employees to ask questions about company benefits, IT setup, policies, and other onboarding information using the provided HR documents.

The assistant also allows employees to create onboarding tasks, view their tasks, check task status conversationally, and mark tasks as completed.

## Technology Stack

In this project, I used **React and Vite** for the frontend to build an interactive and responsive chatbot interface.

I used **JavaScript, Node.js, and Express.js** for the backend to handle API requests, document processing, chatbot interactions, and task management.

I used the **Google Gemini API with the `@google/genai` package** to provide natural conversational responses. Gemini uses the relevant onboarding document context and current task information to respond to the user.

I used **PDF documents** as the knowledge source for the HR onboarding assistant. The application retrieves relevant information from documents such as:

- `benefits.pdf`
- `it-policy.pdf`
- `onboarding-faq.pdf`

For task management, I used a **JSON file (`tasks.json`)** to store onboarding tasks, including the task ID, title, status, and creation time.

## Key Features

- AI-powered HR onboarding assistant
- Question answering using provided onboarding documents
- Benefits and IT policy assistance
- PDF-based document knowledge
- Natural multi-turn conversations
- Understanding of conversational references such as "it", "that", and "my task"
- Conversational onboarding task creation
- Conversational task status checking
- View all onboarding tasks
- Mark tasks as completed
- Display relevant document sources
- Responsive and user-friendly interface

## Conversational Interaction

The assistant maintains conversation context so that users can naturally continue a conversation without repeating the complete question.

For example:

**User:**  
What do I need to do for IT setup?

**Assistant:**  
You need to set up your company account, create a strong password, and enable MFA.

**User:**  
Create a task for that.

**Assistant:**  
Done! I've created "Complete my IT setup". It is currently Pending.

**User:**  
Is it completed?

**Assistant:**  
Not yet. "Complete my IT setup" is currently Pending.

This allows the user to check task status conversationally and demonstrates multi-turn interaction.

## Document-Grounded Responses

The assistant uses the provided onboarding documents when answering company-related questions.

For example, when the user asks about IT setup, the application retrieves relevant information from `it-policy.pdf` and provides that information to the AI for generating the response.

If the requested information is not available in the provided documents, the assistant avoids inventing company policies and informs the user that the information could not be found in the provided onboarding documents.

## Task Management

Users can create onboarding tasks through the chatbot.

For example:

> Create a task to complete my IT setup.

The task is stored in `Server/data/tasks.json` with information such as:

- Task ID
- Task title
- Task status
- Creation date

Tasks can be viewed in the **My Tasks** section and marked as completed.

Users can also ask the assistant about the current status of their tasks conversationally.

## Design Tradeoff

For this project, I chose **JSON-based task storage instead of MongoDB**.

The main reason was to keep the implementation simple and focus on the main requirements of the assessment, such as AI-based document question answering, multi-turn conversation, task creation, and conversational task status checking.

Using `tasks.json` avoids additional database configuration and keeps the project lightweight while still providing persistent task information.

For a production application, I would use MongoDB because it would be more suitable for multiple employees, larger amounts of data, concurrent updates, authentication, and scalability.

## Project Structure

```text
hr-onboarding-ai/
│
├── Client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Message.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── Server/
│   ├── documents/
│   │   ├── benefits.pdf
│   │   ├── it-policy.pdf
│   │   └── onboarding-faq.pdf
│   │
│   ├── data/
│   │   └── tasks.json
│   │
│   ├── services/
│   │   ├── documentService.js
│   │   └── aiService.js
│   │
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
## Future Improvements

- MongoDB-based task storage
- Employee authentication
- Multiple employee profiles
- Admin dashboard
- Role-based access control
- More HR onboarding documents
- Scalable document retrieval using a vector database
- Cloud deployment