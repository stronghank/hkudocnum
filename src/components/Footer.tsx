import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ 
      py: 3, 
      bgcolor: '#004e4a', 
      color: 'white',
      mt: 'auto'
    }}>
      <Typography variant="body2" align="center">
        © {new Date().getFullYear()} Li Ka Shing Faculty of Medicine, The University of Hong Kong. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;