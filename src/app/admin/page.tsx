'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Grid, IconButton, Snackbar, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSession } from "next-auth/react";
import { Pagination } from '@mui/material';
import { useRouter } from 'next/navigation';
import { parse, format } from 'date-fns';

function formatDate(dateString: string) {
  try {
    const cleanDateString = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString;
    const parsedDate = parse(cleanDateString.split('.')[0], "yyyy-MM-dd'T'HH:mm:ss", new Date());
    return format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return dateString;
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
  modifiedAt: string;
}

export default function Admin() {
  const [staffUid, setStaffUid] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lastModifiedFromDate, setLastModifiedFromDate] = useState('');
  const [lastModifiedToDate, setLastModifiedToDate] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<URLSearchParams | null>(null);

  const fetchDocuments = useCallback(async (newPage: number, searchParams?: URLSearchParams) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams || {});
      params.set('page', newPage.toString());
      params.set('itemsPerPage', itemsPerPage.toString());
  
      console.log('Fetching with params:', params.toString());
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
  
      console.log('Request headers:', headers);
  
      const response = await fetch(`/docnum/api/admin/query-all?${params}`, { headers });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Failed to fetch documents: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Received data:', data);
      setSearchResults(data.results);
      setTotalPages(data.totalPages);
      setPage(newPage);
      setCurrentSearchCriteria(params);
    } catch (error) {
      console.error('Error fetching documents', error);
      setSnackbarMessage('Error fetching documents: ' + (error as Error).message);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [session, itemsPerPage]);

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.roles?.includes('QA_Role_docnum_admin')) {
        console.log("User does not have admin role");
        router.push('/'); 
      } else {
        console.log("Admin user authenticated, fetching documents");
        const initialParams = new URLSearchParams({ page: '1', itemsPerPage: itemsPerPage.toString() });
        setCurrentSearchCriteria(initialParams);
        fetchDocuments(1, initialParams).catch(error => {
          console.error("Error in initial document fetch:", error);
          setSnackbarMessage('Error loading initial data: ' + (error as Error).message);
          setSnackbarOpen(true);
        });
      }
    }
  }, [session, status, router, fetchDocuments, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams(currentSearchCriteria || undefined);
    params.set('page', value.toString());
    fetchDocuments(value, params);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({
      staffUid,
      staffName,
      staffEmail,
      documentNumber,
      subject,
      fromDate,
      toDate,
      lastModifiedFromDate,
      lastModifiedToDate,
    });
  
    Array.from(params.keys()).forEach(key => 
      params.get(key) === '' && params.delete(key)
    );
  
    console.log('Setting search criteria:', params.toString());
    setCurrentSearchCriteria(params);
    fetchDocuments(1, params);
  };

  const handleReset = () => {
    setStaffUid('');
    setStaffName('');
    setStaffEmail('');
    setDocumentNumber('');
    setSubject('');
    setFromDate('');
    setToDate('');
    setLastModifiedFromDate('');
    setLastModifiedToDate('');
    const initialParams = new URLSearchParams({ page: '1', itemsPerPage: itemsPerPage.toString() });
    setCurrentSearchCriteria(initialParams);
    setPage(1); // Reset to first page
    fetchDocuments(1, initialParams);
  };

  const handleEdit = (id: string, currentSubject: string) => {
    setEditingId(id);
    setEditedSubject(currentSubject);
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch('/docnum/api/admin/update-subject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ id, subject: editedSubject }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update subject');
      }
  
      const updatedDocument = await response.json();
  
      setSearchResults(prevResults =>
        prevResults.map(doc =>
          doc.id === id ? { 
            ...doc, 
            subject: editedSubject,
            modifiedAt: updatedDocument.modifiedAt
          } : doc
        )
      );
      setEditingId(null);
      setSnackbarMessage('Subject updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating subject', error);
      setSnackbarMessage('Error updating subject');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedSubject('');
  };

  if (status === 'loading') {
    return <CircularProgress />;
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.roles?.includes('QA_Role_docnum_admin'))) {
    return <Typography>Access Denied</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <b>Admin Dashboard - Query and Edit Document Numbers Record</b>
        </Typography>
        <Box component="form" onSubmit={handleSearch} noValidate sx={{ mt: 1, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="staffUid"
                label="Staff UID"
                value={staffUid}
                onChange={handleInputChange(setStaffUid)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="staffName"
                label="Staff Name"
                value={staffName}
                onChange={handleInputChange(setStaffName)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="staffEmail"
                label="Staff Email"
                value={staffEmail}
                onChange={handleInputChange(setStaffEmail)}
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
                  onChange={handleInputChange(setDocumentNumber)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  id="subject"
                  label="Subject"
                  value={subject}
                  onChange={handleInputChange(setSubject)}
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
                onChange={handleInputChange(setFromDate)}
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
                onChange={handleInputChange(setToDate)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="lastModifiedFromDate"
                label="Last Modified From"
                type="date"
                value={lastModifiedFromDate}
                onChange={handleInputChange(setLastModifiedFromDate)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="lastModifiedToDate"
                label="Last Modified To"
                type="date"
                value={lastModifiedToDate}
                onChange={handleInputChange(setLastModifiedToDate)}
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
                sx={{ mt: 2, mb: 2, py: 1, borderColor: '#000000', color: '#ffffff', bgcolor: '#8e9090', '&:hover': { borderColor: '#111111', color: '#ffffff', bgcolor: '#49c0b6' }, width: '30%' }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mt: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Staff UID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Staff Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Staff Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Document Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date of Application</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Modified</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.length > 0 ? (
                    searchResults.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.staffUid}</TableCell>
                        <TableCell>{row.staffName}</TableCell>
                        <TableCell>{row.staffEmail}</TableCell>
                        <TableCell>{row.documentNumber}</TableCell>
                        <TableCell>
                          {editingId === row.id ? (
                            <TextField
                              value={editedSubject}
                              onChange={(e) => setEditedSubject(e.target.value)}
                              size="small"
                            />
                          ) : (
                            row.subject
                          )}
                        </TableCell>
                        <TableCell>{formatDate(row.createdAt)}</TableCell>
                        <TableCell>{formatDate(row.modifiedAt)}</TableCell>
                        <TableCell>
                          {editingId === row.id ? (
                            <>
                              <IconButton onClick={() => handleSave(row.id)} size="small">
                                <SaveIcon />
                              </IconButton>
                              <IconButton onClick={handleCancel} size="small">
                                <CancelIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton onClick={() => handleEdit(row.id, row.subject)} size="small">
                              <EditIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No results found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {searchResults.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
        <input 
          type="hidden" 
          name="currentSearchCriteria" 
          value={currentSearchCriteria?.toString() || ''} 
        />
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}
