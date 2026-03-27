import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/service/auth-service";


export async function GET() {
    const {user, anonUser} = await authService.auth();    
    return NextResponse.json({user, anonUser});
}

export async function POST(request: NextRequest) {
    // const { title } = await request.json();
    // const userId = request.cookies.get('userId')?.value;
    // if (!userId) {
        // return NextResponse.json({ error: "userId cookie required" }, { status: 400 });
    // }
    const isLogin = await authService.signInUser();
    return NextResponse.json(isLogin);
}