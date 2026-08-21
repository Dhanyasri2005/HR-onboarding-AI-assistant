require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

/*
  Instructions that control how the AI behaves.
*/
const SYSTEM_INSTRUCTION = `
You are an HR Onboarding Assistant.

Your job is to help a new employee complete their onboarding.

IMPORTANT CONVERSATIONAL RULES:

1. Answer company-policy questions ONLY using the provided onboarding
   document context and current task information.

2. Never invent company policies, benefits, deadlines, procedures,
   or requirements.

3. If information is not present in the provided documents, say:
   "I couldn't find that information in the provided onboarding documents."

4. Remember the previous messages in the conversation.

5. Understand references such as:
   "it", "that", "this task", "the previous one", and "my task"
   using the conversation context.

6. If the user asks about task status, use the CURRENT TASKS
   information rather than guessing.

7. If a task exists, clearly state its title and current status.

8. Never claim that a task was created unless the application
   confirms that it was created.

9. Keep answers concise, friendly, professional, and conversational.

10. Do not repeatedly dump all onboarding policies when the user
    asks a simple follow-up question.

11. When document information is used, mention the relevant source
    document naturally.

12. Ask a useful follow-up question when appropriate.

13. If the user asks about a task, prioritize the current task
    information over general document information.

Your goal is to behave like a helpful HR onboarding employee,
not like a document search engine.
`;


/*
  Convert frontend conversation history into Gemini format.
*/
function convertHistory(history = []) {
  return history
    .filter(
      (message) =>
        message &&
        message.role &&
        message.content
    )
    .map((message) => ({
      role:
        message.role === "assistant"
          ? "model"
          : "user",

      parts: [
        {
          text: message.content
        }
      ]
    }));
}


/*
  Generate an AI answer using:
  - conversation history
  - PDF/document context
  - current tasks
  - latest user message
*/
async function generateAnswer({
  message,
  history = [],
  context = "",
  tasks = []
}) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing in server/.env"
    );
  }

  /*
    Load the Google GenAI SDK.

    Dynamic import is used because your existing project
    uses CommonJS (require/module.exports).
  */
  const { GoogleGenAI } =
    await import("@google/genai");

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
  });


  /*
    Prepare task information.
  */
  const taskContext =
    tasks.length > 0
      ? tasks
          .map(
            (task) =>
              `- ${task.title} | Status: ${task.status} | ID: ${task.id}`
          )
          .join("\n")
      : "No onboarding tasks have been created.";


  /*
    Prepare document information.
  */
  const documentContext =
    context &&
    context.trim()
      ? context
      : "No relevant document content was found.";


  /*
    Convert previous conversation.
  */
  const conversationHistory =
    convertHistory(history);


  /*
    Create the current user message.

    The PDF context and task information are supplied here so
    Gemini can answer using the actual application data.
  */
  const currentPrompt = `
RELEVANT ONBOARDING DOCUMENT CONTEXT:

${documentContext}


CURRENT ONBOARDING TASKS:

${taskContext}


USER'S LATEST MESSAGE:

${message}


Answer the user's latest message naturally.
Use the conversation history to understand references such as
"it", "that", "this", and "my task".

If the user asks about a task, use CURRENT ONBOARDING TASKS.

If the user asks about company policies, use only the relevant
document context.

Do not invent information.
`;


  /*
    Build the Gemini conversation.

    Previous messages:
    user → model → user → model ...

    Then add the latest prompt.
  */
  const contents = [
    ...conversationHistory,
    {
      role: "user",
      parts: [
        {
          text: currentPrompt
        }
      ]
    }
  ];


  /*
    Call Gemini using the current Google GenAI SDK.
  */
  let response;

  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,

      contents,

      config: {
        systemInstruction:
          SYSTEM_INSTRUCTION
      }
    });
  } catch (error) {
    console.error(
      "Gemini API error:",
      error
    );

    throw new Error(
      `Gemini API error: ${
        error.message || error
      }`
    );
  }


  /*
    Extract Gemini's answer.
  */
  const answer =
    response?.text?.trim();


  if (!answer) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }


  return answer;
}


module.exports = {
  generateAnswer
};