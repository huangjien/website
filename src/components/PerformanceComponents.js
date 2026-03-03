"use client";

import { memo } from "react";
import { BiError } from "react-icons/bi";

export const IssueCard = memo(
  function IssueCard({ issue, onClick }) {
    return (
      <div
        className='p-4 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer'
        onClick={() => onClick(issue)}
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <h3 className='font-semibold text-lg'>{issue.title}</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              #{issue.id} opened on{" "}
              {new Date(issue.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className='flex gap-2'>
            {issue["labels.name"]?.map((label) => (
              <span
                key={label}
                className='px-2 py-1 text-xs rounded-full bg-primary/10 text-primary'
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.issue.id === nextProps.issue.id &&
      prevProps.issue.updated_at === nextProps.issue.updated_at
    );
  },
);

export const CommentItem = memo(
  function CommentItem({ comment }) {
    return (
      <div className='p-4 border-b border-border'>
        <div className='flex items-start gap-3'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={comment.user?.avatar_url}
            alt={comment.user?.login}
            className='w-8 h-8 rounded-full'
          />
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold'>{comment.user?.login}</span>
              <span className='text-xs text-muted-foreground'>
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <p className='mt-2 text-sm'>{comment.body}</p>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.comment.id === nextProps.comment.id;
  },
);

export const ErrorDisplay = memo(function ErrorDisplay({ message, onRetry }) {
  return (
    <div className='flex flex-col items-center justify-center p-8 text-center'>
      <BiError size={48} className='text-destructive mb-4' />
      <p className='text-lg font-semibold mb-2'>Something went wrong</p>
      <p className='text-muted-foreground mb-4'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
        >
          Retry
        </button>
      )}
    </div>
  );
});

export const LoadingSkeleton = memo(function LoadingSkeleton({ count = 5 }) {
  return (
    <div className='space-y-4'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='p-4 border-b border-border animate-pulse'>
          <div className='flex justify-between items-start gap-4'>
            <div className='flex-1 space-y-2'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
            </div>
            <div className='h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full'></div>
          </div>
        </div>
      ))}
    </div>
  );
});

export const EmptyState = memo(function EmptyState({
  message,
  actionText,
  onAction,
}) {
  return (
    <div className='flex flex-col items-center justify-center p-12 text-center'>
      <div className='text-6xl mb-4'>📭</div>
      <p className='text-lg font-semibold mb-2'>No data found</p>
      <p className='text-muted-foreground mb-4'>{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
        >
          {actionText}
        </button>
      )}
    </div>
  );
});
