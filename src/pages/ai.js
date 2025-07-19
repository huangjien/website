"use client";

// Import hooks from ahooks and react-i18next, and UI components
import { useLocalStorageState, useTitle, useDebounceEffect } from "ahooks";
import { useTranslation } from "react-i18next";
import { IssueList } from "../components/IssueList";
import { QuestionTabs } from "../components/QuestionTabs";

// Main AI component: manages Q&A content stored in local storage and displays UI components.
export default function AI() {
  // Retrieve 'QandA' content from local storage; initialize with an empty array if not available.
  const [content, setContent] = useLocalStorageState("QandA", {
    defaultValue: [],
  });

  // Initialize translation hook and set the document title using the 'header.ai' translation key.
  const { t } = useTranslation();
  useTitle(t("header.ai"));

  // Function to append a new Q&A record into the content.
  const append = (qandA) => {
    if (!content) {
      // If content is empty, start with the new Q&A record.
      setContent([qandA]);
    } else {
      // Otherwise, add the new Q&A record to the beginning of the array.
      setContent([qandA, ...content]);
    }
  };

  // Debounce effect to limit the frequency of running cleanup logic.
  // This effect cleans up local storage content if it exceeds 1000 records.
  useDebounceEffect(
    () => {
      // Check if the content array has more than 1000 items.
      if (content.length > 1000) {
        const now = new Date();
        // Calculate the timestamp for one month ago.
        const oneMonthAgo = new Date(
          now.getTime() - 1000 * 60 * 60 * 24 * 30
        ).getTime();
        // Convert timestamp to seconds.
        const oneMonthTimestamp = Math.round(oneMonthAgo / 1000);
        // Filter out records older than one month.
        const newArray = content.filter((item) => {
          return item.timestamp > oneMonthTimestamp;
        });
        // Update the content with the filtered array.
        setContent(newArray);
      }
    },
    [content],
    { wait: 200000 } // Debounce wait time in milliseconds.
  );

  // Render the AI page with QuestionTabs for input and IssueList for displaying content.
  return (
    <div
      className='min-h-max w-auto text-lg lg:gap-4 lg:m-4 '
      data-testid='ai-container'
    >
      {/* Component for managing new Q&A entries; uses the append function to update content */}
      <QuestionTabs append={append} />
      {/* Component to display the list of Q&A records or issues */}
      <IssueList data={content} ComponentName={"Chat"} />
    </div>
  );
}
