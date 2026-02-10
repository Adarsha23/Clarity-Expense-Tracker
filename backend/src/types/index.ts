// ============================================================================
// TYPESCRIPT TYPE DEFINITIONS
// ============================================================================
//
// PURPOSE:
// Extend Express's Request type to include our custom 'user' property.
// This gives us TypeScript autocomplete and type safety when accessing req.user
//
// WHY EXTEND Request?
// - Express doesn't know about our custom properties by default
// - Without this, TypeScript would show errors when we do req.user.id
//
// ============================================================================

import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email?: string;
        // Add other user properties as needed
    };
}
