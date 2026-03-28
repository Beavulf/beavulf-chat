export class AppError extends Error {
    constructor(
      public readonly message: string,
      public readonly code: string,
      public readonly statusCode: number
    ) {
      super(message)
      this.name = this.constructor.name
    }
  }
  
  export class DatabaseError extends AppError {
    constructor(message: string) {
      super(message, 'DATABASE_ERROR', 500)
    }
  }
  
  export class BusinessError extends AppError {
    constructor(message: string, code: string) {
      super(message, code, 422)
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(entity: string) {
      super(`${entity} не найден`, 'NOT_FOUND', 404)
    }
  }