import React from "react";
import type { User } from "../types/user.types";
import { Card } from "@/components/ui";

interface UserCardProps {
    user: User;
    onEdit?: (user: User) => void;
    onDelete?: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
    return (
        <Card>
            <div className="user-card">
                <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                </div>
                <div className="user-actions">
                    {onEdit && <button onClick={() => onEdit(user)}>Edit</button>}
                    {onDelete && (
                        <button onClick={() => onDelete(user.id)} className="btn-danger">
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};
