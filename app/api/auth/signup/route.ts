import { NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";

export async function POST(): Promise<NextResponse> {
  try {
    const user = await authService.signUpUser();
    return NextResponse.json(
      {user}, 
      {status: 200}
    );
  }
  catch(e) {
    return handleError(e);
  }
}