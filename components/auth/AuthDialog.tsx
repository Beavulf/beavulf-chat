'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoginForm } from "../login-form"
import { SignUpForm } from "../sign-up-form";
import { ForgotPasswordForm } from "../forgot-password-form";
import { useState } from "react";

type FormType = 'login' | 'signup' | 'forgot';

export function AuthDialog(
  {children, view}: 
  {children: React.ReactNode, view: FormType}
) {
  const [open, setOpen] = useState<boolean>(false);
  const [formView, setFormView] = useState<FormType>(view);

  return (
  <Dialog open={open} onOpenChange={(open)=>{setFormView(view); setOpen(open)}}>
    <DialogTrigger className="w-full">
      {children}
    </DialogTrigger>
    <DialogContent className="sm:max-w-sm">
      <DialogDescription>Войдите в аккаунт или создайте новый</DialogDescription>
      <DialogHeader>
        <DialogTitle>
        </DialogTitle>
      </DialogHeader>
      {formView === 'login'  && <LoginForm 
        onSignUp={() => setFormView('signup')} 
        onForgot={() => setFormView('forgot')}
        onSuccess={() => {
          setOpen(false);
        }}
      />}
      {formView === 'signup' && <SignUpForm onLogin={() => setFormView('login')} />}
      {formView === 'forgot' && <ForgotPasswordForm onBack={() => setFormView('login')} />}
    </DialogContent>
  </Dialog>
  )
}
