export const API_CONFIG = {
    AUTH: {
        SIGN_IN:"/api/auth/signin",
        SIGN_UP:"/api/auth/signup",
        SIGN_OUT:"/api/auth/signout",
        ENSURE_SESSION:"/api/auth",
    },
    CHATS: {
        GET:"/api/chats", //все чаты авторизованного пользователя
        POST:"/api/chats", //создание чата для авторизованного пользователя
        DELETE:"/api/chats/:id", //удаление чата по айди
        RENAME:"/api/chats/:id", //переименование чата по айди
        GET_BY_ID:"/api/chats/:id", //получение чата по айди
    },
    MESSAGES: {
        GET:"/api/chats/:chatId/messages", //все сообщения чата по айди
        POST:"/api/chats/:chatId/messages", //создание сообщения для чата по айди
    },
    FILES: {
        GET: "/api/files/:id",
        DELETE: "/api/files/:id",
        UPLOAD: "/api/upload"
    }
}