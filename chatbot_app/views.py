# chatbot_app/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
import uuid
from .google_ai import GoogleAIClient

class ChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer

    # chatbot_app/views.py
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        session = self.get_object()
        user_message = request.data.get('message', '').strip()

        if not user_message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # First, get the existing chat history BEFORE creating the new user message
            chat_history = session.messages.all().order_by('timestamp')
            
            # Save user message
            user_msg = ChatMessage.objects.create(
                session=session,
                message_type='user',
                content=user_message
            )

            # Generate AI response with history (excluding the one we just created)
            ai_client = GoogleAIClient()
            ai_response = ai_client.generate_response(user_message, chat_history)

            # Save AI response
            assistant_msg = ChatMessage.objects.create(
                session=session,
                message_type='assistant',
                content=ai_response
            )

            return Response({
                'user_message': ChatMessageSerializer(user_msg).data,
                'assistant_message': ChatMessageSerializer(assistant_msg).data,
                'session_id': session.session_id
            })

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Full error: {error_details}")
            
            return Response(
                {'error': f'Failed to process message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['post'])
    def create_session(self, request):
        try:
            session_id = str(uuid.uuid4())
            session = ChatSession.objects.create(session_id=session_id)
            
            return Response({
                'session_id': session.session_id,
                'message': 'Chat session created successfully',
                'created_at': session.created_at
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to create session: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a specific session"""
        session = self.get_object()
        messages = session.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)




# class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = ChatMessage.objects.all()
#     serializer_class = ChatMessageSerializer

#     def get_queryset(self):
#         session_id = self.request.query_params.get('session_id')
#         if session_id:
#             try:
#                 session = ChatSession.objects.get(session_id=session_id)
#                 return session.messages.all().order_by('timestamp')
#             except ChatSession.DoesNotExist:
#                 return ChatMessage.objects.none()
#         return ChatMessage.objects.none()