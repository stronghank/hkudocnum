'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Grid, CircularProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Pagination } from '@mui/material';
import { useSession } from "next-auth/react";
import { parse, format } from 'date-fns';

function formatDate(dateString: string) {
  try {
    // Remove the 'Z' from the end of the string if it exists
    const cleanDateString = dateString.endsWith('Z') 
      ? dateString.slice(0, -1) 
      : dateString;
    
    // Parse the date string without time zone information
    const parsedDate = parse(cleanDateString.split('.')[0], "yyyy-MM-dd'T'HH:mm:ss", new Date());
    
    // Format the date
    return format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return dateString; // Return the original string if parsing fails
  }
}

interface DocumentRecord {
  id: string;
  staffUid: string;
  staffName: string;
  staffEmail: string;
  subject: string;
  documentNumber: string;
  createdAt: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  padding: theme.spacing(2),
  minWidth: '150px',
}));

export default function Query() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const [staffUid, setStaffUid] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<URLSearchParams | null>(null);

  const fetchHistory = useCallback(async (newPage: number, searchParams?: URLSearchParams) => {
    if (status !== "authenticated") return;
    
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(searchParams || {});
      params.set('staffUid', session?.user?.uid || '');
      params.set('page', newPage.toString());
      params.set('itemsPerPage', itemsPerPage.toString());

      console.log('Fetching with params:', params.toString());
      
      const response = await fetch(`/docnum/api/query-history?${params}`);
  
      if (!response.ok) {
        throw new Error('Failed to fetch document history');
      }
  
      const data = await response.json();
      console.log('Received data:', data);
      setSearchResults(data.results);
      setTotalPages(data.totalPages);
      setPage(newPage);
      setCurrentSearchCriteria(params);
    } catch (error) {
      console.error('Error fetching document history', error);
      setError('Failed to fetch document history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [status, session, itemsPerPage]);
  

  useEffect(() => {
    if (session?.user) {
      setStaffUid(session.user.uid || '');
      setStaffName(session.user.name || '');
      setStaffEmail(session.user.email || '');
      const initialParams = new URLSearchParams({ staffUid: session.user.uid || '' });
      setCurrentSearchCriteria(initialParams);
      fetchHistory(1, initialParams);
    }
  }, [session, fetchHistory]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({
      documentNumber,
      subject,
      fromDate,
      toDate,
    });
    Array.from(params.keys()).forEach(key => 
      params.get(key) === '' && params.delete(key)
    );
    setCurrentSearchCriteria(params);
    fetchHistory(1, params);
  };

  const handleReset = () => {
    setDocumentNumber('');
    setSubject('');
    setFromDate('');
    setToDate('');
    const initialParams = new URLSearchParams({ staffUid: session?.user?.uid || '' });
    setCurrentSearchCriteria(initialParams);
    fetchHistory(1, initialParams);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchHistory(value, currentSearchCriteria || undefined);
  };

  if (status === "loading") {
    return <CircularProgress />;
  }

  if (status === "unauthenticated") {
    return <Typography>Access Denied</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <b>Document Number Generation History</b>
        </Typography>
        <Box component="form" onSubmit={handleSearch} noValidate sx={{ mt: 1, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="staffUid"
                label="Staff UID"
                value={staffUid}
                variant="filled"
                disabled
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: '#111111',
                    fontWeight: 'bold'
                  },
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="staffName"
                label="Staff Name"
                value={staffName}
                variant="filled"
                disabled
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: '#111111',
                    fontWeight: 'bold'
                  },
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="staffEmail"
                label="Staff Email"
                value={staffEmail}
                variant="filled"
                disabled
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: '#111111',
                    fontWeight: 'bold'
                  },
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="documentNumber"
                  label="Document Number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  id="subject"
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="fromDate"
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="toDate"
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2, mb: 2, py: 1, bgcolor: '#000000', '&:hover': { bgcolor: '#49c0b6' }, width: '30%' }}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                sx={{ mt: 2, mb: 2, py: 1, borderColor: '#000000', color: '#ffffff', bgcolor: '#8e9090', '&:hover': { borderColor: '#000000', color: '#ffffff', bgcolor: '#49c0b6' }, width: '30%' }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
        {isLoading ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : error ? (
          <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mt: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Staff UID</StyledTableCell>
                    <StyledTableCell>Staff Name</StyledTableCell>
                    <StyledTableCell>Staff Email</StyledTableCell>
                    <StyledTableCell>Document Number</StyledTableCell>
                    <StyledTableCell>Subject</StyledTableCell>
                    <StyledTableCell>Date of Application</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.length > 0 ? (
                    searchResults.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.staffUid}</TableCell>
                        <TableCell sx={{ maxWidth: '400px'}}>{row.staffName}</TableCell>
                        <TableCell>{row.staffEmail}</TableCell>
                        <TableCell>{row.documentNumber}</TableCell>
                        <TableCell sx={{ maxWidth: '500px'}}>{row.subject}</TableCell>
                        <TableCell>{formatDate(row.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No results found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {searchResults.length > 0 && (
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                sx={{ mt: 2 }}
              />
            )}
          </>
        )}
      </Box>
    </Container>
  );
}