import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import DarkModeSwitch from './DarkModeSwitch';
import { AccountCircle } from '@mui/icons-material';
import Link from 'next/link';
import { AUTH_TOKEN } from '../pages/_app';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/useAuth';

interface NavLink {
  label: string;
  href: string;
}

const pages: NavLink[] = [
  {
    label: 'Add Receipt',
    href: '/create-receipt',
  },
  {
    label: 'Dashboard',
    href: '/',
  },
];

const settingsMenuLinks: NavLink[] = [
  {
    label: 'Profile',
    href: '/profile',
  },
  {
    label: 'Reports',
    href: '/reports',
  },
  {
    label: 'Dashboard',
    href: '/',
  },
];

type NavbarProps = {
  toggleTheme: () => void;
};

function Navbar(props: NavbarProps) {
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const { userToken, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userToken) {
      setAuthToken(userToken);
    } else {
      setAuthToken(null);
    }
  }, [userToken, authToken]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    setAuthToken(null);
    logout();
    router.push('/login');
  };

  return (
    <AppBar position="static" enableColorOnDark>
      <Toolbar>
        <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Ceipt-Geek
        </Typography>

        {authToken && (
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page, i) => (
                <Link key={`${page.href}_${i}`} href={page.href}>
                  <MenuItem>
                    <Typography textAlign="center">{page.label}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>
        )}

        <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
        <Typography
          variant="h5"
          noWrap
          component="a"
          href=""
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Ceipt-Geek
        </Typography>
        {authToken && (
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page, i) => (
              <Link key={`${page.href}_${i}`} href={page.href}>
                <Button sx={{ my: 2, color: 'white', display: 'block' }}>{page.label}</Button>
              </Link>
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: { md: 'block', xs: 'none' },
          }}
        >
          <DarkModeSwitch toggleTheme={props.toggleTheme} />
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          {authToken ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenUserMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settingsMenuLinks.map((setting, i) => (
                  <Link key={`${setting.label}_${i}`} href={setting.href}>
                    <MenuItem>
                      <Typography textAlign="center">{setting.label}</Typography>
                    </MenuItem>
                  </Link>
                ))}
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Button color="inherit">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default Navbar;
