import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      NextResponse.json(
        { error: "Email и пароль обязательны" }, 
        { status: 400 }
      )
    }
    const user = await authService.signUpUser(email, password);
    
    return NextResponse.json(
      {user}, 
      {status: 200}
    );
  }
  catch(e) {
    return handleError(e);
  }
}