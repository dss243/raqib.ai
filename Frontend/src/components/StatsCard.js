import React from 'react';
import { Card, CardContent, Typography, Box, Stack, keyframes, styled } from '@mui/material';
import { Article, ChatBubble } from '@mui/icons-material';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const StatsCard = ({ type, count }) => {
  const config = {
    posts: {
      title: 'إجمالي المنشورات',
      icon: <Article sx={{ fontSize: 32,fontWeight:'bold' }} />,
      gradient: 'linear-gradient(135deg,rgba(43, 28, 142, 0.79) 0%,rgb(107, 107, 156) 100%)',
    },
    comments: {
      title: 'إجمالي التعليقات',
      icon: <ChatBubble sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg,rgb(29, 29, 61) 0%,rgba(10, 1, 20, 0.8) 100%)',
    },
  };

  const { title, icon, gradient } = config[type];

  return (
    <Card sx={{
      borderRadius: '16px',
      background: gradient,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      minWidth: '280px',
      height: '160px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
        '& .stats-icon': {
          animation: `${floatAnimation} 3s ease infinite`,
        }
      }
    }}>
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -80,
        right: -80,
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      
      <CardContent sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" height="100%">
          <Box>
            <Typography variant="subtitle1" sx={{ 
              opacity: 0.9,
              mb: 1.5,
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontSize: '0.9rem',
              fontFamily: 'Tajawal'
            }}>
              {title}
            </Typography>
            <Typography variant="h2" sx={{ 
              fontWeight: 800,
              lineHeight: 1,
              mb: 1.5,
              fontSize: '2.75rem'
            }}>
              {count}
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.8,
              display: 'block',
              fontWeight: 600,
              letterSpacing: '0.3px',
              fontFamily: 'Tajawal'
            }}>
              محتوى تم تحليله
            </Typography>
          </Box>
          
          <Box className="stats-icon" sx={{
            alignSelf: 'center',
            p: 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 32 } })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatsCard;