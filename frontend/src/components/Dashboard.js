import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './App.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hateComments, setHateComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const { redditAuth, setRedditAuth } = React.useContext(AuthContext);
  const navigate = useHistory();

  useEffect(() => {
    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get('access_token');

      if (access_token) {
        const authData = {
          isAuthenticated: true,
          token: access_token,
          user: {
            name: params.get('user_name'),
            id: params.get('user_id'),
            icon_img: params.get('icon_img'),
            posts: []
          }
        };

        setRedditAuth(authData);
        localStorage.setItem('redditAuth', JSON.stringify(authData));
        window.history.replaceState({}, document.title, "/dashboard");

        await fetchUserData(authData);
        await fetchCommentAnalysis(authData.token);
      } else {
        const storedAuth = localStorage.getItem('redditAuth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          setRedditAuth(parsedAuth);
          await fetchUserData(parsedAuth);
          await fetchCommentAnalysis(parsedAuth.token);
        } else {
          navigate.push('/');
        }
      }
    };

    initializeAuth();
  }, [navigate, setRedditAuth]);

  const fetchUserData = async (authData) => {
    if (!authData?.isAuthenticated || !authData.token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `https://oauth.reddit.com/user/${authData.user.name}/submitted`,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`
          },
          params: { limit: 10 }
        }
      );

      const userPosts = response.data.data.children.map(item => item.data);

      const updatedAuth = {
        ...authData,
        user: {
          ...authData.user,
          posts: userPosts
        }
      };

      setRedditAuth(updatedAuth);
      localStorage.setItem('redditAuth', JSON.stringify(updatedAuth));

      setUserData({
        name: updatedAuth.user.name,
        username: updatedAuth.user.name,
        joinDate: new Date().toLocaleDateString('ar-AR', {
          year: 'numeric',
          month: 'long'
        }),
        postCount: userPosts.length,
        flaggedComments: 0
      });
    } catch (err) {
      console.error('فشل في تحميل البيانات:', err);
      setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentAnalysis = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/analyze-me/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const hateMap = new Map();
      const allCommentsSet = new Set();

      response.data.posts_with_comments.forEach(post => {
        post.comments.forEach(comment => {
          const id = comment.url;
          if (!allCommentsSet.has(id)) {
            allCommentsSet.add(id);
          }
          if (comment.hate_speech === 'Hate Speech' && !hateMap.has(id)) {
            hateMap.set(id, comment);
          }
        });
      });

      response.data.standalone_comments.forEach(comment => {
        const id = comment.url;
        if (!allCommentsSet.has(id)) {
          allCommentsSet.add(id);
        }
        if (comment.hate_speech === 'Hate Speech' && !hateMap.has(id)) {
          hateMap.set(id, comment);
        }
      });

      const uniqueHateComments = Array.from(hateMap.values());
      setHateComments(uniqueHateComments);
      setCommentCount(allCommentsSet.size);

      setUserData(prev => ({
        ...prev,
        flaggedComments: uniqueHateComments.length
      }));
    } catch (err) {
      console.error("فشل في تحليل التعليقات:", err);
    }
  };

  const handleDelete = async (comment) => {
    try {
      const match = comment.url.match(/\/comments\/[^/]+\/[^/]+\/([^/?]+)/);
      let commentId = match ? match[1] : null;
  
      if (!commentId) {
        alert("تعذر استخراج معرف التعليق");
        return;
      }
  
      // Envoie une demande de suppression
      const response = await axios.post(
        'http://localhost:8000/reddit/request-delete/',
        { comment_id: commentId, comment_url: comment.url },
        {
          headers: {
            'Authorization': `Bearer ${redditAuth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.status === 'pending') {
        const confirm = window.confirm("هل تريد تأكيد الحذف؟");
        if (confirm) {
          const approve = await axios.post(
            'http://localhost:8000/reddit/approve-delete/',
            { comment_id: commentId },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          alert(approve.data.message);
          await fetchCommentAnalysis(redditAuth.token);
        } else {
          alert("تم إلغاء الحذف");
        }
      } else {
        alert("تعذر إرسال طلب الحذف");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'فشل في الحذف';
      alert(`خطأ: ${errorMsg}`);
    }
  };
  const handleApprove = async (comment) => {
    try {
      const match = comment.url.match(/\/comments\/[^/]+\/[^/]+\/([^/?]+)/);
      const commentId = match ? match[1] : null;
  
      if (!commentId) {
        alert("تعذر استخراج معرف التعليق");
        return;
      }
  
      const response = await axios.post(
        'http://localhost:8000/reddit/approve-comment/',
        { comment_id: commentId },
        {
          headers: {
            'Authorization': `Bearer ${redditAuth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      alert(response.data.message);
      await fetchCommentAnalysis(redditAuth.token);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'فشل في الموافقة';
      alert(`خطأ: ${errorMsg}`);
    }
  };
  
  
  const handleReport = async (comment) => {
    try {
      const commentId = comment.fullname || `t1_${comment.id}`;
      
      if (!commentId) {
        alert("تعذر استخراج معرف التعليق");
        return;
      }
  
      const response = await axios.post(
        'http://localhost:8000/reddit/report-comment/', 
        { comment_id: commentId },
        {
          headers: {
            'Authorization': `Bearer ${redditAuth.token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      alert(response.data.message || 'تم الإبلاغ عن التعليق بنجاح');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'فشل في الإبلاغ عن التعليق';
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>⚠️ خطأ: {error}</p>
          <button onClick={() => window.location.reload()}>حاول مرة أخرى</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="user-profile">
        {/* رأس الملف الشخصي */}
        <div className="profile-header">
          <div className="user-info">
            {redditAuth.user?.icon_img && (
              <img
                src={redditAuth.user.icon_img}
                alt="الصورة الشخصية"
                className="profile-img"
                onError={(e) => {
                  e.target.src = 'default-profile.png';
                }}
              />
            )}
            <div className="user-text">
              <h2>@{redditAuth.user?.name || 'مستخدم'}</h2>
              <p>انضم في {userData?.joinDate || 'تاريخ غير معروف'}</p>
            </div>
          </div>
        </div>

        {/* إحصائيات المستخدم */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{userData?.postCount || 0}</div>
            <div className="stat-label">عدد المنشورات</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{commentCount}</div>
            <div className="stat-label">عدد التعليقات</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userData?.flaggedComments || 0}</div>
            <div className="stat-label">تعليقات مبلغ عنها</div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="dashboard-content">
          {/* قسم المنشورات */}
          <section className="content-section posts-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h3>منشوراتك</h3>
            </div>
            
            {redditAuth.user?.posts?.length > 0 ? (
              <div className="posts-list">
                {redditAuth.user.posts.map((post, index) => (
                  <div key={index} className="post-item">
                    <h4 className="post-title">{post.title || 'منشور بدون عنوان'}</h4>
                    <div className="post-meta">
                      <span>r/{post.subreddit || 'غير معروف'}</span>
                      <span>{new Date(post.created_utc * 1000).toLocaleDateString('ar-AR')}</span>
                    </div>
                    <a
                      href={`https://reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="post-link"
                    >
                      عرض على ريديت
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>لا توجد منشورات لعرضها</p>
              </div>
            )}
          </section>

          {/* قسم التعليقات */}
          <section className="content-section comments-section">
            <div className="section-header">
              <span className="section-icon">🛑</span>
              <h3>التعليقات المسيئة</h3>
            </div>
            
            {hateComments.length > 0 ? (
              <div className="hate-comments-list">
                {hateComments.map((comment, index) => (
                  <div key={index} className="hate-comment">
                    <p className="comment-text">
                      {comment.text.length > 200 
                        ? `${comment.text.substring(0, 200)}...` 
                        : comment.text}
                    </p>
                    <div className="comment-meta">
                      <a 
                        href={comment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="comment-link"
                      >
                        عرض التعليق
                      </a>
                      <span className="topic-badge">{comment.topic || 'غير معروف'}</span>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(comment)}
                      >
                        حذف
                      </button>
                      <button 
                        className="action-btn report-btn"
                        onClick={() => handleReport(comment)}
                      >
                        تبليغ
                      </button>
                    </div>
                    
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <p>لا توجد تعليقات مسيئة</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;