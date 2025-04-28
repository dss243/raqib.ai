import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Fade,
  Button,
  styled
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import UserProfileMenu from '../components/UserProfileMenu';
import StatsCard from '../components/StatsCard';
import HateStats from '../components/HateStats';
import HateSpeechChart from '../components/HateSpeechChart';
import Topic from '../components/Topic';
import HateCommentsPerPostChart from '../components/PostChart';
import RecentComments from '../components/RecentComments';
import axios from 'axios';


const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  zIndex: theme.zIndex.modal + 1,
  backdropFilter: 'blur(3px)',
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 500,
  letterSpacing: '0.5px',
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: '60px !important',
  height: '60px !important',
  animationDuration: '800ms',
}));

const ArabicTypography = styled(Typography)({
  fontFamily: "'Tajawal', sans-serif",
  textAlign: 'right',
  direction: 'rtl'
});

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    hateComments: 0,
    hatePercentage: 0,
  });
  const [comments, setComments] = useState([]);
  const [hateComments, setHateComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const removeDuplicates = (comments) => {
    if (!comments) return [];
    const seen = new Set();
    return comments.filter((comment) => {
      const duplicate = seen.has(comment.id);
      seen.add(comment.id);
      return !duplicate;
    });
  };

  const fetchAllData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:8000/analyze-me/', {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'ArabicHateSpeechDetector/1.0' },
      });

      const data = response.data;
      
     
      const allComments = removeDuplicates([
        ...(data.standalone_comments || []),
        ...(data.posts_with_comments || []).flatMap(post => post.comments || [])
      ]);

     
      const allHateComments = allComments.filter(comment => comment?.result === "hate");

      setUserData({
        name: data.user?.name || 'Unknown',
        avatar: data.user?.icon_img || 'default-profile.png',
        total_karma: data.user?.total_karma || 0,
        joinDate: data.user?.created_utc 
          ? new Date(data.user.created_utc * 1000).toLocaleDateString() 
          : 'Unknown',
      });
      
      setStats({
        totalPosts: data.posts_with_comments?.length || 0,
        totalComments: allComments.length,
        hateComments: allHateComments.length,
        hatePercentage: data.stats?.hate_percentage || 0,
      });
      
      setComments(allComments);
      setHateComments(allHateComments);
      setPosts(data.posts_with_comments );
    } catch (err) {
      console.error('Data fetching error:', err);
      setError('فشل تحميل البيانات. يرجى المحاولة مرة أخرى.');
      if (err.response?.status === 401) {
        localStorage.removeItem('reddit_token');
        localStorage.removeItem('reddit_user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
  
        if (token) {
          const user = {
            name: params.get('user_name'),
            id: params.get('user_id'),
            icon_img: params.get('icon_img'),
          };
  
          localStorage.setItem('reddit_token', token);
          localStorage.setItem('reddit_user', JSON.stringify(user));
          window.history.replaceState({}, document.title, '/dashboard');
          await fetchAllData(token);
        } else {
          const storedToken = localStorage.getItem('reddit_token');
          const storedUser = localStorage.getItem('reddit_user');
  
          if (storedToken && storedUser) {
            await fetchAllData(storedToken);
          } else {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('فشل التهيئة. يرجى تسجيل الدخول مرة أخرى.');
        navigate('/login');
      }
    };
    initializeAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('reddit_user');
    localStorage.removeItem('reddit_token');
    navigate('/login');
  };

  if (loading) return (
    <Fade in={loading} timeout={500}>
      <LoadingOverlay>
        <LoadingSpinner thickness={4} />
        <LoadingText variant="h6" sx={{ fontFamily: "'Tajawal', sans-serif" }}>
          جاري تحليل محتوى ريديت الخاص بك
        </LoadingText>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontFamily: "'Tajawal', sans-serif" }}>
          قد يستغرق هذا بضع لحظات...
        </Typography>
      </LoadingOverlay>
    </Fade>
  );

  if (error) return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      p: 3,
      backgroundColor: 'background.paper'
    }}>
      <WarningIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
      <ArabicTypography variant="h5" color="error" gutterBottom>
        خطأ في تحميل البيانات
      </ArabicTypography>
      <ArabicTypography variant="body1" sx={{ mb: 3, maxWidth: '500px' }}>
        {error}
      </ArabicTypography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => window.location.reload()}
        sx={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        حاول مرة أخرى
      </Button>
    </Box>
  );

  if (!userData) return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      p: 3
    }}>
      <ArabicTypography variant="h5" gutterBottom>
        لا توجد بيانات مستخدم
      </ArabicTypography>
      <ArabicTypography variant="body1" sx={{ mb: 3 }}>
        يرجى تسجيل الدخول للوصول إلى لوحة التحكم
      </ArabicTypography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/login')}
        sx={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        الذهاب إلى صفحة تسجيل الدخول
      </Button>
    </Box>
  );

  return (
    <Box sx={{ 
      p: 3, 
      direction: 'rtl',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        py: 2,
        px: 3,
      }}>
        <Box>
          <ArabicTypography variant="h4" sx={{ 
            fontWeight: 700,
            color: '#3b2969',
            fontSize: '1.75rem',
          }}>
            لوحة التحكم
          </ArabicTypography>
          <ArabicTypography variant="subtitle2" sx={{
            color: 'text.secondary',
            mt: 0.5,
          }}>
            مرحباً بعودتك، {userData?.name || 'زائر'}
          </ArabicTypography>
        </Box>
        
        <UserProfileMenu user={userData} onLogout={handleLogout} />
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: 'row-reverse' }}>
        <HateStats 
          total={stats.totalComments} 
          hate={stats.hateComments} 
          labels={{
            total: "إجمالي التعليقات",
            hate: "تعليقات الكراهية",
            percentage: "النسبة المئوية"
          }}
        />
        <StatsCard 
          type="posts" 
          count={stats.totalPosts} 
          label="عدد المنشورات"
        />
        <StatsCard 
          type="comments" 
          count={stats.totalComments} 
          label="عدد التعليقات"
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: 'row-reverse' }}>
        <Box sx={{ flex: 1 }}>
          <RecentComments
            comments={(hateComments || []).map((comment) => ({
              id: comment.id,
              text: comment.text,
              topic: comment.type || 'none',
              timestamp: comment.created_utc * 1000,
              severity: comment.result === 'hate' ? 'high' : 'medium',
              url: comment.url,
              confidence: comment.binary_confidence
            }))} 
            title="آخر تعليقات الكراهية"
            subtitle="آخر الحالات المكتشفة"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <HateSpeechChart 
            total={stats.totalComments} 
            hate={stats.hateComments} 
            labels={{
              hate: "تعليقات الكراهية",
              normal: "تعليقات عادية"
            }}
          />
          <br />
          <HateCommentsPerPostChart 
            posts={posts} 
            labels={{
              title: "تعليقات الكراهية لكل منشور",
              comments: "تعليقات"
            }}
          />
          <br />
          <Topic 
  hateComments={hateComments}  
  isLoading={loading}         
  labels={{
    title: "توزيع أنواع الكراهية",
    subtitle: "حسب التصنيف"
  }}
/>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;