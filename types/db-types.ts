import type { Database } from "./database.types";

export type TChat = Database["public"]["Tables"]["chats"]["Row"];
export type TChatUpdate = Database["public"]["Tables"]["chats"]["Update"];
export type TChatInsert = Database["public"]["Tables"]["chats"]["Insert"];

export type TMessage = Database["public"]["Tables"]["messages"]["Row"];
export type TMessageUpdate = Database["public"]["Tables"]["messages"]["Update"];
export type TMessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export type TFile = Database["public"]["Tables"]["files"]["Row"];
export type TFileUpdate = Database["public"]["Tables"]["files"]["Update"];
export type TFileInsert = Database["public"]["Tables"]["files"]["Insert"];

export type TUserLimit = Database["public"]["Tables"]["user_limits"]["Row"];
export type TUserLimitUpdate = Database["public"]["Tables"]["user_limits"]["Update"];
export type TUserLimitInsert = Database["public"]["Tables"]["user_limits"]["Insert"];