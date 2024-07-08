import { Button, Card, Container, Snackbar, TextField } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { FC, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import gitlabInterceptor from '../../utils/GitlabInterceptor';
import { getClasses } from './styles';
import { JwtPayloadProps } from './types';
import CryptoJS from 'crypto-js';

export const LoginPage: FC = () => {
  const classes = getClasses();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [, setCookies ] = useCookies();
  const navigate = useNavigate();


  const handleLogin = async (e: React.FormEvent) => {
    const refreshTokenExpirationDate = new Date();
    refreshTokenExpirationDate.setDate(refreshTokenExpirationDate.getDate() + 7)
    e.preventDefault();

    try { 
      const response = await gitlabInterceptor.post('/login', {
        username,
        password: CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex),
      }, {
        validateStatus: function (status: number) {
          return (status >= 200 && status < 500);
        },
      });

      if (response.status === 200) {
        setCookies('access_token_cookie', response.headers.access_token, {path: '/', maxAge: 3600});
        setCookies('refresh_token_cookie', response.headers.refresh_token, {path: '/', expires: refreshTokenExpirationDate});
        setCookies('csrf_access_token', jwtDecode<JwtPayloadProps>(response.headers.access_token).csrf, {path: '/', maxAge: 3600});
        setCookies('csrf_refresh_token', jwtDecode<JwtPayloadProps>(response.headers.refresh_token).csrf, {path: '/', expires: refreshTokenExpirationDate});
        navigate('/home');
      } 
      else if (response.status === 500) {
        setLoginError('An error occured while trying to reach the server. Please try again later.');
        setSnackbarOpen(true);
      }
      else if (response.status === 401) {
        setLoginError('Invalid login credentials.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError('An error occurred during login. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  return (
    <>
      <Container className={classes.frame}>
        <Card className={classes.mainContent}>
          <form onSubmit={handleLogin} className={classes.form}>
            <TextField
              required
              fullWidth
              id="username"
              name="username"
              autoComplete="username"
              label="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={classes.textField}>
            </TextField>
            <TextField
              required
              fullWidth
              type="password"
              id="password"
              name="password"
              autoComplete="password"
              label="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={classes.textField}>
            </TextField>
            <Button
              className={classes.loginButton}
              type="submit">
                Login
            </Button>
          </form>
        </Card>
      </Container>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={loginError}
      />
    </>
  );
};