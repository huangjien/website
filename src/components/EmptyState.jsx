import React from "react";
import { BiInbox } from "react-icons/bi";

export const EmptyState = ({ message, icon: Icon = BiInbox }) => {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <div className='text-muted-foreground mb-4'>
        <Icon size='4em' aria-hidden='true' />
      </div>
      <p className='text-muted-foreground text-sm'>{message}</p>
    </div>
  );
};

export default EmptyState;
