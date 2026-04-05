import { NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";
import type { TAuthSessionResponse } from "@/types/auth-types";

export async function GET(): Promise<NextResponse> {
  try {
    const {user, type} = await authService.ensureSession();    
    const body : TAuthSessionResponse = {type, user}
    return NextResponse.json(
      body, 
      {status: 200}
    );
  }
  catch(e) {
    return handleError(e); 
  }
}