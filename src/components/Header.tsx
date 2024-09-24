'use client';

import React from 'react';
import { AppBar, Toolbar, Button, Box, Container, Avatar, Typography, Tooltip } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonIcon from '@mui/icons-material/Person';
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import imageLoader from '../utils/imageLoader';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Generate', path: '/generate' },
    { name: 'History', path: '/query' },
    ...(session?.user?.isAdmin ? [{ name: 'Admin', path: '/admin' }] : [])
  ];

  console.log("Session in Header:", session);
  console.log("Is Admin:", session?.user?.isAdmin);

  const handleSignIn = () => {
    signIn('keycloak');
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('https://www.med.hku.hk/en/');
  };

  console.log("Session in Header:", session);

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '80px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image 
            loader={imageLoader}
            src="/docnum/images/HKU_LKS_Logo.png"
            alt="HKU Med Logo" 
            width={250} 
            height={60} 
            style={{ objectFit: 'contain' }}
          />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.path} 
                passHref
              >
                <Button 
                  sx={{ 
                    mx: 1, 
                    color: pathname === item.path ? '#49c0b6' : 'black', 
                    '&:hover': { 
                      bgcolor: 'transparent', 
                      color: '#49c0b6',
                    },
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: pathname === item.path ? '100%' : 0,
                      height: '2px',
                      backgroundColor: '#49c0b6',
                      transition: 'width 0.3s ease-in-out',
                    },
                    '&:hover::after': {
                      width: '100%',
                    }
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            {status === 'authenticated' && session?.user ? (
              <>
                <Tooltip title={`Login User: ${session.user.uid || session.user.email}`}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    ml: 2, 
                    p: 1, 
                    borderRadius: 1, 
                    transition: 'all 0.3s ease-in-out'
                  }}>
                    <Avatar sx={{ bgcolor: '#49c0b6', mr: 1 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {(session.user as any).uid || session.user.email}
                    </Typography>
                  </Box>
                </Tooltip>
                <Button onClick={handleSignOut} sx={{ ml: 2 }}>Sign out</Button>
              </>
            ) : (
              <Button onClick={handleSignIn}>Sign in</Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;