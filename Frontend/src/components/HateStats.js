import React from 'react';
import { Card, CardContent, Typography, Stack, LinearProgress, Box, keyframes } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const gradientFlow = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;

const HateStats = ({ total, hate }) => {
  const percentage = total > 0 ? Math.round((hate / total) * 100) : 0;
  const trendValue = 0;

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #FFF6F6 0%, #FFEBEB 100%)',
      borderLeft: '4px solid #FF4D4D',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(255, 77, 77, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 28px rgba(255, 77, 77, 0.15)'
      },
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '600px',
      height: '160px',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #FF4D4D 0%, #FF4500 100%)',
        animation: `${gradientFlow} 6s ease infinite`,
        backgroundSize: '200% 200%'
      }
    }}>
      <CardContent sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Stack 
          direction="row" 
          spacing={4}
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              p: 1.5,
              bgcolor: 'rgba(255, 77, 77, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WarningIcon color="error" sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(90deg, #FF4D4D 0%, #FF4500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                mb: 0.5,
                fontFamily: 'Tajawal'
              }}>
                {hate}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TrendingUpIcon color={trendValue >= 0 ? "error" : "success"} sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ 
                  color: trendValue >= 0 ? 'error.main' : 'success.main',
                  fontWeight: 600,
                  fontFamily: 'Tajawal'
                }}>
                  {trendValue >= 0 ? '+' : ''}{trendValue}% من الأسبوع الماضي
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 800,
              color: 'text.primary',
              mb: 1,
              fontFamily: 'Tajawal'
            }}>
              المحتوى المكتشف
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 77, 77, 0.15)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #FF4D4D 0%, #FF4500 100%)',
                  boxShadow: '0 2px 4px rgba(255, 77, 77, 0.3)'
                }
              }} 
            />
            <Typography variant="caption" sx={{ 
              display: 'block',
              mt: 0.5,
              color: 'text.secondary',
              fontFamily: 'Tajawal'
            }}>
              {total} إجمالي التعليقات المحللة
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #FF4D4D 0%, #FF4500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            minWidth: '80px',
            textAlign: 'right',
            fontFamily: 'Tajawal'
          }}>
            {percentage}%
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HateStats;