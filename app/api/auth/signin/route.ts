import { NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";

export async function POST() {
  try {
    const user = await authService.signInUser();
    return NextResponse.json(
      {user},
      {status: 200}
    );
  }
  catch(e) {
    return handleError(e);
  }
}