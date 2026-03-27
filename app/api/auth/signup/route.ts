import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/service/auth-service";


export async function POST(request: NextRequest) {

    const isSignUp = await authService.signUpUser();
    return NextResponse.json(isSignUp);
}