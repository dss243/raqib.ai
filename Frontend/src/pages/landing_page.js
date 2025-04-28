import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import FOG from 'vanta/src/vanta.fog';
import { Button, Typography, Box, Stack, styled } from '@mui/material';
import '@fontsource/tajawal';

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  fontSize: '1rem',
  fontWeight: 700,
  borderRadius: '50px',
  transition: 'all 0.3s ease',
  fontFamily: '"Tajawal", sans-serif',
  margin: '0 8px', 
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const LandingPage = () => {
  const vantaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!vantaRef.current) return;

    const vantaEffect = FOG({
      el: vantaRef.current,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      highlightColor: 0xffffff,
      midtoneColor: 0xe5dbf2,
      lowlightColor: 0xe5dbf2,
      baseColor: 0xffffff,
      blurFactor: 1.42,
      speed: 0.5,
      zoom: 0.50
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <Box
      ref={vantaRef}
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        px: 3,
        color: '#3b2969',
        fontFamily: '"Tajawal", sans-serif',
        direction: 'rtl'
      }}
    >
      {/* Logo - Positioned left */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 60,
          height: 60,
          zIndex: 1,
        }}
      >
        <img
          src="logiya.png"
          alt="RaqibAI Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {}
      <Box
        component="button"
        onClick={() => console.log('Contact Us clicked')}
        sx={{
          position: 'absolute',
          top: 40,
          right: 40,
          zIndex: 1,
          color: '#3b2969',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: '"Tajawal", sans-serif',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        اتصل بنا
      </Box>

      {}
      <Box
        sx={{
          maxWidth: '800px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          mt: 8,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', sm: '4rem', md: '4.5rem' },
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 2,
            background: 'linear-gradient(45deg, #3b2969, #5e43a3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: '"Tajawal", sans-serif',
          }}
        >
          RaqibAI
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontSize: '2.5rem',
            fontWeight: 700,
            mb: 3,
            color: '#3b2969',
          }}
        >
          نظام كشف خطاب الكراهية
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 4,
            color: '#3b2969',
            fontWeight: 500,
          }}
        >
          باللغة العربية
        </Typography>

        <Typography
          variant="body1"
          paragraph
          sx={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            mb: 4,
            color: '#3b2969',
            px: { xs: 0, md: 4 },
            maxWidth: '700px',
          }}
        >
          منصتنا المزودة بالذكاء الاصطناعي متخصصة في تحليل خطاب الكراهية باللغة العربية مع تكامل ريديت. احصل على رؤى حول محتوى حسابك وتفاعلات المجتمع من خلال لوحة التحكم الشاملة لدينا.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
          <ActionButton
            variant="contained"
            onClick={() => navigate('/analyze')}
            sx={{
              background: 'linear-gradient(45deg, #3b2969, #5e43a3)',
              color: 'white',
            }}
          >
            جرب رقيب
          </ActionButton>
            <Box sx={{ height: { xs: 300, sm: 10 } }} />
          <ActionButton
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{
              border: '2px solid #3b2969',
              color: '#3b2969',
              '&:hover': {
                backgroundColor: 'rgba(59, 41, 105, 0.04)',
              },
            }}
          >
            لوحة التحكم
          </ActionButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default LandingPage;