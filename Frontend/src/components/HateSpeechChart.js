import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardHeader, Box, Typography, styled } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';


ChartJS.register(ArcElement, Tooltip, Legend);

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: '#ffffff',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const GradientBar = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  background: `linear-gradient(90deg, ${color}.light, ${color}.dark)`,
  backgroundSize: '200% 100%',
  animation: 'gradientFlow 6s ease infinite',
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  right: '20px',
  top: '20px',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: `${color}.light`,
  border: `2px solid ${color}.main`,
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: `${color}.main`,
  },
}));

const HateSpeechChart = ({ total = 0, hate = 0 }) => {
  const hateCount = hate || 0;
  const normalCount = Math.max(0, total - hateCount);
  const hatePercentage = total > 0 ? Math.round((hateCount / total) * 100) : 0;

  const chartData = {
    labels: ['خطاب الكراهية', 'محتوى عادي'],
    datasets: [
      {
        data: [hateCount, normalCount],
        backgroundColor: ['#FF6384', '#3b2969'], 
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            family: 'Tajawal, sans-serif',
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ${percentage}% (${context.raw} حالة)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };
  
  return (
    <StyledCard>
      <GradientBar color="error" />
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Tajawal' }}>
            توزيع خطاب الكراهية
          </Typography>
        }
        avatar={<WarningIcon color="#3b2969" sx={{ fontSize: 32 }}  />}
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
        }}
      />
      <Box
        sx={{
          p: 3,
          height: 300,
          position: 'relative',
        }}
      >
        <Doughnut data={chartData} options={options} />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Tajawal' }}>
            {hatePercentage}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'Tajawal' }}>
            خطاب الكراهية
          </Typography>
        </Box>
        <IconContainer color="error">
          <WarningIcon sx={{ fontSize: 32, color: '#fff' }} />
        </IconContainer>
      </Box>
    </StyledCard>
  );
};

export default HateSpeechChart;