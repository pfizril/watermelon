from multiprocessing import process
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import openai
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

            # Prepare messages for OpenAI (reverse to get chronological order)
            messages = []
            for msg in reversed(recent_messages):
                messages.append({
                    'role': msg.role,
                    'content': msg.content
                })

            # Add system prompt if this is the first message
            if len(messages) == 1:
                messages.insert(0, {
                    'role': 'system',
                    'content': '''You are a helpful AI assistant for a productivity and wellness app called "Smart Desktop Buddies".
                    You help users with:
                    - Task management and productivity tips
                    - Mood tracking and mental wellness
                    - Motivation and goal setting
                    - Calendar and time management
                    - Mindfulness and meditation guidance
                    - General wellness and self-improvement advice

                    Be friendly, encouraging, and supportive. Keep responses concise but helpful.
                    If users ask about app features, explain them clearly and suggest how to use them.'''
                })

            # Call OpenAI API
            client = openai.OpenAI(api_key= django_settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            assistant_message = response.choices[0].message.content

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
            print(f"OpenAI API error: {e}")
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