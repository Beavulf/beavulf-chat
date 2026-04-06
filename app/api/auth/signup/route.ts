import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";
import { validEmailPass } from "../_helpers";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } : { email: string, password: string } = await req.json();
    validEmailPass(email, password);
    const user = await authService.signUpUser(email, password);
    
    return NextResponse.json(
      {user}, 
      {status: 201}
    );
  }
  catch(e) {
    return handleError(e);
  }
}