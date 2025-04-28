import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Card, 
  CardHeader, 
  Box, 
  Typography,
  useTheme,
  Avatar,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import TimelineIcon from '@mui/icons-material/Timeline';
import { styled, keyframes } from '@mui/system';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;


const AnimatedCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: `1px solid rgba(255, 255, 255, 0.18)`,
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  animation: `${fadeIn} 0.6s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)'
  }
}));


const topicColors = [
  '#FF5252', '#4285F4', '#FFAB00', '#00BFA5', 
  '#9C27B0', '#FF6D00', '#7CB342', '#E91E63',
  '#2196F3', '#FFC400', '#009688', '#673AB7',
  '#FF3D00', '#4CAF50', '#FF4081'
];


const arabicLabels = {
  'bullying': 'تنمر',
  'insult': 'إهانة',
  'misogyny': 'كراهية النساء',
  'none': 'لا شيء',
  'political_hate': 'كراهية سياسية',
  'racism': 'عنصرية',
  'religious_hate': 'كراهية دينية',
  'violence_incitement': 'تحريض على العنف'
};

export default function Topic({ posts, hateComments, isLoading, labels }) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <AnimatedCard>
        <CardHeader
          title={<Typography variant="h6" sx={{ fontWeight: 600, fontFamily: "'Tajawal', sans-serif" }}>{labels?.title || 'توزيع خطاب الكراهية حسب الموضوع'}</Typography>}
          subheader="جارٍ تحميل البيانات..."
        />
        <Box sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center' }}>
          <LinearProgress sx={{ width: '100%', height: 8, borderRadius: 4 }} />
        </Box>
      </AnimatedCard>
    );
  }

 
  const hateSpeechByTopic = {};
  (hateComments || []).forEach((comment) => {
    const type = comment.type || 'none';
    const arabicType = arabicLabels[type] || type;
    hateSpeechByTopic[arabicType] = (hateSpeechByTopic[arabicType] || 0) + 1;
  });

 
  const sortedTopics = Object.entries(hateSpeechByTopic)
    .sort((a, b) => b[1] - a[1]);

  const chartLabels = sortedTopics.map(([topic]) => topic);
  const dataValues = sortedTopics.map(([_, count]) => count);
  const totalComments = dataValues.reduce((sum, count) => sum + count, 0);

  const data = {
    labels: chartLabels,
    datasets: [{
      label: 'تعليقات الكراهية',
      data: dataValues,
      backgroundColor: chartLabels.map((_, i) => topicColors[i % topicColors.length]),
      hoverBackgroundColor: chartLabels.map((_, i) => `${topicColors[i % topicColors.length]}CC`),
      borderRadius: 8,
      borderWidth: 0,
      barThickness: 'flex',
      maxBarThickness: 48,
      minBarLength: 4
    }]
  };

  return (
    <AnimatedCard>
      <CardHeader 
        title={
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            letterSpacing: '0.5px',
            fontFamily: "'Tajawal', sans-serif"
          }}>
            {labels?.title || 'توزيع خطاب الكراهية'}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
            fontFamily: "'Tajawal', sans-serif"
          }}>
            {labels?.subtitle || 'تصنيف حسب الموضوع'}
          </Typography>
        }
        avatar={
          <Avatar
            sx={{
              bgcolor: 'rgba(66, 133, 244, 0.1)',
              color: '#4285F4',
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.2)'
            }}
          >
            <TimelineIcon fontSize="medium" />
          </Avatar>
        }
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: 'linear-gradient(90deg, rgba(240,248,255,1) 0%, rgba(255,255,255,1) 100%)',
          py: 2.5
        }}
      />
      <Box sx={{ 
        p: 3, 
        height: 400,
        position: 'relative',
        '&:hover canvas': {
          transform: 'scale(1.01)'
        }
      }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                padding: 12,
                boxShadow: theme.shadows[3],
                usePointStyle: true,
                callbacks: {
                  label: (context) => {
                    const percentage = ((context.raw / totalComments) * 100).toFixed(1);
                    return `${context.dataset.label}: ${context.raw} (${percentage}%)`;
                  },
                  labelColor: (context) => {
                    return {
                      borderColor: 'transparent',
                      backgroundColor: topicColors[context.dataIndex % topicColors.length],
                      borderRadius: 4
                    };
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  font: {
                    family: "'Tajawal', sans-serif"
                  }
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: theme.palette.divider,
                  drawBorder: false
                },
                ticks: {
                  precision: 0,
                  font: {
                    size: 11,
                    weight: 500,
                    family: "'Tajawal', sans-serif"
                  },
                  color: theme.palette.text.secondary
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            },
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            }
          }}
        />
      </Box>
      <Box sx={{
        px: 3,
        py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        background: 'rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center'
      }}>
        {chartLabels.map((label, index) => (
          <Chip
            key={index}
            label={`${label}: ${dataValues[index]}`}
            size="small"
            sx={{
              backgroundColor: `${topicColors[index % topicColors.length]}20`,
              color: topicColors[index % topicColors.length],
              border: `1px solid ${topicColors[index % topicColors.length]}40`,
              fontWeight: 500,
              fontFamily: "'Tajawal', sans-serif",
              '& .MuiChip-avatar': {
                backgroundColor: topicColors[index % topicColors.length]
              }
            }}
            avatar={
              <Avatar sx={{ 
                bgcolor: topicColors[index % topicColors.length],
                width: 16, 
                height: 16 
              }} />
            }
          />
        ))}
      </Box>
      <Box sx={{
        px: 3,
        py: 1.5,
        borderTop: `1px solid ${theme.palette.divider}`,
        background: 'rgba(0,0,0,0.03)',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ 
          color: theme.palette.text.secondary,
          fontFamily: "'Tajawal', sans-serif"
        }}>
          {totalComments} إجمالي تعليقات الكراهية عبر {chartLabels.length} مواضيع
        </Typography>
      </Box>
    </AnimatedCard>
  );
}