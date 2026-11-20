package com.devops.agent.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b";
    private final long accessExpirationMs = 3600000; // 1 hour
    private final long refreshExpirationMs = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, accessExpirationMs, refreshExpirationMs);
    }

    @Test
    @DisplayName("Should generate and validate valid access token with claims")
    void testGenerateAndValidateAccessToken() {
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        String email = "sre@enterprise.com";
        String role = "SRE_ENGINEER";

        String token = jwtTokenProvider.generateAccessToken(userId, email, orgId, role);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
        assertEquals(orgId, jwtTokenProvider.getOrganizationIdFromToken(token));
        assertEquals(role, jwtTokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Should generate valid refresh token")
    void testGenerateRefreshToken() {
        UUID userId = UUID.randomUUID();
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        assertNotNull(refreshToken);
        assertTrue(jwtTokenProvider.validateToken(refreshToken));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(refreshToken));
    }

    @Test
    @DisplayName("Should reject malformed or tampered token")
    void testRejectInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.string"));
        assertFalse(jwtTokenProvider.validateToken(null));
    }
}
