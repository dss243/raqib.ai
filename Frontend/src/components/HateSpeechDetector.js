import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  Stack,
  Switch
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  Send as SendIcon,
  Language as LanguageIcon,
  KeyboardVoice as KeyboardVoiceIcon,
  GraphicEq as GraphicEqIcon
} from '@mui/icons-material';

const colors = {
  primary: '#3b2969',
  white: '#ffffff',
  lightGray: '#f5f5f5',
  secondary: '#6d5b98',
  textSecondary: '#6B7280'
};
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


function HateSpeechDetector() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAlgerianDialect, setIsAlgerianDialect] = useState(false);
  const [listening, setListening] = useState(false);
  
  const submitText = async (text) => {
    setLoading(true);
  
    try {
      const response = await axios.post(
        isAlgerianDialect 
          ? 'http://localhost:8000/detect-algerian-dialect/'
          : 'http://localhost:8000/detect-standard-arabic/',
        { text }
      );
  
      const resultData = {
        hate_speech: response.data.hate_speech || (response.data.result === 'hate' ? 'Hate Speech' : 'No Hate'),
        topic: response.data.topic || response.data.type || 'N/A',
        confidence: response.data.confidence || response.data.binary_confidence 
          ? `${Math.round((response.data.confidence || response.data.binary_confidence) * 100)}%` 
          : 'N/A',
      };
  
      setResults(resultData);
      setHistory(prev => [{
        text,
        result: resultData,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 3)]);
      
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        isAlgerianDialect 
          ? 'http://localhost:8000/detect-algerian-dialect/'
          : 'http://localhost:8000/detect-standard-arabic/',
        { text: inputText }
      );

      const resultData = {
        hate_speech: response.data.hate_speech || (response.data.result === 'hate' ? 'Hate Speech' : 'No Hate'),
        topic: response.data.topic || response.data.type || 'N/A',
        confidence: response.data.confidence || response.data.binary_confidence 
          ? `${Math.round((response.data.confidence || response.data.binary_confidence) * 100)}%` 
          : 'N/A',
      };

      setResults(resultData);
      setHistory(prev => [{
        text: inputText,
        result: resultData,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 3)]);
      
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setResults(null);
  };

  const toggleDialect = () => {
    setIsAlgerianDialect(!isAlgerianDialect);
    clearAll();
  };

  return (
    <Box sx={{ 
      maxWidth: '500px',
      mx: 'auto',
      p: 2,
      position: 'relative'
    }}>
      {}
      <Box sx={{ 
        textAlign: 'center',
        mb: 4,
        pt: 2
      }}>
        <Typography variant="h4" fontWeight={800} color={colors.primary}>
          Raqib<span style={{ color: colors.secondary }}>AI</span>
        </Typography>
        <Typography variant="body1" color={colors.textSecondary}>
          Advanced {isAlgerianDialect ? 'Algerian Dialect' : 'Standard Arabic'} Content Analysis
        </Typography>
      </Box>

      {}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700} color={colors.primary}>
          {isAlgerianDialect ? 'Algerian Dialect' : 'Standard Arabic'}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <LanguageIcon sx={{ color: colors.primary, fontSize: '20px' }} />
          <Switch 
            checked={isAlgerianDialect}
            onChange={toggleDialect}
            size="small"
            sx={{
              '& .MuiSwitch-thumb': {
                color: colors.primary
              },
              '& .MuiSwitch-track': {
                backgroundColor: colors.primary
              }
            }}
          />
        </Stack>
      </Stack>

      {}
      <Box sx={{ mt: 4 }}>
      <Paper elevation={0} sx={{ 
  mb: 2,
  borderRadius: '24px',
  bgcolor: colors.lightGray,
  p: '6px 6px 6px 16px',
  display: 'flex',
  alignItems: 'center'
}}>
  <TextField
    fullWidth
    multiline
    rows={3}
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    placeholder={`Type ${isAlgerianDialect ? 'Algerian' : 'Arabic'} text...`}
    variant="standard"
    InputProps={{
      disableUnderline: true,
      sx: {
        fontSize: '0.9rem',
        '&:before, &:after': {
          display: 'none'
        }
      }
    }}
    sx={{ flex: 1 }}
  />
  
  {}
  <IconButton
  sx={{ color: colors.primary }}
  onClick={() => {
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-DZ'; // or 'ar'

    recognition.start();
    setListening(true); 

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => {
        const updatedText = prev ? prev + ' ' + transcript : transcript;
      
        submitText(updatedText); 
        return updatedText;
      });
      setListening(false);
    };
    

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setListening(false); 
    };

    recognition.onend = () => {
      setListening(false); 
    };
  }}
>
  {listening ? <GraphicEqIcon /> : <KeyboardVoiceIcon />}
</IconButton>


  {}
  <Stack direction="row" spacing={0.5}>
    <IconButton
      onClick={clearAll}
      disabled={!inputText}
      sx={{ 
        color: colors.primary,
        bgcolor: colors.white,
        '&:hover': { bgcolor: colors.white }
      }}
    >
      <ClearIcon fontSize="small" />
    </IconButton>
    <IconButton
      onClick={handleSubmit}
      disabled={loading || !inputText.trim()}
      sx={{ 
        color: colors.white,
        bgcolor: colors.primary,
        '&:hover': { bgcolor: colors.primary }
      }}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        <SendIcon fontSize="small" />
      )}
    </IconButton>
  </Stack>
</Paper>

      </Box>

      {}
      {results && (
        <Paper elevation={0} sx={{ 
          mb: 2,
          borderRadius: '16px',
          bgcolor: colors.lightGray,
          p: 2
        }}>
          <Stack spacing={1.5}>
            <Chip
              label={results.hate_speech}
              size="small"
              icon={results.hate_speech === 'Hate Speech' ? 
                <WarningIcon fontSize="small" /> : 
                <CheckCircleIcon fontSize="small" />}
              sx={{
                width: 'fit-content',
                bgcolor: results.hate_speech === 'Hate Speech' ? '#FFEBEE' : '#E8F5E9',
                color: results.hate_speech === 'Hate Speech' ? '#F44336' : '#4CAF50',
                borderRadius: '12px'
              }}
            />
            <Typography variant="body2">
              <strong>Topic:</strong> {results.topic}
            </Typography>
            {results.confidence && (
              <Typography variant="body2">
                <strong>Confidence:</strong> {results.confidence}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      {}
      {history.length > 0 && (
        <Paper elevation={0} sx={{ 
          borderRadius: '16px',
          bgcolor: colors.lightGray,
          p: 2
        }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <HistoryIcon sx={{ color: colors.primary, fontSize: '18px' }} />
            <Typography variant="subtitle2" color={colors.primary}>
              Recent
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {history.map((item, index) => (
              <Box key={index} sx={{ 
                p: 1.5,
                borderRadius: '12px',
                bgcolor: colors.white
              }}>
                <Typography variant="body2" sx={{ 
                  fontStyle: 'italic',
                  mb: 1,
                  fontSize: '0.85rem'
                }}>
                  "{item.text.length > 60 ? `${item.text.substring(0, 60)}...` : item.text}"
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={item.result.hate_speech}
                    size="small"
                    sx={{
                      bgcolor: item.result.hate_speech === 'Hate Speech' ? '#FFEBEE' : '#E8F5E9',
                      color: item.result.hate_speech === 'Hate Speech' ? '#F44336' : '#4CAF50',
                      borderRadius: '8px',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.timestamp}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

export default HateSpeechDetector;