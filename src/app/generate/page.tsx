'use client';

import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Snackbar, Container, Paper } from '@mui/material';
import { useSession } from "next-auth/react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function Generate() {
  const [documentName, setDocumentName] = useState('');
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { data: session, status  } = useSession();
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setGeneratedNumber('');

    if (!documentName.trim()) {
      setError('Document title must contain at least one character (number, symbol, or English alphabet).');
      return;
    }

    if (!session) {
      setError('You must be logged in to generate a document number');
      return;
    }

    try {
      const response = await fetch('/docnum/api/generate-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject: documentName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate document number');
      }

      const data = await response.json();
      setGeneratedNumber(data.documentNumber);
      setSnackbarMessage("Document number generated successfully");
      setShowSnackbar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate document number. Please try again.');
      setSnackbarMessage(err instanceof Error ? err.message : 'Failed to generate document number. Please try again.');
      setShowSnackbar(true);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(generatedNumber);
    setSnackbarMessage("Document number copied to clipboard");
    setShowSnackbar(true);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };
  
  if (status === "unauthenticated") {
    return <Typography>Access Denied</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <b>Generate Document Number</b>
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="documentName"
            label="Document Name"
            name="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            autoFocus
            error={!!error}
            helperText={error}
            size="small"
            multiline
            maxRows={4}
            sx={{
              '& .MuiInputBase-root': {
                height: 'auto',
                minHeight: '40px',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                py: 1, 
                bgcolor: '#004e4a', 
                width: '50%', 
                '&:hover': { bgcolor: '#00635e' } 
              }}
            >
              Generate Number
            </Button>
          </Box>
        </Box>
        {generatedNumber && (
          <Paper elevation={3} sx={{ mt: 3, p: 2, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">
              <b>Generated Document Number:</b> {generatedNumber}
            </Typography>
            <Button 
              startIcon={copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
              onClick={handleCopyNumber}
              sx={{ 
                ml: 2,
                bgcolor: copied ? '#4caf50' : '#e0e0e0',
                color: copied ? 'white' : 'black',
                '&:hover': {
                  bgcolor: copied ? '#45a049' : '#d5d5d5'
                }
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Paper>
        )}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
}