export interface User{
    id: string;
    username: string;
    email: string;
    password: string;
    phone: string; 
    createdAt: Date; // Sirve para saber cuando se creo el usuario
    role: string; // Sirve para saber el rol del usuario, admin o user
}

export interface UserService{
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User>;
    create(createUserDto: any): Promise<void>;
    update(id: string, updateUserDto: any): Promise<User>;
    delete(id: string): Promise<void>;
}