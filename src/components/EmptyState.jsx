import React from "react";
import { BiBox } from "react-icons/bi";

export const EmptyState = ({ message, icon: Icon = BiBox }) => {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
      <div className='glass-card rounded-3xl p-10 mb-5 transition-all duration-normal ease-out hover:shadow-glass hover:-translate-y-0.5'>
        <div className='text-muted-foreground/70'>
          <Icon size='3.5em' aria-hidden='true' />
        </div>
      </div>
      <p className='text-muted-foreground text-sm max-w-xs text-wrap-pretty'>
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
