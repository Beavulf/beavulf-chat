import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();
    const user = await authService.signInUser(email, password);
    return NextResponse.json(
      {user},
      {status: 200}
    );
  }
  catch(e) {
    return handleError(e);
  }
}