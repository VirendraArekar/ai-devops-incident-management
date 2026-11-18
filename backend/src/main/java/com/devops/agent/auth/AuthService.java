package com.devops.agent.auth;

import com.devops.agent.common.BadRequestException;
import com.devops.agent.common.ResourceNotFoundException;
import com.devops.agent.common.UnauthorizedException;
import com.devops.agent.organization.Organization;
import com.devops.agent.organization.OrganizationMember;
import com.devops.agent.organization.OrganizationMemberRepository;
import com.devops.agent.organization.OrganizationRepository;
import com.devops.agent.security.JwtTokenProvider;
import com.devops.agent.security.UserPrincipal;
import com.devops.agent.user.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository memberRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        List<OrganizationMember> memberships = memberRepository.findByUserId(user.getId());
        Organization org = null;
        Role role = null;

        if (!memberships.isEmpty()) {
            OrganizationMember member = memberships.get(0);
            org = member.getOrganization();
            role = member.getRole();
        }

        UUID orgId = org != null ? org.getId() : null;
        String orgName = org != null ? org.getName() : null;
        String roleName = role != null ? role.getName() : "VIEWER";

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), orgId, roleName);
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        RefreshToken rt = new RefreshToken(user.getId(), refreshToken, Instant.now().plusSeconds(604800));
        refreshTokenRepository.save(rt);

        return AuthResponse.of(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                orgId,
                orgName,
                roleName
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User(email, passwordEncoder.encode(request.password()), request.fullName().trim());
        user = userRepository.save(user);

        String orgName = request.organizationName() != null && !request.organizationName().isBlank()
                ? request.organizationName().trim()
                : request.fullName().trim() + "'s Organization";
        String orgSlug = orgName.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (orgSlug.startsWith("-")) orgSlug = orgSlug.substring(1);
        if (orgSlug.isEmpty()) orgSlug = "org-" + UUID.randomUUID().toString().substring(0, 8);
        if (organizationRepository.existsBySlug(orgSlug)) {
            orgSlug = orgSlug + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Organization org = new Organization(orgName, orgSlug);
        org = organizationRepository.save(org);

        Role adminRole = roleRepository.findByName("ORG_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ORG_ADMIN", "Organization Admin")));

        OrganizationMember member = new OrganizationMember(org, user, adminRole);
        memberRepository.save(member);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), org.getId(), adminRole.getName());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        RefreshToken rt = new RefreshToken(user.getId(), refreshToken, Instant.now().plusSeconds(604800));
        refreshTokenRepository.save(rt);

        return AuthResponse.of(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                org.getId(),
                org.getName(),
                adminRole.getName()
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken rt = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (rt.isRevoked() || rt.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(rt);
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        User user = userRepository.findById(rt.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", rt.getUserId()));

        List<OrganizationMember> memberships = memberRepository.findByUserId(user.getId());
        Organization org = memberships.isEmpty() ? null : memberships.get(0).getOrganization();
        Role role = memberships.isEmpty() ? null : memberships.get(0).getRole();

        UUID orgId = org != null ? org.getId() : null;
        String orgName = org != null ? org.getName() : null;
        String roleName = role != null ? role.getName() : "VIEWER";

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), orgId, roleName);
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        rt.setToken(newRefreshToken);
        rt.setExpiresAt(Instant.now().plusSeconds(604800));
        refreshTokenRepository.save(rt);

        return AuthResponse.of(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                orgId,
                orgName,
                roleName
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        Organization org = null;
        if (principal.getOrganizationId() != null) {
            org = organizationRepository.findById(principal.getOrganizationId()).orElse(null);
        }

        return AuthResponse.of(
                null,
                null,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                org != null ? org.getId() : null,
                org != null ? org.getName() : null,
                principal.getRole()
        );
    }
}
