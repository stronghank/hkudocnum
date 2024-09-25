'use client';

import { Typography, Box, Button } from '@mui/material';
import { signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function AccessDenied() {
  const router = useRouter();

  const handleReturnToHomepage = async () => {
    // Sign out the user
    await signOut({ redirect: false });
    
    // Redirect to the HKU Med homepage
    window.location.href = 'https://www.med.hku.hk/en/';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" gutterBottom>
        You do not have the necessary permissions to access this system.
      </Typography>
      <Button variant="contained" onClick={handleReturnToHomepage} sx={{ mt: 2 }}>
        Return to HKU Med Homepage
      </Button>
    </Box>
  );
}