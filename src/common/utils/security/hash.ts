import { SALT_ROUNDS } from "../../../config/config.service";
import { hashSync , compareSync } from "bcrypt";




export function hash({
    plain_text,
    salt_rounds = Number(SALT_ROUNDS)
}:{
    plain_text: string;
    salt_rounds?: number;
}):string{
    return hashSync(plain_text.toString(), Number(salt_rounds));
}

export function compare({
    plain_text,
    cipher_text,
    
}:{
    plain_text: string; 
    cipher_text: string;

}):boolean{
    return compareSync (plain_text, cipher_text);
}