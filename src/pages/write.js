import { useTitle } from "ahooks";
import { signIn } from "next-auth/react";
import { BiLockAlt } from "react-icons/bi";
import { BlogEditor } from "../components/BlogEditor";
import Button from "../components/ui/button";
import LoadingSpinner from "../components/ui/loading-spinner";
import { useAuthorCapability } from "../lib/useAuthorCapability";

export default function Write() {
  useTitle("Write");
  const { authenticated, canPublish, loading, error, refresh } =
    useAuthorCapability();

  if (loading) {
    return (
      <div className='glass-card mx-auto flex min-h-64 max-w-xl flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center'>
        <LoadingSpinner />
        <p className='text-sm text-muted-foreground'>Preparing your studio…</p>
      </div>
    );
  }

  if (error) {
    return (
      <PrivateStudioState
        title='Studio unavailable'
        description='Publishing access could not be verified. Please try again.'
        action={<Button onClick={refresh}>Try again</Button>}
      />
    );
  }

  if (!authenticated) {
    return (
      <PrivateStudioState
        title='Your private writing studio'
        description='Sign in with your GitHub account to create a new blog article.'
        action={
          <Button onClick={() => signIn("github")}>Sign in to continue</Button>
        }
      />
    );
  }

  if (!canPublish) {
    return (
      <PrivateStudioState
        title='This studio is private'
        description='This signed-in account does not have publishing access.'
      />
    );
  }

  return <BlogEditor />;
}

function PrivateStudioState({ title, description, action }) {
  return (
    <section className='glass-card mx-auto flex min-h-72 max-w-xl flex-col items-center justify-center gap-5 rounded-2xl p-8 text-center animate-fade-in'>
      <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground'>
        <BiLockAlt size='1.6rem' aria-hidden='true' />
      </span>
      <div className='space-y-2'>
        <h1 className='display text-2xl font-medium text-foreground'>
          {title}
        </h1>
        <p className='text-sm leading-6 text-muted-foreground'>{description}</p>
      </div>
      {action}
    </section>
  );
}
