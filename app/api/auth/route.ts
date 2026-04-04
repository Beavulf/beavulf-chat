import { NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { TAuthSessionResponse, TUserDto } from "@/types/auth-types";

function toUserDto(user: User):TUserDto {
    return {
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        is_anonymous: !!user.is_anonymous
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        const {user, type} = await authService.ensureSession();    
        const body : TAuthSessionResponse = {type, user: toUserDto(user)}
        return NextResponse.json(
            body, 
            {status: 200}
        );
    }
    catch(e) {
        return handleError(e); 
    }
}