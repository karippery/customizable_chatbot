import React, { type JSX } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import type { ChatMessage } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.message_type === 'user';

  // Function to detect and render lists properly
  const renderStructuredContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    
    let currentList: JSX.Element[] = [];
    let inList = false;

    lines.forEach((line, index) => {
      // Check if line starts with number for ordered list
      const numberedItemMatch = line.match(/^(\d+)\.\s+(.*)/);
      // Check if line starts with bullet for unordered list
      const bulletItemMatch = line.match(/^[-•*]\s+(.*)/);

      if (numberedItemMatch || bulletItemMatch) {
        if (!inList) {
          inList = true;
        }
        
        const text = numberedItemMatch ? numberedItemMatch[2] : bulletItemMatch![1];
        currentList.push(
          <Box 
            key={index} 
            component="li" 
            sx={{ 
              mb: 0.5,
              lineHeight: 1.5 
            }}
          >
            <Typography variant="body1" component="span">
              {formatSimpleMarkdown(text)}
            </Typography>
          </Box>
        );
      } else {
        // If we were in a list and now we're not, push the list
        if (inList && currentList.length > 0) {
          elements.push(
            <Box 
              key={`list-${index}`}
              component="ul" 
              sx={{ 
                pl: 2, 
                mb: 1.5,
                mt: 0.5 
              }}
            >
              {currentList}
            </Box>
          );
          currentList = [];
          inList = false;
        }
        
        // Add regular paragraph
        if (line.trim()) {
          elements.push(
            <Typography 
              key={index} 
              variant="body1" 
              sx={{ 
                mb: 1.5,
                lineHeight: 1.6 
              }}
            >
              {formatSimpleMarkdown(line)}
            </Typography>
          );
        }
      }
    });

    // Don't forget the last list
    if (inList && currentList.length > 0) {
      elements.push(
        <Box 
          key="final-list"
          component="ul" 
          sx={{ 
            pl: 2, 
            mb: 1.5,
            mt: 0.5 
          }}
        >
          {currentList}
        </Box>
      );
    }

    return elements.length > 0 ? elements : null;
  };

  // Simple markdown formatter for bold and italic
  const formatSimpleMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Process bold text
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;

    while ((boldMatch = boldRegex.exec(text)) !== null) {
      // Add text before the bold
      if (boldMatch.index > lastIndex) {
        parts.push(text.slice(lastIndex, boldMatch.index));
      }
      
      // Add bold text
      parts.push(
        <Box 
          component="span" 
          key={`bold-${boldMatch.index}`}
          sx={{ 
            fontWeight: 'bold',
            color: isUser ? 'inherit' : 'primary.main'
          }}
        >
          {boldMatch[1]}
        </Box>
      );
      
      lastIndex = boldRegex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    // If no formatting was applied, return the original text
    if (parts.length === 0) {
      return text;
    }

    return (
      <>
        {parts.map((part, index) => 
          typeof part === 'string' ? part : React.cloneElement(part, { key: index })
        )}
      </>
    );
  };

  const structuredContent = renderStructuredContent(message.content);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2.5,
          maxWidth: '70%',
          backgroundColor: isUser 
            ? 'primary.main' 
            : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
        className={isUser ? 'message-bubble-user' : 'message-bubble-assistant'}
      >
        {structuredContent || (
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}
          >
            {formatSimpleMarkdown(message.content)}
          </Typography>
        )}
        
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1.5,
            opacity: 0.7,
            fontSize: '0.75rem',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </Paper>
    </Box>
  );
};