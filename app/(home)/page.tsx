'use client'

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

export default function Home() {

  useEffect(()=>{
    fetchData();
  },[]);

  return (
    <div>
      HELLO!sss
    </div>
  );
}
