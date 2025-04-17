import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AuthContext } from '../context/AuthContext';

function HateSpeechDetector() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState({
    hate_speech: null,
    topic: null,
    timestamp: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [redditAnalysis, setRedditAnalysis] = useState(null);
  const [analyzingReddit, setAnalyzingReddit] = useState(false);

  const { redditAuth } = useContext(AuthContext);
  const API_URL = 'http://localhost:8000';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/predict/`, 
        { text: inputText },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setResults({
        hate_speech: response.data.hate_speech,
        topic: response.data.topic,
        timestamp: response.data.timestamp
      });
      
      setHistory(prev => [
        {
          text: inputText,
          result: response.data,
          timestamp: new Date().toLocaleString()
        },
        ...prev.slice(0, 4)
      ]);
      
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Analyze user's Reddit content
  const analyzeRedditContent = async () => {
    setAnalyzingReddit(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/analyze-me/`, {
        headers: {
          'Authorization': `Bearer ${redditAuth.token}`
        }
      });
      
      setRedditAnalysis(response.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setAnalyzingReddit(false);
    }
  };

  const handleApiError = (err) => {
    console.error("API Error:", err);
    const detail = err.response?.data?.detail || err.message;
    setError(detail || 'حدث خطأ أثناء الاتصال بالخادم');
  };

  const clearAll = () => {
    setInputText('');
    setResults({
      hate_speech: null,
      topic: null,
      timestamp: null
    });
    setError(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>محلل المحتوى العربي</h1>
        <p>تحليل النصوص العربية لاكتشاف خطاب الكراهية وتصنيف المواضيع</p>
      </header>

      <main className="main-content">
        {/* Manual Analysis Section */}
        <section className="input-section">
          <h2>تحليل نص يدوي</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="arabic-text">أدخل نصًا باللغة العربية:</label>
              <textarea
                id="arabic-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب أو الصق نصًا باللغة العربية هنا..."
                rows="5"
                required
              />
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="analyze-btn"
                disabled={loading || !inputText.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> جارٍ التحليل...
                  </>
                ) : 'تحليل النص'}
              </button>
              
              <button 
                type="button" 
                className="clear-btn"
                onClick={clearAll}
                disabled={!inputText && !results.hate_speech}
              >
                مسح
              </button>
            </div>
          </form>
        </section>

        {/* Reddit Analysis Section */}
        <section className="reddit-section">
          <h2>تحليل محتوى ريديت</h2>
          
          {!redditAuth.isAuthenticated ? (
            <div className="reddit-auth">
              <p>للوصول إلى تحليل مشاركاتك على ريديت، يرجى تسجيل الدخول:</p>
            </div>
          ) : (
            <div className="reddit-analysis">
              <button
                className="analyze-reddit-btn"
                onClick={analyzeRedditContent}
                disabled={analyzingReddit}
              >
                {analyzingReddit ? 'جارٍ تحليل محتواك...' : 'تحليل مشاركاتي الأخيرة'}
              </button>
              
            </div>
          )}
        </section>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>⚠️ خطأ: {error}</p>
          </div>
        )}

        {/* Manual Analysis Results */}
        {(results.hate_speech || results.topic) && !error && (
          <section className="results-section">
            <h2>نتائج التحليل</h2>
            
            <div className={`result-card ${results.hate_speech === 'Hate Speech' ? 'hate' : 'clean'}`}>
              <div className="result-item">
                <span className="result-label">خطاب كراهية:</span>
                <span className="result-value">
                  {results.hate_speech === 'Hate Speech' ? 'نعم' : 'لا'}
                  {results.hate_speech === 'Hate Speech' ? (
                    <span className="warning-icon">⚠️</span>
                  ) : (
                    <span className="safe-icon">✓</span>
                  )}
                </span>
              </div>
              
              <div className="result-item">
                <span className="result-label">الموضوع:</span>
                <span className="result-value">{results.topic}</span>
              </div>
              
              {results.timestamp && (
                <div className="result-item">
                  <span className="result-label">وقت التحليل:</span>
                  <span className="result-value">
                    {new Date(results.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <section className="history-section">
            <h3>التحليلات الأخيرة</h3>
            <ul className="history-list">
              {history.map((item, index) => (
                <li key={index} className="history-item">
                  <div className="history-text">
                    <p>"{item.text.length > 50 ? `${item.text.substring(0, 50)}...` : item.text}"</p>
                    <small>{item.timestamp}</small>
                  </div>
                  <div className={`history-result ${item.result.hate_speech === 'Hate Speech' ? 'hate' : 'clean'}`}>
                    {item.result.hate_speech === 'Hate Speech' ? 'خطاب كراهية' : 'نص آمن'}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} محلل المحتوى العربي</p>
      </footer>
    </div>
  );
}

export default HateSpeechDetector;