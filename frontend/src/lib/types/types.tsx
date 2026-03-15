export interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

export interface User {
    name?           : string  | undefined,
    nickname?       : string  | undefined,
    picture?        : string  | undefined,
    sub             : string  | undefined,
    given_name?     : string  | undefined,
    family_name?    : string  | undefined,
    email?          : string  | undefined,
    email_verified? : boolean | undefined
}