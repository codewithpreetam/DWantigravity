"use client";

import React, { useTransition } from "react";
import { toast } from "react-hot-toast";

interface ClientActionFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  actionFunc: (formData: FormData) => Promise<any>;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function ClientActionForm({ 
  actionFunc, 
  successMessage = "Action completed successfully", 
  errorMessage = "An error occurred",
  onSuccess,
  children,
  ...props
}: ClientActionFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await actionFunc(formData);
        toast.success(successMessage);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        toast.error(err.message || errorMessage);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      <fieldset disabled={isPending} className="border-0 p-0 m-0 w-full group">
        {children}
      </fieldset>
    </form>
  );
}
