import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiChevronRight } from "react-icons/bi";
import { useTranslation } from "react-i18next";

export const Breadcrumb = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = [
    { href: "/", label: t("header.home") },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      let label = segment;

      if (segment === "ai") label = t("header.ai");
      if (segment === "settings") label = t("header.settings");
      if (segment === "about") label = t("header.about");

      return { href, label };
    }),
  ];

  return (
    <nav
      aria-label='Breadcrumb'
      className='flex items-center gap-2 text-sm text-muted-foreground mb-4'
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <BiChevronRight
              size='0.8em'
              className='text-muted-foreground/60'
              aria-hidden='true'
            />
          )}
          <Link
            href={item.href}
            className={
              index === breadcrumbItems.length - 1
                ? "text-foreground font-medium"
                : "hover:text-foreground transition-colors"
            }
            aria-current={
              index === breadcrumbItems.length - 1 ? "page" : undefined
            }
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
