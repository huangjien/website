"use client";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  User,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { MdLogin, MdLogout, MdSettings } from "react-icons/md";
import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  const handleDropdownAction = (key) => {
    switch (key) {
      case "logout":
        signOut();
        break;
      case "settings":
        window.open("/settings", "_blank");
        break;
      default:
        break;
    }
  };

  if (status === "unauthenticated" || status === "loading" || !session?.user) {
    return (
      <Button
        variant='flat'
        onPress={() => signIn("github")}
        startContent={<MdLogin />}
      >
        {t("header.login")}
      </Button>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <User
          name={session.user.name || ""}
          description={session.user.email || ""}
          avatarProps={{
            src: session.user.image || "",
          }}
        />
      </DropdownTrigger>
      <DropdownMenu onAction={handleDropdownAction}>
        <DropdownSection title={t("header.message")}>
          <DropdownItem key='settings' startContent={<MdSettings />}>
            {t("header.settings")}
          </DropdownItem>
          <DropdownItem key='logout' startContent={<MdLogout />}>
            {t("header.logout")}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export { Login };
export default Login;
