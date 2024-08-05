'use client';
import React from 'react';
import { auth, googleAuthProvider } from './firebase';
import { Box, Button, Paper, Typography } from '@mui/material';

const signIn = () =>{
    const signInWithGoogle = async () => {
        try{
            await auth.signInWithPopup(googleAuthProvider);
        }   catch (error) {
            console.error('Error signing in with Google:', error);
        }

    };
   
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} padding={2} style={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Pantry Tracker
        </Typography>
        <Button variant="contained" color="primary" onClick={signInWithGoogle}>
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default login;