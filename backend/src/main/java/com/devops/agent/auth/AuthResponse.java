package com.devops.agent.auth;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    UUID userId,
    String email,
    String fullName,
    UUID organizationId,
    String organizationName,
    String role
) {
    public static AuthResponse of(
            String accessToken,
            String refreshToken,
            UUID userId,
            String email,
            String fullName,
            UUID organizationId,
            String organizationName,
            String role
    ) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                userId,
                email,
                fullName,
                organizationId,
                organizationName,
                role
        );
    }
}
