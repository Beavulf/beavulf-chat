'use client'

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const fetchData = async () => {
  try {
    const res = await fetch('/api/auth');
    const data = await res.json()
    console.log(data);
    
  } catch (e) {
    console.log(e);
  }
};

const loginIn = async () => {
  try {
    const res = await fetch('/api/auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    console.log(data);
  }
  catch(e) {
    console.log(e);
  }
}

const signUp = async () => {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    console.log(data);
  }
  catch(e) {
    console.log(e);
  }
}

const signOut = async () => {
  try {
    const res = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    console.log(data);
  }
  catch(e) {
    console.log(e);
  }
}

export default function Home() {

  useEffect(()=>{
    fetchData();
  },[]);

  return (
    <div>
      HELLO!sss
      <Button onClick={loginIn}>SIGN</Button>
      <Button onClick={signUp}>SIGN UP</Button>
      <Button onClick={signOut}>SIGN OUT</Button>

    </div>
  );
}
