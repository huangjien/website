'use client';
import { Button } from '@nextui-org/button';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { BiMoon, BiSun } from 'react-icons/bi';

export const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onChange = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <Button light className=" bg-transparent text-success "
      onClick={onChange}>
      {theme === 'light' && <BiMoon size={'2em'} />}
      {theme !== 'light' && <BiSun size={'2em'} />}
    </Button>

  );
};
