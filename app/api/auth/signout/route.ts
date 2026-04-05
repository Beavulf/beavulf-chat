import { NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";


export async function POST(): Promise<NextResponse> {
    try {
        const isSignOut = await authService.signOutUser();
        return NextResponse.json(
            {success: isSignOut},
            {status: 200}
        );
    }
    catch(e) {
        return handleError(e);
    }
}