"use client";
import {
  Avatar,
  Button,
  Dropdown,
  Tooltip,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
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
            <Button
              aria-label='login'
              className='bg-transparent  text-primary '
              auto
              shadow
              onClick={() => signIn()}
            >
              <BiUser size='2em' />
            </Button>
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
            <DropdownItem key='email' textValue={sesssion.user.email}>
              <p color='inherit'>{sesssion.user.email}</p>
            </DropdownItem>

            <DropdownItem
              key='logout'
              onClick={() => signOut()}
              withDivider
              color='error'
              textValue={t("header.logout")}
            >
              <p color='inherit'>{t("header.logout")}</p>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </>
  );
};

export default Login;
