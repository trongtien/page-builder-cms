import { apiService } from "@/services/api.service";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types";

class UserService {
    private baseEndpoint = "/users";

    async getUsers(): Promise<User[]> {
        return apiService.get<User[]>(this.baseEndpoint);
    }

    async getUserById(id: string): Promise<User> {
        return apiService.get<User>(`${this.baseEndpoint}/${id}`);
    }

    async createUser(data: CreateUserDto): Promise<User> {
        return apiService.post<User>(this.baseEndpoint, data);
    }

    async updateUser(data: UpdateUserDto): Promise<User> {
        return apiService.put<User>(`${this.baseEndpoint}/${data.id}`, data);
    }

    async deleteUser(id: string): Promise<void> {
        return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
    }
}

export const userService = new UserService();
