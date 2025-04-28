import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  Box, 
  Typography, 
  Chip, 
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  Snackbar,
  Alert,
  keyframes,
  styled
} from '@mui/material';
import {
  Warning as WarningIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Report as ReportIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';


const CommentCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  backgroundColor: '#fff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
    borderColor: 'rgba(0,0,0,0.08)',
    '& .comment-actions': {
      opacity: 1
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '4px',
    background: 'inherit'
  }
}));


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const getSeverityColor = (severity) => {
  switch(severity) {
    case 'high': return '#ff4444';
    case 'medium': return '#FFA726';
    default: return '#66BB6A';
  }
};

export default function RecentComments({ comments = [] }) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const handleCommentClick = (commentUrl) => {
    window.open(commentUrl, '_blank');
  };

  const handleReportClick = (comment) => {
    setSelectedComment(comment);
    setReportDialogOpen(true);
  };

  const handleReportSubmit = () => {
    // Here you would typically send the report to your backend
    console.log('Report submitted for:', selectedComment.id, 'Reason:', reportReason);
    setReportDialogOpen(false);
    setSuccessSnackbarOpen(true);
    setReportReason('');
  };

  const handleCloseDialog = () => {
    setReportDialogOpen(false);
    setReportReason('');
  };

  const handleCloseSnackbar = () => {
    setSuccessSnackbarOpen(false);
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      {}
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Hate Comments
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Last detected instances
          </Typography>
        }
        avatar={
          <Avatar sx={{ 
            bgcolor: '#3b2969',
            color: 'white',
          }}>
            <WarningIcon />
          </Avatar>
        }
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)'
        }}
      />

      {}
      <Box sx={{
        p: 2,
        flex: 1,
        overflow: 'auto',
        display: 'grid',
        gap: 2,
        background: 'rgba(250,250,252,0.8)',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '3px',
        },
      }}>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentCard
              key={index}
              sx={{
                animation: `${fadeIn} 0.4s ease-out ${index * 0.1}s both`,
                '&::before': {
                  background: getSeverityColor(comment.severity)
                }
              }}
            >
              {}
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  pl: 1
                }}
              >
                "{comment.text}"
              </Typography>

              {}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pl: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {}
                  <Chip
                    label={comment.topic}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: 'rgba(92, 26, 197, 0.08)',
                      color: '#3b2969'
                    }}
                  />

                  {}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {formatDistanceToNow(new Date(comment.timestamp))} ago
                  </Typography>
                </Box>

                {}
                <Box className="comment-actions" sx={{ 
                  display: 'flex',
                  gap: 0.5,
                  opacity: { xs: 1, sm: 0 },
                  transition: 'opacity 0.2s ease'
                }}>
                  <IconButton
                    size="small"
                    onClick={() => handleReportClick(comment)}
                    sx={{
                      color: '#ff4444',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 68, 68, 0.08)'
                      }
                    }}
                  >
                    <ReportIcon fontSize="small" />
                  </IconButton>

                  <IconButton 
                    size="small"
                    onClick={() => handleCommentClick(comment.url)}
                    sx={{
                      color: '#3b2969',
                      '&:hover': {
                        color: '#5c1ac5',
                        backgroundColor: 'rgba(92, 26, 197, 0.08)'
                      }
                    }}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CommentCard>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No hate comments detected
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 1.5,
        borderTop: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.7)'
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            color: 'error.main',
            fontWeight: 600
          }}
        >
          <WarningIcon sx={{ fontSize: 16, mr: 1 }} />
          {comments.filter(c => c.severity === 'high').length} critical alerts in last 24 hours
        </Typography>
      </Box>

      {}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 600,
          color: '#3b2969'
        }}>
          <ReportIcon color="error" />
          Report Hate Speech
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You're reporting this comment to our moderation team:
          </DialogContentText>
          <Box sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderLeft: `4px solid ${getSeverityColor(selectedComment?.severity)}`
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "{selectedComment?.text}"
            </Typography>
          </Box>
          
          
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            startIcon={<CloseIcon />}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReportSubmit}
            startIcon={<SendIcon />}
            variant="contained"
            sx={{
              backgroundColor: '#3b2969',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#5c1ac5'
              }
            }}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{
            backgroundColor: '#4CAF50',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography fontWeight={600}>Report submitted!</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Our moderators will review this content.
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Card>
  );
}