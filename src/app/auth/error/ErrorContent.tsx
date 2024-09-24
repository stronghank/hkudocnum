'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography, Box, Button } from '@mui/material';
import { signOut } from 'next-auth/react';

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(searchParams?.get('error') || 'An unknown error occurred');
  }, [searchParams]);

  const handleSignOut = () => {
    signOut({ callbackUrl: 'https://www.med.hku.hk/en/' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" gutterBottom>
        {error}
      </Typography>
      <Button variant="contained" onClick={handleSignOut} sx={{ mt: 2 }}>
        Return to HKU Med Homepage
      </Button>
    </Box>
  );
}