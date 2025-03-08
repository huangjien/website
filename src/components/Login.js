"use client";
import { useTranslation } from "react-i18next";
import { BiUser } from "react-icons/bi";
import { useTheme } from "next-themes";
import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const { data: sesssion, status } = useSession();
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <>
      {status === "unauthenticated" && (
        <>
          <Tooltip color='primary' content={t("header.login")}>
            <button
              aria-label='login'
              className='bg-transparent  text-primary '
              auto
              shadow
              onPress={() => signIn()}
            >
              <BiUser size='2em' />
            </button>
          </Tooltip>
        </>
      )}
      {status === "authenticated" && (
        <Dropdown placement='bottom-left'>
          <DropdownTrigger>
            <Avatar
              isBordered
              showFallback
              fallback={<BiUser />}
              alt={sesssion.user.name}
              text={sesssion.user.name}
              src={sesssion.user.image}
            />
          </DropdownTrigger>
          <DropdownMenu
            theme={theme === "dark" ? "dark" : "light"}
            aria-label='Avatar Actions'
          >
            <MenuItem key='email' textValue={sesssion.user.email}>
              <p color='inherit'>{sesssion.user.email}</p>
            </MenuItem>

            <MenuItem
              key='logout'
              onPress={() => signOut()}
              color='error'
              textValue={t("header.logout")}
            >
              <p color='inherit'>{t("header.logout")}</p>
            </MenuItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </>
  );
};

export default Login;
