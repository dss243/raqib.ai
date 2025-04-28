import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  Card, 
  CardHeader, 
  Box, 
  Typography,
  useTheme,
  Avatar,
  LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { styled, keyframes } from '@mui/system';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

export default function HateCommentsPerPostChart({ posts, isLoading }) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <AnimatedCard>
        <CardHeader
          title={<Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Tajawal' }}>تعليقات الكراهية لكل منشور</Typography>}
          subheader="جاري تحميل البيانات..."
        />
        <Box sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center' }}>
          <LinearProgress sx={{ width: '100%', height: 8, borderRadius: 4 }} />
        </Box>
      </AnimatedCard>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => a.post.created_utc - b.post.created_utc);

  const postLabels = sortedPosts.map(post =>
    post.post.title.substring(0, 30) + (post.post.title.length > 30 ? '...' : '')
  );
  const hateCommentCounts = sortedPosts.map(post => post.hate_comments.length);

  const data = {
    labels: postLabels,
    datasets: [
      {
        label: 'تعليقات الكراهية',
        data: hateCommentCounts,
        borderColor: "#3b2969",
        backgroundColor: 'rgba(45, 8, 79, 0.51)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b2969',
        pointBorderWidth: 2,
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  return (
    <AnimatedCard>
      <CardHeader 
        title={
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'Tajawal' }}>
            تحليل تعليقات الكراهية
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: 'Tajawal' }}>
            توزيع تعليقات الكراهية عبر منشوراتك
          </Typography>
        }
        avatar={
          <Avatar
            sx={{
              bgcolor: '#3b2969',
              color:'white',
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(18, 11, 70, 0.2)'
            }}
          >
            <TrendingUpIcon fontSize="medium" />
          </Avatar>
        }
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: 'linear-gradient(90deg, rgba(241, 241, 241, 0.1) 0%, rgba(255,255,255,1) 100%)',
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
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: theme.palette.text.primary,
                  font: {
                    family: 'Tajawal',
                    size: 12,
                    weight: 600
                  },
                  padding: 20,
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
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
                    return `${context.dataset.label}: ${context.raw}`;
                  },
                  title: (context) => {
                    return sortedPosts[context[0].dataIndex].post.title;
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
                  maxRotation: 45,
                  minRotation: 45,
                  font: {
                    size: 10,
                    weight: 500
                  },
                  color: theme.palette.text.secondary
                },
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
                    weight: 500
                  },
                  color: theme.palette.text.secondary
                },
              },
            },
            elements: {
              line: {
                cubicInterpolationMode: 'monotone'
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
        textAlign: 'right'
      }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'Tajawal' }}>
          {sortedPosts.length} منشور تم تحليلها • {hateCommentCounts.reduce((a, b) => a + b, 0)} إجمالي تعليقات الكراهية
        </Typography>
      </Box>
    </AnimatedCard>
  );
}