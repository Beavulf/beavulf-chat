'use client'

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

const authUserFetch = async () => {
  const res = await fetch('/api/auth');

  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  }

  return await res.json();
};

const signInFetch = async () => {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  }

  return await res.json();
}

const signUpFetch = async () => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  }

  return await res.json();
}

const signOutFetch = async () => {
  const res = await fetch('/api/auth/signout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  }

  return await res.json();
}

export default function Home() {

  const { data, error, isLoading } = useQuery({
    queryFn: authUserFetch,
    queryKey: ['auth'],
    retry: false,
  });

  useEffect(()=>{
    console.log(data);
    console.log(error);
  },[data,error])

  const signInMutation = useMutation({
    mutationFn: signInFetch,
    onError: (error: any) => {
      if (error.code === 'DATABASE_ERROR') {
        console.error(error.message)
        return;
      }
      if (error.code === 'ALREADY_AUTHORIZED') {
        console.error('Вы уже авторизованы.')
        return;
      }
      console.error(`Неизвестная ошибка ${error.message}`)
    },
    onSuccess: (data) => {
      console.log(data);
    }
  });

  const signUpMutation = useMutation({
    mutationFn: signUpFetch,
    onError: (error: any) => {
      if (error.code === 'DATABASE_ERROR') {
        console.error(error.message)
        return;
      }
      if (error.code === 'ALREADY_AUTHORIZED') {
        console.error('Вы уже авторизованы')
        return;
      }
      console.error(`Неизвестная ошибка ${error.message}`)
    },
    onSuccess: (data) => {
      console.log(data);
    }
  });

  const signOutMutation = useMutation({
    mutationFn: signOutFetch,
    onError: (error: any) => {
      if (error.code === 'DATABASE_ERROR') {
        console.error(error.message)
        return;
      }
      if (error.code === 'NOT_AUTHORIZED') {
        console.error('Вы не авторизованы.')
        return;
      }
      console.error(`Неизвестная ошибка  ${error.message}`)
    },
    onSuccess: (data) => {
      console.log(data);
    }
  });


  return (
    <div>
      {isLoading ? <div>Loading...</div> : (data.message)}
      <Button onClick={()=> signInMutation.mutate()}>SIGN</Button>
      <Button onClick={()=> signUpMutation.mutate()}>SIGN UP</Button>
      <Button onClick={()=> signOutMutation.mutate()}>SIGN OUT</Button>
    </div>
  );
}
