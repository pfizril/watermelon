from multiprocessing import process
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import google.generativeai as genai
import os
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from django.conf import settings as django_settings


class ChatMessageListView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        return ChatMessage.objects.filter(user=self.request.user).order_by('-created_at')[:50]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user_message = request.data.get('message', '').strip()

        if not user_message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save user message
        ChatMessage.objects.create(
            user=request.user,
            role='user',
            content=user_message
        )

        try:
            # Get recent conversation history (last 10 messages)
            recent_messages = ChatMessage.objects.filter(
                user=request.user
            ).order_by('-created_at')[:10]

            # Configure Gemini API
            genai.configure(api_key=django_settings.GEMINI_API_KEY)
            
            # System instruction for the assistant
            system_instruction = '''You are a helpful AI assistant for a productivity and wellness app called "Smart Desktop Buddies".
You help users with:
- Task management and productivity tips
- Mood tracking and mental wellness
- Motivation and goal setting
- Calendar and time management
- Mindfulness and meditation guidance
- General wellness and self-improvement advice

Be friendly, encouraging, and supportive. Keep responses concise but helpful.
If users ask about app features, explain them clearly and suggest how to use them.'''
            
            # Get recent messages in chronological order (excluding the current message we just saved)
            # The most recent message is the one we just saved, so we skip it
            recent_messages_list = list(reversed(recent_messages[1:])) if len(recent_messages) > 1 else []
            
            # Build conversation history for Gemini
            # Gemini expects alternating user/assistant messages
            conversation_history = []
            
            # Check if this is the first conversation (no previous messages except the one we just saved)
            is_first_conversation = len(recent_messages_list) == 0
            
            # Build conversation history
            if not is_first_conversation:
                for msg in recent_messages_list:
                    if msg.role == 'user':
                        conversation_history.append({'role': 'user', 'parts': [msg.content]})
                    elif msg.role == 'assistant':
                        conversation_history.append({'role': 'model', 'parts': [msg.content]})
            
            # Initialize the model - using gemini-1.5-flash (faster and cost-effective)
            # Alternative: 'gemini-1.5-pro' for better quality
            model = genai.GenerativeModel(model_name='gemini-3-flash-preview')
            
            if is_first_conversation:
                # First message - include system instruction in the prompt
                full_prompt = f"{system_instruction}\n\nUser: {user_message}\nAssistant:"
                response = model.generate_content(full_prompt)
                assistant_message = response.text
            else:
                # Start a chat session with history
                # Prepend system instruction to the first user message in history
                if conversation_history and conversation_history[0]['role'] == 'user':
                    conversation_history[0]['parts'][0] = f"{system_instruction}\n\n{conversation_history[0]['parts'][0]}"
                
                chat = model.start_chat(history=conversation_history)
                
                # Send the current user message to Gemini
                response = chat.send_message(user_message)
                assistant_message = response.text

            # Save assistant response
            ChatMessage.objects.create(
                user=request.user,
                role='assistant',
                content=assistant_message
            )

            return Response({
                'message': assistant_message,
                'role': 'assistant'
            })

        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback response
            fallback_message = "I'm sorry, I'm having trouble connecting right now. Please try again later. " 

            ChatMessage.objects.create(
                user=request.user,
                role='assistant',
                content=fallback_message
            )

            return Response({
                'message': fallback_message,
                'role': 'assistant'
            }, status=status.HTTP_200_OK)