import React from "react";
import { BiBox } from "react-icons/bi";

export const EmptyState = ({ message, icon: Icon = BiBox }) => {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <div className='glass-card rounded-2xl p-8 mb-4 transition-all duration-fast ease-out hover:shadow-glass hover:-translate-y-1'>
        <div className='text-muted-foreground'>
          <Icon size='4em' aria-hidden='true' />
        </div>
      </div>
      <p className='text-muted-foreground text-sm'>{message}</p>
    </div>
  );
};

export default EmptyState;
