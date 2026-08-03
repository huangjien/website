import { useGithubContent } from "../lib/useGithubContent";
import { useTitle } from "ahooks";
import { useTranslation } from "react-i18next";
import { IssueList } from "../components/IssueList";

export default function Home() {
  const { tags, issues } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t("header.home"));
  return (
    <div className='hallmark-page'>
      <header className='hallmark-hero'>
        <h1 className='hallmark-hero__title'>{t("header.home")}</h1>
      </header>
      <section className='hallmark-section'>
        <IssueList
          tags={tags}
          data={issues}
          ComponentName={"Issue"}
          inTab='issue'
        />
      </section>
    </div>
  );
}
