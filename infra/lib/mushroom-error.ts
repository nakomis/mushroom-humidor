type ErrorName =
    'ENV_NOT_SET_ERROR';

export class MushroomError extends Error {
    name: ErrorName;
    message: string;

    constructor({
        name,
        message,
    }: {
        name: ErrorName;
        message: string;
    }) { 
        super();
        this.name = name;
        this.message = message;
    }
}