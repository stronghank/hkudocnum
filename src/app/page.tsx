'use client';

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Typography, Button, Box, Stack, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("keycloak"/*, { callbackUrl: "/docnum" }*/);
    }
  }, [status]);

  if (status === "loading") {
    return <CircularProgress />;
  }

  if (status === "unauthenticated") {
    return <Typography>Redirecting to login...</Typography>;
  }

  if (!session) {
    return <Typography>Session not found. Please try logging in again.</Typography>;
  }

  console.log("Session exists:", session);

  return (
    <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Document Number Management System
      </Typography>
      <Stack spacing={2} sx={{ mt: 4, width: '100%', maxWidth: 300 }}>
        <Link href="/generate" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              bgcolor: '#000000',
              '&:hover': {
                bgcolor: '#49c0b6',
              },
              fontFamily: 'Arial',
            }}
          >
            Generate Document Number
          </Button>
        </Link>
        <Link href="/query" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              bgcolor: '#8e9090',
              '&:hover': {
                bgcolor: '#49c0b6',
              },
              fontFamily: 'Arial',
            }}
          >
            Your Generation History
          </Button>
        </Link>
      </Stack>
    </Box>
  );
}