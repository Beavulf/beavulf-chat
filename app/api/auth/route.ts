import { NextResponse } from "next/server";
import { authService } from "@/service/auth-service";
import { handleError } from "@/lib/utils";

export async function GET() {
    try {
        const {user, type} = await authService.auth();    

        if (type === 'anon') {
            return NextResponse.json(
                {message: "Вы авторизовались анонимно", user}, 
                {status: 200}
            );
        }

        return NextResponse.json(
            {message:"Вы авторизовались", user}, 
            {status: 200}
        );
    }
    catch(e) {
        return handleError(e); 
    }
}