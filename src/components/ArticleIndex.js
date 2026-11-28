import { memo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Renders the index of the articles on the page. Every entry opens its
 * article and scrolls to it.
 * @param {Object} props - Component props
 * @param {Array} props.items - The articles to list
 * @param {string|number} props.openId - The id of the open article
 * @param {Function} props.onSelect - Called with the id of the chosen article
 * @returns {JSX.Element|null} - The rendered index
 */
export const ArticleIndex = ({ items = [], openId = null, onSelect }) => {
  const { t } = useTranslation();

  if (!items.length) {
    return null;
  }

  return (
    <nav aria-labelledby='article-index-title' data-testid='article-index'>
      <h2
        id='article-index-title'
        className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'
      >
        {t("index.title", { defaultValue: "Contents" })}
      </h2>
      <div className='mt-3 space-y-1'>
        {items.map((item) => {
          const isOpen = openId !== null && String(openId) === String(item.id);
          return (
            <div key={item.id}>
              <button
                type='button'
                onClick={() => onSelect(item.id)}
                aria-current={isOpen ? "true" : undefined}
                aria-expanded={isOpen ? "true" : "false"}
                className={`w-full cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isOpen
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:text-foreground"
                }`}
              >
                <span className='line-clamp-2'>{item.title}</span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export const MemoizedArticleIndex = memo(ArticleIndex);
MemoizedArticleIndex.displayName = "ArticleIndex";
