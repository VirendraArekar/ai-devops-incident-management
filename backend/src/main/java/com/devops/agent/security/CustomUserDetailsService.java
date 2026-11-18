package com.devops.agent.security;

import com.devops.agent.organization.OrganizationMember;
import com.devops.agent.organization.OrganizationMemberRepository;
import com.devops.agent.user.Permission;
import com.devops.agent.user.Role;
import com.devops.agent.user.User;
import com.devops.agent.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OrganizationMemberRepository memberRepository;

    public CustomUserDetailsService(UserRepository userRepository, OrganizationMemberRepository memberRepository) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<OrganizationMember> memberships = memberRepository.findByUserId(user.getId());
        UUID orgId = memberships.isEmpty() ? null : memberships.get(0).getOrganization().getId();
        Role role = memberships.isEmpty() ? null : memberships.get(0).getRole();
        String roleName = role != null ? role.getName() : "VIEWER";

        List<String> permissions = role != null && role.getPermissions() != null
                ? role.getPermissions().stream().map(Permission::getName).toList()
                : Collections.emptyList();

        return UserPrincipal.create(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                orgId,
                roleName,
                permissions
        );
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        List<OrganizationMember> memberships = memberRepository.findByUserId(user.getId());
        UUID orgId = memberships.isEmpty() ? null : memberships.get(0).getOrganization().getId();
        Role role = memberships.isEmpty() ? null : memberships.get(0).getRole();
        String roleName = role != null ? role.getName() : "VIEWER";

        List<String> permissions = role != null && role.getPermissions() != null
                ? role.getPermissions().stream().map(Permission::getName).toList()
                : Collections.emptyList();

        return UserPrincipal.create(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                orgId,
                roleName,
                permissions
        );
    }
}
