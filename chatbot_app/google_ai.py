from google import genai
from google.genai import types
from django.conf import settings
import traceback
import os

class GoogleAIClient:
    """
    Client for interacting with the Google Gen AI API using the google-genai SDK.
    """
    def __init__(self):
        # 1. API Key Check
        self.api_key = settings.GOOGLE_API_KEY
        if not self.api_key:
            # Fallback to environment variable if settings is missing
            self.api_key = os.getenv("GOOGLE_API_KEY") 
            if not self.api_key:
                raise ValueError("GOOGLE_API_KEY not found in settings or environment variables.")
        
        # 2. Initialize the Client
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = 'gemini-2.5-flash'
        
        self.system_instruction_text = getattr(settings, 'SYSTEM_INSTRUCTION', None)
        if not self.system_instruction_text:
            self.system_instruction_text = os.getenv("SYSTEM_INSTRUCTION")

        if not self.system_instruction_text:
            # Provide a fallback default if the variable isn't set anywhere
            self.system_instruction_text = "You are a helpful AI assistant."
        # 🌟 FIX: Create the config object once to include the system instruction
        self.config = types.GenerateContentConfig(
            # Pass the system instruction here
            system_instruction=self.system_instruction_text
        )

    def _prepare_history(self, chat_history):
        """
        Converts Django/ORM chat history objects into a list of types.Content objects.
        """
        conversation_history = []
        for msg in chat_history:
            # The SDK uses "user" and "model" roles
            role = "user" if msg.message_type == "user" else "model"
            
            conversation_history.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg.content)]
                )
            )
        return conversation_history

    def generate_response(self, prompt, chat_history=None):
        try:
            print(f"Generating response for prompt: {prompt}")
            
            # Convert history format (handles None or empty list gracefully)
            history_count = chat_history.count() if chat_history else 0
            print(f"Chat history count: {history_count}")
            
            # Prepare the history in the new SDK format (list of types.Content)
            content_history = self._prepare_history(chat_history) if history_count > 0 else None
            
            # 4. Create a new chat session with the full configuration
            # 🌟 FIX: The 'config' object (containing system_instruction) is passed to 'config'
            # 'system_instruction' is NOT a valid argument for client.chats.create()
            chat = self.client.chats.create(
                model=self.model_name,
                history=content_history,
                config=self.config, # CORRECTED: Pass the config object here
            )
            
            # 5. Send the new prompt message
            # Note: No need to pass config again here unless you want to override something
            response = chat.send_message(prompt)
            return response.text
            
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Google AI Error details: {error_details}")
            # Maintain the playful error message style
            return f"I apologize, my beloved. It seems I broke a glitter glue bottle while talking to you! Error: {str(e)}"