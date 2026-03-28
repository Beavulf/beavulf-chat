import { NextResponse, NextRequest } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";

export async function POST(request: NextRequest) {
    try {
        const user = await authService.signInUser();
        return NextResponse.json(
            {success: true, user},
            {status: 200});
    }
    catch(e) {
        return handleError(e);
    }
}