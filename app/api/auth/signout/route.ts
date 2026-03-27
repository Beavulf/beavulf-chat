import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/service/auth-service";


export async function POST(request: NextRequest) {

    const isSignOut = await authService.signOutUser();
    return NextResponse.json(isSignOut);
}